import Geometry from './lib/geometry.js';
import EventEmitter from 'node:events';

const SUPPORTED = ['FeatureServer', 'MapServer', 'ImageServer'];

export default class EsriDump extends EventEmitter {
    constructor(url) {
        super();

        this.url = new URL(url);

        // Validate URL is a "/rest/services/" endpoint
        if (url.pathname.indexOf('/rest/services/') === -1) throw new Error('Did not recognize ' + url + ' as an ArcGIS /rest/services/ endpoint.');

        this.geomType = null;

        const occurrence = SUPPORTED.map(function(d) { return url.lastIndexOf(d) });
        this.resourceType = SUPPORTED[occurrence.indexOf(Math.max.apply(null, occurrence))];
    }

    async fetch() {
        const url = new (this.url);
        url.searchParams.append('f', 'json');

        const res = await fetch(url);

        if (!res.ok) this.emit('error', await res.text());

        const meteadata = await res.json();

        if (metadata.error) {
            return this.emit('error', new Error('Server metadata error: ' + metadata.error.message));
        } else if (metadata.capabilities && metadata.capabilities.indexOf('Query') === -1 ) {
            return this.emit('error', new Error('Layer doesn\'t support query operation.'));
        } else if (metadata.folders|| metadata.services) {
            const errorMessage = 'Endpoint provided is not a Server resource.\n';
            if (metadata.folders.length > 0) {
                errorMessage += '\nChoose a Layer from a Service in one of these Folders: \n  '
                    + metadata.folders.join('\n  ') + '\n';
            }

            if (metadata.services.length > 0) {
                errorMessage += '\nChoose a Layer from one of these Services: \n  '
                    + metadata.services.map(function(d) { return d.name }).join('\n  ') + '\n';
            }

            return this.emit('error', new Error(errorMessage));
        } else if (metadata.layers) {
            const errorMessage = 'Endpoint provided is not a Server resource.\n';
            if (metadata.layers.length > 0) {
                errorMessage += '\nChoose one of these Layers: \n  '
                    + metadata.layers.map(function(d) { return d.name }).join('\n  ') + '\n';
            }
            return this.emit('error', new Error(errorMessage));
        } else {
            return this.emit('error', new Error('Could not determine server type of ' + url));
        }

        this.geomType = metadata.geometryType;

        if (!geomType) {
            return this.emit('error', new Error('no geometry'));
        } else if (!metadata.extent) {
            return this.emit('error', new Error('Layer doesn\'t list an extent.'));
        } else if ('subLayers' in metadata && metadata.subLayers.length > 0) {
            return this.emit('error', new Error('Specified layer has sublayers.'));
        }

        new Geometry(url, metadata).pipe(out);
    }
};
