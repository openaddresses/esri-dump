import EventEmitter from 'node:events';
import rings2geojson from './rings2geojson.js';

export default class Geometry extends EventEmitter {
    constructor(url, metadata) {
        super();

        this.baseUrl = url;
        this.paths = [metadata.extent];
        this.geomType = metadata.geometryType;
        this.inProgress = 0;
        this.maxRecords = metadata.maxRecordCount || null;
        this.set = new Set();
        this.oidField = Geometry.findOidField(metadata.fields);
    }

    async fetch() {
        const bounds = this.paths.pop();
        if (!bounds) {
            if (!this.inProgress) {
                this.push(null);
            }
            return;
        }

        this.inProgress++;

        const url = new URL(String(this.baseUrl) + '/query');
        url.searchParams.append('geometry', [bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax].join(','));
        url.searchParams.append('geometryType', 'esriGeometryEnvelope');
        url.searchParams.append('spatialRel', 'esriSpatialRelIntersects');
        url.searchParams.append('geometryPrecision', '7');
        url.searchParams.append('returnGeometry', true);
        url.searchParams.append('outSR', '4326');
        url.searchParams.append('outFields', '*');
        url.searchParams.append('f', 'json');

        let attempts = 0;

        while (attempts <= 5) {
            attempts++;

            const res = await fetch(url);

            if (!res.ok) return this.emit('error', await res.text());

            const data = await res.json();

            if (data && data.error) continue;

            if (data && data.features) {
                if (this.maxRecords === null && this.inProgress === 1) {
                    // Since we can't reliably get the configured maximum result size from the server,
                    // assume that the first request will exceed it and use the results length
                    // to set the maxRecords value for further requests.
                    this.maxRecords = data.features.length;
                }

                if (data.exceededTransferLimit || data.features.length === this.maxRecords) {
                    // If we get back the maximum number of results, break the
                    // bbox up into 4 smaller chunks and request those.
                    Geometry.splitBbox(bounds).forEach((subbox) => {
                        this.paths.push(subbox);
                    });
                    this.inProgress--;
                    this._read();
                } else {
                    let full = false;
                    data.features.forEach((feature) => {
                        if (!this.set.has(feature.attributes[self.oidField])) {
                            this.set.add(feature.attributes[self.oidField]);

                            if (!Geometry.toGeoJSON(feature)) {
                                full = true;
                            }
                        }
                    });

                    this.inProgress--;
                }
            } else if (!data) {
                return self.emit('error', 'Data from' + fullUrl + ' undefined');
            } else {
                return self.emit('error', 'Error with ' + fullUrl);
            }
        }

        if (attempts > 5) return this.emit('error', 'Query of ' + fullUrl + ' unsuccessful: ' + data.error.details);
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
                    coordinates: feature.geometry.paths
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

    static splitBbox(bbox) {
        const halfWidth = (bbox.xmax - bbox.xmin) / 2.0;
        const halfHeight = (bbox.ymax - bbox.ymin) / 2.0;

        return [
            { xmin: bbox.xmin, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth },
            { xmin: bbox.xmin + halfWidth, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmax },
            { xmin: bbox.xmin, ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax },
            { xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax, ymax: bbox.ymax }
        ];
    }

    static findOidField(fields) {
        const oidField = fields.filter((field) => {
            return (field.type === 'esriFieldTypeOID');
        })[0];

        if (oidField) {
            return oidField.name;
        } else {
            const possibleIds = ['OBJECTID', 'objectid', 'FID', 'ID', 'fid', 'id'];
            const nextBestOidField = fields.filter((field) => {
                return (possibleIds.indexOf(field.name) > -1);
            }).sort((a,b) => {
                return possibleIds.indexOf(a.name) - possibleIds.indexOf(b.name);
            })[0];
            if (nextBestOidField) {
                return nextBestOidField.name;
            } else {
                throw new Error('Could not determine OBJECTID field.');
            }
        }
    }
}

