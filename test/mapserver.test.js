var esriDump = require('../index.js'),
    test = require('tape'),
    geojsonhint = require('geojsonhint'),
    fs = require('fs');

test('MapServer with points geometry', function(t) {
  t.plan(2);

  var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0';
  var data = {
    type: 'FeatureCollection',
    features: []
  }

  var stream = esriDump(url);

  stream.on('type', function(type) {
    t.equals(type, 'MapServer', 'recognizes MapServer');
  });

  stream.on('data', function (feature) {
    data.features.push(feature);
  });

  stream.on('error', function (err) {
    throw err;
  });

  stream.on('end', function () {
    var errors = geojsonhint.hint(data);
    t.ok(errors.length === 0, 'GeoJSON valid');
  });
});

test('MapServer with polygon geometry', function(t) {
  t.plan(2);

  var url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2';
  var data = {
    type: 'FeatureCollection',
    features: []
  }

  var stream = esriDump(url);

  stream.on('type', function(type) {
    t.equals(type, 'MapServer', 'recognizes MapServer');
  });

  stream.on('data', function (feature) {
    data.features.push(feature);
  });

  stream.on('error', function (err) {
    throw err;
  });

  stream.on('end', function () {
    var errors = geojsonhint.hint(data);
    t.ok(errors.length === 0, 'GeoJSON valid');
  });
});
