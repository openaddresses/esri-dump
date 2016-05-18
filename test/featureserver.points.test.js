var esriDump = require('../index.js'),
    test = require('tape'),
    geojsonhint = require('geojsonhint'),
    fs = require('fs');

// Testing two FeatureServers, one containing point geometries and the other containing polygon geometries
var pointsUrl = 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Fire/Sheep/FeatureServer/0';

// Points
var pointsStream = esriDump(pointsUrl);
var points = {
  type: 'FeatureCollection',
  features: []
}
var pointsService = undefined;

pointsStream.on('type', function(type) {
  pointsService = type;
});

pointsStream.on('data', function (feature) {
  points.features.push(feature);
});

pointsStream.on('end', function () {

  var errors = geojsonhint.hint(points);

  test('FeatureServer with points geometry', function(t) {
    t.plan(2);
    t.equals(pointsService, 'FeatureServer', 'recognizes FeatureServer');
    t.ok(errors.length === 0, 'GeoJSON valid');
  });
});

pointsStream.on('error', function (err) {
  throw err;
});
