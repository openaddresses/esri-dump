#!/usr/bin/env node
import EsriDump from './index.js';
import minimist from 'minimist';

const argv = minimist(process.argv, {
    string: ['approach'],
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
    console.log('  --approach [approach]    Download Approach');
    console.log('             "bbox"        Download features by iterating over bboxes');
    console.log('                             slowest but most reliable approach');
    console.log('             "iter"        Iterate over OIDs');
    console.log('                             faster but not supported by all servers');
    console.log('Mode: schema <url>');
    console.log();
    process.exit();
}

if (!argv._[2]) throw new Error('Mode required');

const url = argv._[3];
if (!url) throw new Error('url required');

const esri = new EsriDump(url, {
    approach: argv.approach
});


if (argv._[2] === 'fetch') {
    esri.on('error', (err) => {
        throw err;
    }).on('feature', (feature) => {
        console.log(JSON.stringify(feature));
    });

    await esri.fetch();
} else if (argv._[2] === 'schema') {
    await esri.schema();
} else {
    throw new Error('Unknown Mode');
}

