import { EsriDumpConfig } from '../index.js';

// TODO: Remove this once TypeScript has fetch definitions for core node
export interface FetchRequest {
    method?: string;
    headers?: {
        [k: string]: string;
    };
}

export default async function Fetch(
    config: EsriDumpConfig,
    url: URL,
    opts: FetchRequest = {}
): Promise<any> {
    url = new URL(url);

    if (!config.headers) config.headers = {};
    if (!config.params) config.params = {};

    for (const param in config.params) url.searchParams.append(param, config.params[param]);

    url.searchParams.append('f', 'json');

    if (opts.headers) Object.assign(opts.headers, config.headers);

    const headers: HeadersInit = new Headers();
    headers.set('Accept-Encoding', 'gzip');

    for (const header in opts.headers) {
        headers.set(header, opts.headers[header]);
    }

    return await fetch(url, {
        ...opts,
        headers
    });
}
