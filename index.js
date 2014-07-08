'use strict';
var through = require('through2').obj;
var request = require('request');
var Downloader = require('./stream');
var ArcGIS = require('terraformer-arcgis-parser');
module.exports = function (url) {
    var geomType;
    var out = through(function (feature, _, callback) {
        var s = this;
        s.push({
            type: 'Feature',
            properties: feature.attributes,
            geometry: ArcGIS.parse(feature.geometry)
        });
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