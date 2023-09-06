import EventEmitter from 'node:events';
import Fetch from './fetch.js';
import { Feature } from 'geojson';
import { EsriDumpConfig } from '../index.js';
import Schema from './schema.js';

export interface DiscoveryDocument {
    version?: string,
    collections: object[]
}

interface InternalService {
    name: string;
    service: string;
    url: URL;
}

export default class Discovery extends EventEmitter {
    baseUrl: URL;
    document: DiscoveryDocument;

    constructor(url: URL) {
        super();

        url.pathname = url.pathname.replace(/\/rest\/services.*/, '/rest/services');
        this.baseUrl = url;

        this.document = {
            version: undefined,
            collections: [],
        }

    }

    async fetch(config: EsriDumpConfig): Promise<any> {
        if (process.env.DEBUG) console.error(String(this.baseUrl));
        let base = await Fetch(config, this.baseUrl);
        if (!base.ok) return this.emit('error', await base.text());
        base = await base.json();

        this.document.version = String(base.version);

        await this.#request(config, base);

        this.emit('done');

        return this.document;
    }

    async #request(config: EsriDumpConfig, base: any)  {
        const services: InternalService[] = base.services.map((service: any) => {
            const url = new URL(this.baseUrl);
            url.pathname = url.pathname + '/' + service.name + '/' + service.type;
            return {
                url,
                name: String(service.name),
                type: String(service.type),
            };
        });

        services.push(...(await this.#folders(config, base.folders)));

        for (const service_meta of services) {
            const service = await this.#service(config, service_meta);
            this.emit('service', service);

            if (!service.layers) service.layers = [];
            for (const layer_meta of service.layers) {
                const url = new URL(service_meta.url)
                url.pathname = url.pathname + '/' + layer_meta.id;

                const layer = await this.#layer(config, url);
                layer.schema = Schema(layer);
                this.emit('layer', layer);
            }
        }
    }

    async #layer(config: EsriDumpConfig, layer_url: URL): Promise<any> {
        if (process.env.DEBUG) console.error(String(layer_url));

        const req = await Fetch(config, layer_url);
        if (!req.ok) {
            this.emit('error', await req.text());
        }

        const service = await req.json();

        return service;
    }

    async #service(config: EsriDumpConfig, service_meta: InternalService): Promise<any> {
        const url = new URL(service_meta.url);
        if (process.env.DEBUG) console.error(String(url));

        const req = await Fetch(config, url);
        if (!req.ok) {
            this.emit('error', await req.text());
        }

        const service = await req.json();

        return service;
    }

    async #folders(config: EsriDumpConfig, folders: string[]): Promise<any> {
        const services: any[] = [];

        for (const folder of folders) {
            const url = new URL(this.baseUrl);
            url.pathname = url.pathname + '/' + folder;
            if (process.env.DEBUG) console.error(String(url));

            let req = await Fetch(config, url);
            if (!req.ok) {
                this.emit('error', await req.text());
                return services;
            }

            req = await req.json();

            if (req.folders && Array.isArray(req.folders) && req.folders.length) {
                services.push(...await this.#folders(config, req.folders));
            }

            services.push(...req.services.map((service: any) => {
                const url = new URL(this.baseUrl);
                url.pathname = url.pathname + '/' + service.name + '/' + service.type;
                return {
                    url,
                    name: service.name,
                    type: service.type,
                };
            }));
        }

        return services;
    }
}

