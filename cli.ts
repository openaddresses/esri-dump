#!/usr/bin/env node
import EsriDump from './index.js';

interface CliArgs {
    help: boolean;
    approach?: string;
    header: string[];
    positionals: string[];
}

function parseArgs(args: string[]): CliArgs {
    const parsed: CliArgs = {
        help: false,
        header: [],
        positionals: []
    };

    for (let index = 0; index < args.length; index++) {
        const arg = args[index];

        if (arg === '--help') {
            parsed.help = true;
            continue;
        }

        if (arg === '--approach') {
            const value = args[index + 1];
            if (!value || value.startsWith('--')) throw new Error('--approach requires a value');
            parsed.approach = value;
            index++;
            continue;
        }

        if (arg.startsWith('--approach=')) {
            parsed.approach = arg.slice('--approach='.length);
            continue;
        }

        if (arg === '--header') {
            const value = args[index + 1];
            if (!value || value.startsWith('--')) throw new Error('--header requires a value');
            parsed.header.push(value);
            index++;
            continue;
        }

        if (arg.startsWith('--header=')) {
            parsed.header.push(arg.slice('--header='.length));
            continue;
        }

        parsed.positionals.push(arg);
    }

    return parsed;
}

const argv = parseArgs(process.argv.slice(2));

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
    console.log('Mode: tilejson <url>');
    console.log('  Return a TileJSON Fragment for a given layer');
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
for (const header of argv.header) {
        const parsed = header.split('=');
        headers[parsed[0]] = parsed.slice(1, parsed.length).join('=');
}


const esri = new EsriDump(url, {
    approach: argv.approach,
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

