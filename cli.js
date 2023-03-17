#!/usr/bin/env node
import EsriDump from './index.js';

const url = process.argv[2];

if (!url) throw new Error('url required');

const esri = new EsriDump(url);

esri.on('error', (err) => {
    throw err;
}).on('feature', (feature) => {
    console.error(feature);
});

await esri.fetch();

