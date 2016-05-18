var esriDump = require('../index.js'),
    test = require('tape'),
    geojsonhint = require('geojsonhint'),
    fs = require('fs');

// Testing two FeatureServers, one containing point geometries and the other containing polygon geometries
var pointsUrl = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0';

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

  test('MapServer with points geometry', function(t) {
    t.plan(3);
    t.equals(pointsService, 'MapServer', 'recognizes MapServer');
    t.ok(errors.length === 0, 'GeoJSON valid');
    t.ok(points.features.length > 1000, 'more than 1000 features dumped')
  });

});

pointsStream.on('error', function (err) {
  throw err;
});
