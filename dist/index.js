import Geometry from './lib/geometry.js';
import Discovery from './lib/discovery.js';
import Fetch from './lib/fetch.js';
import EventEmitter from 'node:events';
import Err from '@openaddresses/batch-error';
import rewind from './lib/rewind.js';
import Schema from './lib/schema.js';
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
        return Schema(metadata);
    }
    async discover() {
        try {
            const discover = new Discovery(this.url);
            discover.fetch(this.config);
            discover.on('layer', (layer) => {
                this.emit('layer', layer);
            }).on('schema', (schema) => {
                this.emit('schema', schema);
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
    async fetch(config) {
        if (!config)
            config = {};
        const metadata = await this.#fetchMeta();
        try {
            const geom = new Geometry(this.url, metadata);
            geom.fetch(this.config);
            geom.on('feature', (feature) => {
                feature = rewind(feature);
                if (config.map)
                    feature = config.map(geom, feature);
                this.emit('feature', feature);
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
export { Geometry };
//# sourceMappingURL=index.js.map