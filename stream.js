'use strict';
var Readable = require('readable-stream').Readable;
var util = require('util');
var ESet = require('es6-set');
var request = require('request');
module.exports = Downloader;
util.inherits(Downloader, Readable);

function Downloader(url, oidField, inBounds) {

    Readable.call(this, {
        objectMode: true
    });
    this.baseUrl = url;
    this.paths = [inBounds];
    this.inProgress = 0;
    this.set = new ESet();
    this.oidField = oidField;
}

Downloader.prototype._read = function () {
    var self = this;
    var bounds = this.paths.pop();
    if (!bounds) {
        if (!self.inProgress) {
            self.push(null);
        }
        return;
    }
    self.inProgress++;
    var queryString = {
        geometry: [bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax].join(','),
        geometryType: 'esriGeometryEnvelope',
        spatialRel: 'esriSpatialRelIntersects',
        geometryPrecision: 7,
        returnGeometry: true,
        outSR: 4326,
        outFields: '*',
        f: 'JSON'
    };
    var fullUrl = this.baseUrl + '/query';

    request.get({url: fullUrl, qs: queryString, json: true}, function (error, response, data) {
        if (error || response.statusCode !== 200) {
            return self.emit(error);
        }
        if (data.features.length === 1000) {
          // If we get back the maximum number of results, break the
          // bbox up into 4 smaller chunks and request those.
            splitBbox(bounds).forEach(function (subbox) {
                self.paths.push(subbox);
            });
            self.inProgress--;
            self._read();
        } else {
            var full = false;
            data.features.forEach(function (feature) {
                if (!self.set.has(feature.attributes[self.oidField])) {
                    self.set.add(feature.attributes[self.oidField]);
                    if (!self.push(feature)) {
                        full = true;
                    }
                }
            });
            self.inProgress--;
            if (!full) {
                self._read();
            }
        }
    });
};
function splitBbox(bbox) {
    var halfWidth = (bbox.xmax - bbox.xmin) / 2.0,
        halfHeight = (bbox.ymax - bbox.ymin) / 2.0;
    return [
        {xmin: bbox.xmin, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmax},
        {xmin: bbox.xmin, ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax, ymax: bbox.ymax}
    ];
}