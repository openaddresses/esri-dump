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
var fetchBbox = function(url, bbox, oidField, existingFeatures, callback) {
    // Build up a URL that makes ESRI happy
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

    request.get({url: fullUrl, json:true}, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log(data.features.length + " features in the envelope.");

            if (data.features.length == 1000) {
                // If we get back the maximum number of results, break the
                // bbox up into 4 smaller chunks and request those.
                var subboxes = splitBbox(bbox);
                for (var i = 0; i < subboxes.length; i++) {
                    fetchBbox(url, subboxes[i], oidField, existingFeatures, callback);
                }
            } else {
                for (var j = 0; j < data.features.length; j++) {
                    var thisFeature = data.features[j],
                        thisFeatureOid = thisFeature.attributes[oidField];
                    if (!(thisFeatureOid in existingFeatures)) {
                        existingFeatures[thisFeatureOid] = thisFeature;
                    }
                }
                console.log(Object.keys(existingFeatures).length + " unique features");
            }
            return callback(null, existingFeatures);
        } else {
            return callback(error);
        }
    });
};
var findOidField = function(fields) {
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].type == 'esriFieldTypeOID') {
            return fields[i];
        }
    }
    return null;
};

var dump = module.exports = {};

dump.fetch = function(base_url, callback) {
    var results = {};

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

            var oidField = findOidField(metadata.fields);
            if (!oidField) {
                return callback("Could not find an OID field.");
            }

            if (metadata.subLayers.length > 0) {
                return callback("Specified layer has sublayers.");
            }

            // Start by requesting the whould bounding box for the layer
            return fetchBbox(base_url, bounds, oidField.name, results, callback);
        } else {
            return callback(error);
        }
    });
};

dump.fetch('http://maps.huntsvilleal.gov/ArcGIS/rest/services/Layers/Addresses/MapServer/3', function(error, results) {
    console.log("Results: " + error + ", " + Object.keys(results).length);
});