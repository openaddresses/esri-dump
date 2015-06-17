#!/usr/bin/env node

var esriDump = require('./'),
    url = process.argv[2],
    geojsonStream = require('geojson-stream');

if (!url) {
    throw new Error('url required');
}

esriDump(url).pipe(geojsonStream.stringify()).pipe(process.stdout);
