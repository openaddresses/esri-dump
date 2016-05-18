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

    // Extract API resource type from url. One of FeatureServer, MapServer, or ImageServer
    var resourceType = url.substring(url.lastIndexOf('/', url.lastIndexOf('/') - 1), url.lastIndexOf('/'));

    request.get({ url: url, qs: {f: 'json'}, json: true }, function (error, response, metadata) {
        if (error || response.statusCode !== 200) {
            return out.emit('error', error);
        }

        switch (resourceType) {
          case '/FeatureServer' || '/MapServer':

            resourceType === '/FeatureServer' ? out.emit('type', 'FeatureServer') : out.emit('type', 'MapServer');
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

            break;

          case '/ImageServer':

            out.emit('type', 'ImageServer');
            if (metadata.capabilities && metadata.capabilities.indexOf('Download') === -1 ) {
                return out.emit('error', new Error('Layer doesn\'t support download operation.'));
            }

            new Imagery_raw(url, metadata).pipe(out);

            break;

          default:
            return out.emit('error', new Error('Could not determine server type'));
        }

    });

    return out;
};
