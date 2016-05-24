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

    // Validate URL is a "/rest/services/" endpoint
    if (url.indexOf('/rest/services/') === -1) {
      return out.emit('error', new Error('Did not recognize ' + url + ' as an ArcGIS /rest/services/ endpoint.'));
    }

    // Extract API resource type from url. One of FeatureServer, MapServer, or ImageServer
    var resourceType = url.substring(url.lastIndexOf('/', url.lastIndexOf('/') - 1), url.lastIndexOf('/'));

    request.get({ url: url, qs: {f: 'json'}, json: true }, function (error, response, metadata) {
        if (error) return out.emit('error', error);
        if (response.statusCode !== 200) return out.emit('error', new Error('Received ' + response.statusCode + ' response code'));
        if (metadata.error) return out.emit('error', new Error('Server metadata error: ' + metadata.error.message));

        switch (resourceType) {
          case '/FeatureServer':
          case '/MapServer':

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
            if (metadata.folders|| metadata.services) {
              var errorMessage = 'Endpoint provided is not a Server resource.\n';
              if (metadata.folders.length > 0) {
                errorMessage += '\nChoose a Layer from a Service in one of these Folders: \n  '
                  + metadata.folders.join('\n  ') + '\n';
              }
              if (metadata.services.length > 0) {
                errorMessage += '\nChoose a Layer from one of these Services: \n  '
                  + metadata.services.map(function(d) { return d.name }).join('\n  ') + '\n';
              }
              return out.emit('error', new Error(errorMessage));
            } else if (metadata.layers) {
              var errorMessage = 'Endpoint provided is not a Server resource.\n';
              if (metadata.layers.length > 0) {
                errorMessage += '\nChoose one of these Layers: \n  '
                  + metadata.layers.map(function(d) { return d.name }).join('\n  ') + '\n';
              }
              return out.emit('error', new Error(errorMessage));
            } else {
              return out.emit('error', new Error('Could not determine server type.'));
            }
        }

    });

    return out;
};
