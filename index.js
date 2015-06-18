'use strict';
var through = require('through2').obj;
var request = require('request');
var Geometry = require('./lib/geometry');
var Imagery_raw = require('./lib/imagery_raw');
module.exports = function (url) {
    var geomType;
    var out = through(function (feature, _, callback) {
        this.push(feature);
        callback();
    });

    request.get({ url: url, qs: {f: 'json'}, json: true }, function (error, response, metadata) {
        if (error || response.statusCode !== 200) {
            return out.emit('error', error);
        }

        //Mapservers => Vector features => geojson
        if (url.indexOf('/MapServer') > -1 ) {
            out.emit('type', 'geometry');
            if (metadata.capabilities && metadata.capabilities.indexOf('Query') === -1 ) {
                return out.emit('error', new Error('Layer doesn\'t support query operation.'));
            }

            geomType = metadata.geometryType;
            if (!geomType) {
                return out.emit('error', new Error('no geometry'));
            } else if (!metadata.extent) {
                return out.emit('error', new Error('Layer doesn\'t list an extent.'));
            } else if ('subLayers' in metadata && metadata.subLayers.length > 0) {
                return out.emit('error', 'Specified layer has sublayers.');
            }

            new Geometry(url, metadata).pipe(out);

        //ImageServer => Rasterdata
        } else if (url.indexOf('/ImageServer') > -1 ) {
            out.emit('type', 'image');
            if (metadata.capabilities && metadata.capabilities.indexOf('Download') === -1 ) {
                return out.emit('error', new Error('Layer doesn\'t support download operation.'));
            }

            new Imagery_raw(url, metadata).pipe(out);
        } else {
            return out.emit('error', new Error('Could not determine server type'));
        }
    });

    return out;
};
