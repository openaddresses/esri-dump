'use strict';
const test = require('tape');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const ESRI = require('./server.js');

test('./cli.js', (t) => {
    exec(__dirname + '/../cli.js', (err, stdout, stderr) => {
        t.ok(stderr.match(/url required/), 'error on missing URL');
        t.end();
    });
});

// There are multiple ways to download images, this test assumes the server allows
// the Download function (lib/imagery_raw.js)
test('./cli.js ImageServer download', (t) => {
    new ESRI({ mode: 'download' }, ((stop) => {
        exec(__dirname + '/../cli.js http://localhost:3000/arcgis/rest/services/images/ImageServer', (err, stdout, stderr) => {
            t.equals(stderr, '', 'no errors');
            t.deepEquals(JSON.parse(stdout), require('./fixtures/pass-imageserver.json'), 'geometry object');
            stop(t.end);
        });
    }));
});

// At the moment esri-dump will only process ImageServers that allow downloading the raw data
// if it can't download the raw data it will fail. Once esri-dump supports more raster download
// types, this test can be updated.
test('./cli.js ImageServer noDownload', (t) => {
    new ESRI({ mode: 'noDownload' }, ((stop) => {
        exec(__dirname + '/../cli.js http://localhost:3000/arcgis/rest/services/images/ImageServer', (err, stdout, stderr) => {
            t.ok(stderr.match(/Layer doesn't support download operation/), 'ImageServer doesn\'t allow downloading raw files');
            stop(t.end);
        });
    }));
});
