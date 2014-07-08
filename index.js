'use strict';
var through = require('through2').obj;
var request = require('request');
var Downloader = require('./stream');
var rings2geojson = require('./rings2geojson');
module.exports = function (url) {
    var geomType;
    var out = through(function (feature, _, callback) {
        var s = this;
        if (geomType === 'esriGeometryPolygon') {
            s.push({
                type: 'Feature',
                properties: feature.attributes,
                geometry: rings2geojson(feature.geometry.rings)
            });
        } else if (geomType === 'esriGeometryPolyline') {
            s.push({
                type: 'Feature',
                properties: feature.attributes,
                geometry: {
                    type: 'MultiLineString',
                    coordinates: feature.geometry.paths,
                }
            });
        } else if (geomType === 'esriGeometryPoint') {
            s.push({
                type: 'Feature',
                properties: feature.attributes,
                geometry: {
                    type: 'Point',
                    coordinates: [feature.geometry.x, feature.geometry.y]
                }
            });
        }
        callback();
    });
    request.get({ url: url, qs: {f: 'json'}, json: true }, function (error, response, metadata) {
        if (error || response.statusCode !== 200) {
            return out.emit('error', error);
        }
        if (metadata.capabilities && metadata.capabilities.indexOf('Query') < 0) {
            return out.emit('error', new Error('Layer doesn\'t support query operation.'));
        }

        geomType = metadata.geometryType;
        if (!geomType) {
            return out.emit('error', new Error('no geometry'));
        }
        if (!metadata.extent) {
            return out.emit('error', new Error('Layer doesn\'t list an extent.'));
        }
        if ('subLayers' in metadata && metadata.subLayers.length > 0) {
            return out.emit('error', 'Specified layer has sublayers.');
        }
        new Downloader(url, metadata).pipe(out);
    });
    return out;
};