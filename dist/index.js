import Geometry from './lib/geometry.js';
import Fetch from './lib/fetch.js';
import EventEmitter from 'node:events';
import Err from '@openaddresses/batch-error';
import rewind from './lib/rewind.js';
// Ref: https://help.arcgis.com/en/sdk/10.0/java_ao_adf/api/arcgiswebservices/com/esri/arcgisws/EsriFieldType.html
const Types = new Map([
    ['esriFieldTypeDate', 'string'],
    ['esriFieldTypeString', 'string'],
    ['esriFieldTypeDouble', 'number'],
    ['esriFieldTypeSingle', 'number'],
    ['esriFieldTypeOID', 'number'],
    ['esriFieldTypeInteger', 'integer'],
    ['esriFieldTypeSmallInteger', 'integer'],
    ['esriFieldTypeGeometry', 'object'],
    ['esriFieldTypeBlob', 'object'],
    ['esriFieldTypeGlobalID', 'string'],
    ['esriFieldTypeRaster', 'object'],
    ['esriFieldTypeGUID', 'string'],
    ['esriFieldTypeXML', 'string'],
]);
const SUPPORTED = ['FeatureServer', 'MapServer'];
export var EsriDumpConfigApproach;
(function (EsriDumpConfigApproach) {
    EsriDumpConfigApproach["BBOX"] = "bbox";
    EsriDumpConfigApproach["ITER"] = "iter";
})(EsriDumpConfigApproach || (EsriDumpConfigApproach = {}));
export var EsriResourceType;
(function (EsriResourceType) {
    EsriResourceType["FeatureServer"] = "FeatureServer";
    EsriResourceType["MapServer"] = "MapServer";
})(EsriResourceType || (EsriResourceType = {}));
export default class EsriDump extends EventEmitter {
    url;
    config;
    geomType;
    resourceType;
    constructor(url, config = {}) {
        super();
        this.url = new URL(url);
        this.config = {
            approach: config.approach || EsriDumpConfigApproach.BBOX,
            headers: config.headers || {},
            params: config.params || {}
        };
        // Validate URL is a "/rest/services/" endpoint
        if (!this.url.pathname.includes('/rest/services/'))
            throw new Err(400, null, 'Did not recognize ' + url + ' as an ArcGIS /rest/services/ endpoint.');
        this.geomType = null;
        const occurrence = SUPPORTED.map((d) => { return url.lastIndexOf(d); });
        const known = SUPPORTED[occurrence.indexOf(Math.max.apply(null, occurrence))];
        if (known === 'MapServer')
            this.resourceType = EsriResourceType.MapServer;
        else if (known === 'FeatureServer')
            this.resourceType = EsriResourceType.FeatureServer;
        else
            throw new Err(400, null, 'Unknown or unsupported ESRI URL Format');
        this.emit('type', this.resourceType);
    }
    async schema() {
        const metadata = await this.#fetchMeta();
        if (!metadata.fields && !Array.isArray(metadata.fields))
            throw new Err(400, null, 'No Fields array present in response');
        const doc = {
            type: 'object',
            required: [],
            additionalProperties: false,
            properties: {}
        };
        for (const field of metadata.fields) {
            const name = String(field.name);
            const type = Types.has(field.type) ? Types.get(field.type) : 'string';
            const prop = doc.properties[name] = {
                type
            };
            if (!isNaN(field.length) && type === 'string') {
                prop.maxLength = field.length;
            }
        }
        return doc;
    }
    async fetch() {
        const metadata = await this.#fetchMeta();
        try {
            const geom = new Geometry(this.url, metadata);
            geom.fetch(this.config);
            geom.on('feature', (feature) => {
                this.emit('feature', rewind(feature));
            }).on('error', (error) => {
                this.emit('error', error);
            }).on('done', () => {
                this.emit('done');
            });
        }
        catch (err) {
            this.emit('error', err);
        }
    }
    async #fetchMeta() {
        const url = new URL(this.url);
        url.searchParams.append('f', 'json');
        if (process.env.DEBUG)
            console.error(String(url));
        const res = await Fetch(this.config, url);
        if (!res.ok)
            this.emit('error', await res.text());
        // TODO: Type Defs
        const metadata = await res.json();
        if (metadata.error) {
            return this.emit('error', new Err(400, null, 'Server metadata error: ' + metadata.error.message));
        }
        else if (metadata.capabilities && metadata.capabilities.indexOf('Query') === -1) {
            return this.emit('error', new Err(400, null, 'Layer doesn\'t support query operation.'));
        }
        else if (metadata.folders || metadata.services) {
            let errorMessage = 'Endpoint provided is not a Server resource.\n';
            if (metadata.folders.length > 0) {
                errorMessage += '\nChoose a Layer from a Service in one of these Folders: \n  '
                    + metadata.folders.join('\n  ') + '\n';
            }
            if (metadata.services.length > 0 && Array.isArray(metadata.services)) {
                errorMessage += '\nChoose a Layer from one of these Services: \n  '
                    + metadata.services.map((d) => { return d.name; }).join('\n  ') + '\n';
            }
            return this.emit('error', new Err(400, null, errorMessage));
        }
        else if (metadata.layers) {
            let errorMessage = 'Endpoint provided is not a Server resource.\n';
            if (metadata.layers.length > 0 && Array.isArray(metadata.layers)) {
                errorMessage += '\nChoose one of these Layers: \n  '
                    + metadata.layers.map((d) => { return d.name; }).join('\n  ') + '\n';
            }
            return this.emit('error', new Err(400, null, errorMessage));
        }
        else if (!this.resourceType) {
            return this.emit('error', new Err(400, null, 'Could not determine server type of ' + url));
        }
        this.geomType = metadata.geometryType;
        if (!this.geomType) {
            return this.emit('error', new Err(400, null, 'no geometry'));
        }
        else if (!metadata.extent) {
            return this.emit('error', new Err(400, null, 'Layer doesn\'t list an extent.'));
        }
        else if ('subLayers' in metadata && metadata.subLayers.length > 0) {
            return this.emit('error', new Err(400, null, 'Specified layer has sublayers.'));
        }
        return metadata;
    }
}
//# sourceMappingURL=index.js.map