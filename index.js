var through = require('through2').obj;
var request = require('request');
var Set = require('es6-set');
function findOidField(fields) {
    return fields.filter(function(field) {
        return (field.type == 'esriFieldTypeOID');
    })[0];
}
module.exports = function (url) {
  var oidField, geomType;
  var set = new Set();
  var temp = through(function (chunk, _, callback) {
    var self = this;

    request.get({ url: chunk + '?f=json', json: true }, function (error, response, metadata) {
      if (error || response.statusCode != 200) {
            return callback(error);
        }
        if (metadata.capabilities && metadata.capabilities.indexOf('Query') < 0) {
            return callback("Layer doesn't support query operation.");
        }

        oidField = findOidField(metadata.fields).name;
        geomType = metadata.geometryType;
        if (!geomType) return callback(new Error("no geometry"));
        if (!metadata.extent) return callback(new Error("Layer doesn't list an extent."));
        if (!oidField) return callback(new Error("Could not find an OID field."));

        if ('subLayers' in metadata && metadata.subLayers.length > 0) {
            return callback("Specified layer has sublayers.");
        }
        self.push(metadata.extent);
        callback();
    });
  });
  temp.write(url);
  return temp.pipe(through(function (bounds, _, callback) {
    var self = this;
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
    fullUrl = url + '/query';

    request.get({url: fullUrl, qs: queryString ,json:true}, function(error, response, data) {
        if (error || response.statusCode != 200) return callback(error);
        if (data.features.length == 1000) {
            // If we get back the maximum number of results, break the
            // bbox up into 4 smaller chunks and request those.
            splitBbox(bounds).forEach(function(subbox) {
                self.write(subbox);
            });
        } else {
            data.features.forEach(function(feature) {           
              if (!set.has(feature.attributes[oidField])) {
                set.add(feature.attributes[oidField]);
                self.push(feature);
              }
            });
        }
        return callback();
    });
  })).pipe(through(function (feature, _, callback) {
    var s = this;
    if (geomType === 'esriGeometryPolygon') {
        s.push({
            type: 'Feature',
            properties: feature.attributes,
            geometry: {
                type: 'Polygon',
                googordinates: feature.geometry.rings,
            }
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
}));
};
function splitBbox(bbox) {
    var halfWidth = (bbox.xmax - bbox.xmin) / 2.0,
        halfHeight = (bbox.ymax - bbox.ymin) / 2.0;
    return [
        {xmin: bbox.xmin, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmax},
        {xmin: bbox.xmin, ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax},
        {xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax, ymax: bbox.ymax}
    ];}