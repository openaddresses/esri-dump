'use strict';
var Readable = require('readable-stream').Readable;
var util = require('util');
var request = require('request');
var rings2geojson = require('./rings2geojson');
var proj4 = require('proj4');
var wkid = require('./wkid.json');
util.inherits(Downloader, Readable);

function Downloader(url, metadata) {
    Readable.call(this, {
        objectMode: true
    });

    this.baseUrl = url;
    this.inProgress = 0;
    this.id = 0;
    this.stop = false; //when true, there are no more images
}

Downloader.prototype._read = function () {
    var self = this;
    if (self.stop && self.inProgress === 0) {
        return self.push(null);
    } else if (self.stop) {
        return;
    }

    var objectId = ++self.id;
    request.get({
        url: self.baseUrl + '/' + objectId,
        qs: {
            f: 'json'
        },
        json: true
    }, function (error, response, data) {
        if (error || response.statusCode !== 200) {
            return self.emit('error', error);
        } else if (data && data.error && data.error.code === 400) {
            return self.stop = true; //Stop querying more ids
        }

        self.inProgress++;

        if (!data.geometry) {
            return self.emit('error', new Error('Image does not have attribute data'));
        }

        //Reproject to EPSG:4326
        if (data.geometry.spatialReference) {
            data.geometry.rings = data.geometry.rings.map(function(ring) {
                    return ring.map(function(coords) {
                        return proj4(
                            wkid[data.geometry.spatialReference.wkid],
                            'EPSG:4326',
                            coords
                        );
                    });
                });
        }

        getURL({
            type: 'Feature',
            properties: data.attributes,
            geometry: rings2geojson(data.geometry.rings)
        });
    });

    function getURL(geojson) {
        request.get({
            url: self.baseUrl + '/download',
            qs: {
                rasterIds: objectId,
                geometryType: 'esriGeometryEnvelope',
                f: 'json'
            },
            json: true
        }, function (error, response, data) {
            if (error || response.statusCode !== 200) {
                return self.emit('error', error);
            } else if (data && data.error) {
                return self.emit('error', new Error(JSON.stringify(data.error)));
            }

            geojson.properties.id = self.objectId;
            geojson.properties.files = data.rasterFiles.map(function(file) {
                return {
                    url: file.id,
                    name: file.id.replace(/.*\//,'')
                };
            });

            var full = false;
            if (!self.push(geojson)) {
                full = true;
            }

            self.inProgress--;
            if (!full) {
                self._read();
            }
        });
    }
};


module.exports = Downloader;
