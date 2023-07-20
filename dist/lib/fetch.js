export default async function Fetch(config, url, opts = {}) {
    if (!config.headers)
        config.headers = {};
    if (!config.params)
        config.params = {};
    for (const param in config.params)
        url.searchParams.append(param, config.params[param]);
    if (opts.headers)
        Object.assign(opts.headers, config.headers);
    const headers = new Headers();
    for (const header in opts.headers) {
        headers.set(header, opts.headers[header]);
    }
    return await fetch(url, {
        ...opts,
        headers
    });
}
//# sourceMappingURL=fetch.js.map