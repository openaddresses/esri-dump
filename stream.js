'use strict';
var Readable = require('readable-stream').Readable;
var util = require('util');
var ESet = require('es6-set');
var request = require('request');
module.exports = Downloader;
util.inherits(Downloader, Readable);

function Downloader(url, metadata) {
    Readable.call(this, {
        objectMode: true
    });
    this.baseUrl = url;
    this.paths = [metadata.extent];
    this.inProgress = 0;
    this.maxRecords = metadata.maxRecordCount || null;
    this.set = new ESet();
    this.oidField = findOidField(metadata.fields).name;
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
        if (self.maxRecords === null && self.inProgress === 1) {
            // Since we can't reliably get the configured maximum result size from the server,
            // assume that the first request will exceed it and use the results length
            // to set the maxRecords value for further requests.
            self.maxRecords = data.features.length;
        }
        if (data.exceededTransferLimit || data.features.length === self.maxRecords) {
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
function findOidField(fields) {
    return fields.filter(function (field) {
        return (field.type === 'esriFieldTypeOID');
    })[0];
}