import { Readable } from 'node:stream'
import request from 'request';
import rings2geojson from './rings2geojson.js';

export default class Downloader extends Readable {
    constructor(url, metadata) {
        Readable.call(this, {
            objectMode: true
        });
        this.baseUrl = url;
        this.paths = [metadata.extent];
        this.geomType = metadata.geometryType;
        this.inProgress = 0;
        this.maxRecords = metadata.maxRecordCount || null;
        this.set = new Set();
        this.oidField = findOidField(metadata.fields);
    }

    _read = function () {
        const bounds = this.paths.pop();
        if (!bounds) {
            if (!this.inProgress) {
                this.push(null);
            }
            return;
        }

        this.inProgress++;
        const queryString = {
            geometry: encodeURI([bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax].join(',')),
            geometryType: 'esriGeometryEnvelope',
            spatialRel: 'esriSpatialRelIntersects',
            geometryPrecision: 7,
            returnGeometry: true,
            outSR: 4326,
            outFields: '*',
            f: 'json'
        };
        const fullUrl = this.baseUrl + '/query';

        let attempts = 0;
        const self = this;
        queryApi();

        function queryApi() {
            request({
                url: fullUrl, qs: queryString,
                maxRedirects: 5,
                json: true
            }, function (error, response, data) {
                if (error || response.statusCode !== 200) {
                    return self.emit('error', error);
                } else if (data && data.error) {
                    if (attempts < 3) {
                        attempts++;
                        queryApi();
                    } else {
                        return self.emit('error', 'Query of ' + fullUrl + ' unsuccessful: ' + data.error.details);
                    }
                } else if (data && data.features) {
                    if (self.maxRecords === null && self.inProgress === 1) {
                        // Since we can't reliably get the configured maximum result size from the server,
                        // assume that the first request will exceed it and use the results length
                        // to set the maxRecords value for further requests.
                        self.maxRecords = data.features.length;
                    }
                    if (data.exceededTransferLimit || data.features.length === self.maxRecords) {
                        // If we get back the maximum number of results, break the
                        // bbox up into 4 smaller chunks and request those.
                        splitBbox(bounds).forEach(function (subbox) {
                            self.paths.push(subbox);
                        });
                        self.inProgress--;
                        self._read();
                    } else {
                        let full = false;
                        data.features.forEach(function (feature) {
                            if (!self.set.has(feature.attributes[self.oidField])) {
                                self.set.add(feature.attributes[self.oidField]);

                                if (!this.toGeoJSON(feature)) {
                                    full = true;
                                }
                            }
                        });
                        self.inProgress--;
                        if (!full) {
                            self._read();
                        }
                    }
                } else if (!data) {
                    return self.emit('error', 'Data from' + fullUrl + ' undefined');
                } else {
                    return self.emit('error', 'Error with ' + fullUrl);
                }
            });
        }
    }

    toGeoJSON(feature) {
        if (this.geomType === 'esriGeometryPolygon') {
            return this.push({
                type: 'Feature',
                properties: feature.attributes,
                geometry: rings2geojson(feature.geometry.rings)
            });
        } else if (this.geomType === 'esriGeometryPolyline') {
            return this.push({
                type: 'Feature',
                properties: feature.attributes,
                geometry: {
                    type: 'MultiLineString',
                    coordinates: feature.geometry.paths,
                }
            });
        } else if (this.geomType === 'esriGeometryPoint') {
            return this.push({
                type: 'Feature',
                properties: feature.attributes,
                geometry: {
                    type: 'Point',
                    coordinates: [feature.geometry.x, feature.geometry.y]
                }
            });
        }
    }
}

function splitBbox(bbox) {
    const halfWidth = (bbox.xmax - bbox.xmin) / 2.0;
    const halfHeight = (bbox.ymax - bbox.ymin) / 2.0;

    return [
        {xmin: bbox.xmin, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmax},
        {xmin: bbox.xmin, ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax, ymax: bbox.ymax}
    ];
}
function findOidField(fields) {
    const oidField = fields.filter(function (field) {
        return (field.type === 'esriFieldTypeOID');
    })[0];

    if (oidField) {
        return oidField.name
    } else {
        const possibleIds = ['OBJECTID', 'objectid', 'FID', 'ID', 'fid', 'id'];
        const nextBestOidField = fields.filter(function (field) {
            return (possibleIds.indexOf(field.name) > -1);
        }).sort(function(a,b) {
            return possibleIds.indexOf(a.name) - possibleIds.indexOf(b.name);
        })[0];
        if (nextBestOidField) {
            return nextBestOidField.name;
        } else {
            throw new Error('Could not determine OBJECTID field.');
        }
    }
}

export {
    splitBbox,
    findOidField
}
