'use strict';
var test = require('tape');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var ESRI = require('./server.js');

test('./cli.js', function(t) {
    exec(__dirname + '/../cli.js', function(err, stdout, stderr) {
        t.ok(stderr.match(/url required/), 'error on missing URL');
        t.end();
    });
});

//There are multiple ways to download images, this test assumes the server allows
// the Download function (lib/imagery_raw.js)
test('./cli.js ImageServer download', function(t) {
    new ESRI({mode: 'download'}, function(stop) {
        exec(__dirname + '/../cli.js http://localhost:3000/arcgis/rest/services/images/ImageServer', function(err, stdout, stderr) {
            t.equals(stderr, '', 'no errors');
            t.deepEquals(JSON.parse(stdout), require('./fixtures/pass-imageserver.json'), 'geometry object');
            stop(t.end);
        });
    });
});

//At the moment esri-dump will only process ImageServers that allow downloading the raw data
// if it can't download the raw data it will fail. Once esri-dump supports more raster download
// types, this test can be updated.
test('./cli.js ImageServer noDownload', function(t) {
    new ESRI({mode: 'noDownload'}, function(stop) {
        exec(__dirname + '/../cli.js http://localhost:3000/arcgis/rest/services/images/ImageServer', function(err, stdout, stderr) {
            t.ok(stderr.match(/Layer doesn't support download operation/), 'ImageServer doesn\'t allow downloading raw files');
            stop(t.end);
        });
    });
});
