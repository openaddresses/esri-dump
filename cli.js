#!/usr/bin/env node
'use strict';

var esriDump = require('./'),
    url = process.argv[2],
    geojsonStream = require('geojson-stream');

if (!url) {
    throw new Error('url required');
}

var stream = esriDump(url);

stream.on('type', function(type){
    if (type === 'MapServer') {
        //If output is set save to disk, else stream
        stream.pipe(geojsonStream.stringify()).pipe(process.stdout);
    } else if (type === 'ImageServer') {

        //If output is set, download, else stream
        stream.pipe(geojsonStream.stringify()).pipe(process.stdout);
    }
});
