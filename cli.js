#!/usr/bin/env node

var esriDump = require('./'),
    url = process.argv[2];

if (!url) throw new Error('url required');

esriDump.fetchGeoJSON(url, function(err, features) {
    process.stdout.write(JSON.stringify(features));
});
