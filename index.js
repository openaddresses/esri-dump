var fs = require('fs'),
    request = require('request'),
    url = require('url'),
    queue = require('queue-async'),
    qs = require('querystring');

var splitBbox = function(bbox) {
    var halfWidth = (bbox.xmax - bbox.xmin) / 2.0,
        halfHeight = (bbox.ymax - bbox.ymin) / 2.0;
    return [
        {xmin: bbox.xmin,             ymin: bbox.ymin,              xmax: bbox.xmin + halfWidth, ymax: bbox.ymin + halfHeight},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin,              xmax: bbox.xmax,             ymax: bbox.ymin + halfHeight},
        {xmin: bbox.xmin,             ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax,             ymax: bbox.ymax}
    ];
};
var fetchBbox = function(url, bbox, callback) {
    var args = {
        geometry: bbox.xmin+","+bbox.ymin+","+bbox.xmax+","+bbox.ymax,
        geometryType: 'esriGeometryEnvelope',
        spatialRel: 'esriSpatialRelIntersects',
        returnCountOnly: false,
        returnIdsOnly: false,
        returnGeometry: true,
        outSR: 4326,
        outFields: '*',
        f: 'JSON'
    },
    fullUrl = url + '/query?' + qs.stringify(args);

    console.log(fullUrl);

    request.get({url: fullUrl, json:true}, callback);
};

var dump = module.exports = {};

dump.fetch = function(base_url, callback) {
    var results = {},
        q = queue(1);

    // Get the layer's metadata
    request.get({url: base_url + '?f=json', json:true}, function(error, response, metadata) {
        if (!error && response.statusCode == 200) {
            if (metadata.capabilities && metadata.capabilities.indexOf('Query') < 0) {
                return callback("Layer doesn't support query operation.");
            }

            var bounds = metadata.extent;

            if (!bounds) {
                return callback("Layer doesn't list an extent.");
            }

            fetchBbox(base_url, bounds, callback);
        } else {
            return callback(error);
        }
    });

    callback(null, results);
};

dump.fetch('http://gis.co.crow-wing.mn.us/arcgis/rest/services/CROWWINGGENERAL/MapServer/13', function(error, results, content) {
    console.log(content);
});