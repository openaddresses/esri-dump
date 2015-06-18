'use strict';
var Readable = require('readable-stream').Readable;
var util = require('util');
var request = require('request');
util.inherits(Downloader, Readable);

function Downloader(url, metadata) {
    Readable.call(this, {
        objectMode: true
    });

    this.baseUrl = url;
    this.inProgress = 0;
    this.maxRecords = metadata.maxRecordCount || null;
}

Downloader.prototype._read = function () {
    var self = this;

    self.inProgress++;
    var queryString = {
        rasterIds: self.inProgress,
        geometryType: 'esriGeometryEnvelope',
        f: 'json'
    };
    var fullUrl = this.baseUrl + '/download';
    request.get({url: fullUrl, qs: queryString, json: true}, function (error, response, data) {
        if (error || response.statusCode !== 200) {
            return self.emit('error', error);
        } else if (data && data.error) {
            if (self.inProgress && data.error.code === 400) {
                //Typically means we've reached the end of the id space (no more images)
                return self.push(null);
            } else {
                return self.emit('error', new Error(JSON.stringify(data.error)));
            }
        }

        data = {
            type: "Image",
            properties: {
                id: self.inProgress
            },
            feature: data.rasterFiles.map(function(file) {
                return {
                    type: 'ImageData', //Can be an image or auxilary data (xml, aux, rrd, etc)
                    file: {
                        url: file.id,
                        name: file.id.replace(/.*\//,'')
                    }
                };
            })
        };

        var full = false;
        if (!self.push(data)) {
            full = true;
        }

        if (!full) {
            self._read();
        }
    });
};


module.exports = Downloader;
