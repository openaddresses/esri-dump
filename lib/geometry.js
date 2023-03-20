import EventEmitter from 'node:events';
import rings2geojson from './rings2geojson.js';

export default class Geometry extends EventEmitter {
    constructor(url, metadata) {
        super();

        this.baseUrl = url;
        this.paths = [metadata.extent];

        this.geomType = metadata.geometryType;
        this.maxRecords = metadata.maxRecordCount || null;
        this.set = new Set();
        this.oidField = Geometry.findOidField(metadata.fields);
    }

    async fetch() {
        while(this.paths.length) {
            const bounds = this.paths.pop();

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

            let data = null;
            while (attempts <= 5) {
                attempts++;

                if (process.env.DEBUG) console.error(String(url));
                const res = await fetch(url);

                if (!res.ok) return this.emit('error', await res.text());

                data = await res.json();

                if (data && data.error) continue;

                if (data && data.features) {
                    if (this.maxRecords === null) {
                        // Since we can't reliably get the configured maximum result size from the server,
                        // assume that the first request will exceed it and use the results length
                        // to set the maxRecords value for further requests.
                        this.maxRecords = data.features.length;
                    }

                    if (data.exceededTransferLimit || data.features.length === this.maxRecords) {
                        // If we get back the maximum number of results, break the
                        // bbox up into 4 smaller chunks and request those.
                        Geometry.splitBbox(bounds).forEach((subbox) => { this.paths.push(subbox) });
                    } else {
                        for (const feature of data.features) {
                            if (!this.set.has(feature.attributes[this.oidField])) {
                                this.set.add(feature.attributes[this.oidField]);
                                this.emit('feature', this.toGeoJSON(feature));
                            }
                        }
                    }

                    break;
                } else if (!data) {
                    return this.emit('error', 'Data from' + url + ' undefined');
                } else {
                    return this.emit('error', 'Error with ' + url);
                }
            }

            if (attempts > 5) return this.emit('error', 'Query of ' + url + ' unsuccessful: ' + data.error.details);
        }
    }

    toGeoJSON(feature) {
        if (this.geomType === 'esriGeometryPolygon') {
            return {
                type: 'Feature',
                properties: feature.attributes,
                geometry: rings2geojson(feature.geometry.rings)
            }
        } else if (this.geomType === 'esriGeometryPolyline') {
            return {
                type: 'Feature',
                properties: feature.attributes,
                geometry: {
                    type: 'MultiLineString',
                    coordinates: feature.geometry.paths
                }
            }
        } else if (this.geomType === 'esriGeometryPoint') {
            return {
                type: 'Feature',
                properties: feature.attributes,
                geometry: {
                    type: 'Point',
                    coordinates: [feature.geometry.x, feature.geometry.y]
                }
            }
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

