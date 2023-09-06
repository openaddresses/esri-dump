export default async function Fetch(config, url, opts = {}) {
    if (!config.headers)
        config.headers = {};
    if (!config.params)
        config.params = {};
    for (const param in config.params)
        url.searchParams.append(param, config.params[param]);
    url.searchParams.append('f', 'json');
    if (opts.headers)
        Object.assign(opts.headers, config.headers);
    const headers = new Headers();
    headers.set('Accept-Encoding', 'gzip');
    for (const header in opts.headers) {
        headers.set(header, opts.headers[header]);
    }
    return await fetch(url, {
        ...opts,
        headers
    });
}
//# sourceMappingURL=fetch.js.map