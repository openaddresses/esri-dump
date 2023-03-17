#!/usr/bin/env node
import geojsonStream from 'geojson-stream';
import EsriDump from './index.js';

const url = process.argv[2];

if (!url) throw new Error('url required');

const stream = new EsriDump(url);

stream.on('type', function(type){
  switch (type) {
    case 'FeatureServer':
    case 'MapServer':
      //If output is set save to disk, else stream
      stream.pipe(geojsonStream.stringify()).pipe(process.stdout);
      break;
  }
});

stream.on('error', function(error) {
  throw error;
});
