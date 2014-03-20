var fs = require('fs'),
    request = require('request'),
    url = require('url'),
    queue = require('queue-async'),
    qs = require('querystring');

function splitBbox(bbox) {
    var halfWidth = (bbox.xmax - bbox.xmin) / 2.0,
        halfHeight = (bbox.ymax - bbox.ymin) / 2.0;
    return [
        {xmin: bbox.xmin, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight},
        {xmin: bbox.xmin, ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax, ymax: bbox.ymax}
    ];
}

function fetchBbox(base_url, bounds, oidField, existingFeatures, queue, callback) {
    // Build up a URL that makes ESRI happy
    var queryString = {
        geometry: [bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax].join(','),
        geometryType: 'esriGeometryEnvelope',
        spatialRel: 'esriSpatialRelIntersects',
        geometryPrecision: 7,
        returnGeometry: true,
        outSR: 4326,
        outFields: '*',
        f: 'JSON'
    },
    fullUrl = base_url + '/query?' + qs.stringify(queryString);

    request.get({url: fullUrl, json:true}, function(error, response, data) {
        if (error || response.statusCode != 200) return callback(error);
        if (data.features.length == 1000) {
            // If we get back the maximum number of results, break the
            // bbox up into 4 smaller chunks and request those.
            splitBbox(bounds).forEach(function(subbox) {
                queue.defer(fetchBbox, base_url, subbox, oidField, existingFeatures, queue);
            });
        } else {
            data.features.forEach(function(feature) {
                featureOid = feature.attributes[oidField];
                if (!(featureOid in existingFeatures)) {
                    existingFeatures[featureOid] = feature;
                }
            });
        }
        return callback(null, null);
    });
}

function findOidField(fields) {
    return fields.filter(function(field) {
        return (field.type == 'esriFieldTypeOID');
    })[0];
}

module.exports.fetch = fetch;
module.exports.fetchGeoJSON = fetchGeoJSON;

function fetch(base_url, callback) {
    var results = {},
        q = queue(4);

    // Get the layer's metadata
    request.get({ url: base_url + '?f=json', json: true }, onload);

    function onload(error, response, metadata) {
        if (error || response.statusCode != 200) {
            return callback(error);
        }
        if (metadata.capabilities && metadata.capabilities.indexOf('Query') < 0) {
            return callback("Layer doesn't support query operation.");
        }

        var oidField = findOidField(metadata.fields);

        if (!metadata.extent) return callback("Layer doesn't list an extent.");
        if (!oidField) return callback("Could not find an OID field.");

        if ('subLayers' in metadata && metadata.subLayers.length > 0) {
            return callback("Specified layer has sublayers.");
        }

        // Start by requesting the world bounding box for the layer
        q.defer(fetchBbox, base_url, metadata.extent, oidField.name, results, q);
        q.awaitAll(function(error, data) {
           var features = [];
           Object.keys(results).forEach(function(key) {
               features.push(results[key]);
           });
           return callback(error, metadata.geometryType, features);
        });
    }
}

function fetchGeoJSON(url, callback) {
    fetch(url, function(error, geomType, results) {

        if (error) return callback(error);

        geojson = {
            type: 'FeatureCollection',
            features: []
        };

        results.forEach(function(feature) {
            if (geomType == 'esriGeometryPolygon') {
                geojson.features.push({
                    type: 'Feature',
                    properties: feature.attributes,
                    geometry: {
                        type: 'Polygon',
                        coordinates: feature.geometry.rings,
                    }
                });
            } else if (geomType == 'esriGeometryPolyline') {
                geojson.features.push({
                    type: 'Feature',
                    properties: feature.attributes,
                    geometry: {
                        type: 'MultiLineString',
                        coordinates: feature.geometry.paths,
                    }
                });
            } else if (geomType == 'esriGeometryPoint') {
                geojson.features.push({
                    type: 'Feature',
                    properties: feature.attributes,
                    geometry: {
                        type: 'Point',
                        coordinates: [feature.geometry.x, feature.geometry.y]
                    }
                });
            }
        });

        callback(null, geojson);
    });
}
