#!/usr/bin/env tsx

import { parseArgs } from 'node:util';
import EsriDump, { EsriDumpConfigApproach } from './index.js';

function parseApproach(value?: string): EsriDumpConfigApproach | undefined {
    if (!value) return undefined;

    if (Object.values(EsriDumpConfigApproach).includes(value as EsriDumpConfigApproach)) {
        return value as EsriDumpConfigApproach;
    }

    throw new Error(`Unknown approach: ${value}`);
}

const argv = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
        help: {
            type: 'boolean',
            default: false
        },
        approach: {
            type: 'string'
        },
        header: {
            type: 'string',
            multiple: true,
            default: []
        }
    }
});

if (argv.values.help) {
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
    console.log('Mode: tilejson <url>');
    console.log('  Return a TileJSON Fragment for a given layer');
    console.log('Mode: stylejson <url>');
    console.log('  Return a MapLibre Style for a given layer');
    console.log('Mode: discover <url>');
    console.log('  Locate all geospatial layers on a given server');
    console.log();
    process.exit();
}

const mode = argv.positionals[0];
if (!mode) throw new Error('Mode required');

const url = argv.positionals[1];
if (!url) throw new Error('url required');

const headers: Record<string, string> = {};
for (const header of argv.values.header) {
        const parsed = header.split('=');
        headers[parsed[0]] = parsed.slice(1, parsed.length).join('=');
}


const esri = new EsriDump(url, {
    approach: parseApproach(argv.values.approach),
    headers
});


if (mode === 'fetch') {
    esri.on('error', (err) => {
        console.error(err);
    }).on('feature', (feature) => {
        console.log(JSON.stringify(feature));
    });

    await esri.fetch();
} else if (mode === 'schema') {
    console.log(JSON.stringify(await esri.schema(), null, 4));
} else if (mode === 'tilejson') {
    console.log(JSON.stringify(await esri.tilejson(), null, 4));
} else if (mode === 'stylejson') {
    console.log(JSON.stringify(await esri.stylejson(), null, 4));
} else if (mode === 'discover') {
    esri.on('error', (err) => {
        console.error(err);
    }).on('service', (service) => {
        console.log(JSON.stringify(service));
    }).on('layer', (layer) => {
        console.log(JSON.stringify(layer));
    });

    await esri.discover();
} else {
    throw new Error('Unknown Mode');
}

