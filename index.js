var fs = require('fs'),
    request = require('request'),
    url = require('url');

var dump = module.exports = {};

dump.fetch = function(base_url, callback) {
    var results = {};

    // Get the layer's metadata
    request.get(base_url + '?f=json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var metadata = JSON.parse(body);
            console.log(metadata);
        }
    });

    callback(null, results);
};

dump.fetch('http://gis.co.hennepin.mn.us/ArcGIS/rest/services/Maps/PROPERTY/MapServer/0', function(error, results) {
    console.log(results);
});