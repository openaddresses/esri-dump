var esriDump = require('../index.js'),
    test = require('tape'),
    geojsonhint = require('geojsonhint'),
    fs = require('fs');

// Testing two FeatureServers, one containing point geometries and the other containing polygon geometries
var polygonUrl = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2';

// Polygon
var polygonStream = esriDump(polygonUrl);
var polygon = {
  type: 'FeatureCollection',
  features: []
}
var polygonService = undefined;

polygonStream.on('type', function(type) {
  polygonService = type;
});

polygonStream.on('data', function (feature) {
  polygon.features.push(feature);
});

polygonStream.on('end', function () {

  var errors = geojsonhint.hint(polygon);

  test('MapServer with polygon geometry', function(t) {
    t.plan(2);
    t.equals(polygonService, 'MapServer', 'recognizes MapServer');
    t.ok(errors.length === 0, 'GeoJSON valid');
  });

});

polygonStream.on('error', function (err) {
  throw err;
});
