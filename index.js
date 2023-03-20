import Geometry from './lib/geometry.js';
import EventEmitter from 'node:events';

const SUPPORTED = ['FeatureServer', 'MapServer', 'ImageServer'];

export default class EsriDump extends EventEmitter {
    constructor(url) {
        super();

        this.url = new URL(url);

        // Validate URL is a "/rest/services/" endpoint
        if (!this.url.pathname.includes('/rest/services/')) throw new Error('Did not recognize ' + url + ' as an ArcGIS /rest/services/ endpoint.');

        this.geomType = null;

        const occurrence = SUPPORTED.map((d) => { return url.lastIndexOf(d); });
        this.resourceType = SUPPORTED[occurrence.indexOf(Math.max.apply(null, occurrence))];
    }

    async fetch() {
        const url = new URL(this.url);
        url.searchParams.append('f', 'json');

        if (process.env.DEBUG) console.error(String(url));
        const res = await fetch(url);

        if (!res.ok) this.emit('error', await res.text());

        const metadata = await res.json();

        if (metadata.error) {
            return this.emit('error', new Error('Server metadata error: ' + metadata.error.message));
        } else if (metadata.capabilities && metadata.capabilities.indexOf('Query') === -1 ) {
            return this.emit('error', new Error('Layer doesn\'t support query operation.'));
        } else if (metadata.folders || metadata.services) {
            let errorMessage = 'Endpoint provided is not a Server resource.\n';
            if (metadata.folders.length > 0) {
                errorMessage += '\nChoose a Layer from a Service in one of these Folders: \n  '
                    + metadata.folders.join('\n  ') + '\n';
            }

            if (metadata.services.length > 0) {
                errorMessage += '\nChoose a Layer from one of these Services: \n  '
                    + metadata.services.map((d) => { return d.name; }).join('\n  ') + '\n';
            }

            return this.emit('error', new Error(errorMessage));
        } else if (metadata.layers) {
            let errorMessage = 'Endpoint provided is not a Server resource.\n';
            if (metadata.layers.length > 0) {
                errorMessage += '\nChoose one of these Layers: \n  '
                    + metadata.layers.map((d) => { return d.name; }).join('\n  ') + '\n';
            }
            return this.emit('error', new Error(errorMessage));
        } else if (!this.resourceType) {
            return this.emit('error', new Error('Could not determine server type of ' + url));
        }

        this.geomType = metadata.geometryType;

        if (!this.geomType) {
            return this.emit('error', new Error('no geometry'));
        } else if (!metadata.extent) {
            return this.emit('error', new Error('Layer doesn\'t list an extent.'));
        } else if ('subLayers' in metadata && metadata.subLayers.length > 0) {
            return this.emit('error', new Error('Specified layer has sublayers.'));
        }

        try {
            const geom = new Geometry(this.url, metadata);
            geom.fetch();

            geom.on('feature', (feature) => {
                this.emit('feature', feature);
            }).on('error', (error) => {
                this.emit('error', error);
            }).on('done', () => {
                this.emit('done');
            });
        } catch (err) {
            this.emit('error', err);
        }
    }
}
