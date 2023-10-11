#!/usr/bin/env node
import EsriDump from './index.js';
import minimist from 'minimist';
const argv = minimist(process.argv, {
    string: ['approach', 'header'],
    boolean: ['help']
});
if (argv.help) {
    console.log();
    console.log('Usage:');
    console.log('  node cli.js [mode] [--help]');
    console.log();
    console.log('Args:');
    console.log('  --help                   Display this message');
    console.log('Mode: fetch [--approach] <url>');
    console.log('  Retrieve all geospatial features from a single layer');
    console.log('  --header \'key=value\'   IE --header \'Content-Type=123\'');
    console.log('  --approach [approach]    Download Approach');
    console.log('             "bbox"        Download features by iterating over bboxes');
    console.log('                             slowest but most reliable approach');
    console.log('             "iter"        Iterate over OIDs');
    console.log('                             faster but not supported by all servers');
    console.log('Mode: schema <url>');
    console.log('  Return a JSON Schema for a given layer');
    console.log('Mode: discover <url>');
    console.log('  Locate all geospatial layers on a given server');
    console.log();
    process.exit();
}
if (!argv._[2])
    throw new Error('Mode required');
const url = argv._[3];
if (!url)
    throw new Error('url required');
const headers = {};
if (argv.header) {
    if (typeof argv.header === 'string')
        argv.header = [argv.header];
    for (const header of argv.header) {
        const parsed = header.split('=');
        headers[parsed[0]] = parsed.slice(1, parsed.length).join('=');
    }
}
const esri = new EsriDump(url, {
    approach: argv.approach,
    headers
});
if (argv._[2] === 'fetch') {
    esri.on('error', (err) => {
        console.error(err);
    }).on('feature', (feature) => {
        console.log(JSON.stringify(feature));
    });
    await esri.fetch();
}
else if (argv._[2] === 'schema') {
    console.log(JSON.stringify(await esri.schema(), null, 4));
}
else if (argv._[2] === 'discover') {
    esri.on('error', (err) => {
        console.error(err);
    }).on('service', (service) => {
        console.log(JSON.stringify(service));
    }).on('layer', (layer) => {
        console.log(JSON.stringify(layer));
    });
    await esri.discover();
}
else {
    throw new Error('Unknown Mode');
}
//# sourceMappingURL=cli.js.map