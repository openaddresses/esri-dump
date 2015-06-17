var test = require('tape');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

test('./cli.js', function(t) {
    exec(__dirname + '/../cli.js', function(err, stdout, stderr) {
        t.ok(stderr.match(/url required/), 'error on missing URL');
        t.end();
    });
});
