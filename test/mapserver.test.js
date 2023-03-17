const esriDump = require('../index.js'),
    test = require('tape'),
    geojsonhint = require('geojsonhint');

test('MapServer with points geometry', (t) => {
    t.plan(2);

    const url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0';
    const data = {
        type: 'FeatureCollection',
        features: []
    };

    const stream = esriDump(url);

    stream.on('type', (type) => {
        t.equals(type, 'MapServer', 'recognizes MapServer');
    });

    stream.on('data', (feature) => {
        data.features.push(feature);
    });

    stream.on('error', (err) => {
        throw err;
    });

    stream.on('end', () => {
        const errors = geojsonhint.hint(data);
        t.ok(errors.length === 0, 'GeoJSON valid');
    });
});

test('MapServer with polygon geometry', (t) => {
    t.plan(2);

    const url = 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2';
    const data = {
        type: 'FeatureCollection',
        features: []
    };

    const stream = esriDump(url);

    stream.on('type', (type) => {
        t.equals(type, 'MapServer', 'recognizes MapServer');
    });

    stream.on('data', (feature) => {
        data.features.push(feature);
    });

    stream.on('error', (err) => {
        throw err;
    });

    stream.on('end', () => {
        const errors = geojsonhint.hint(data);
        t.ok(errors.length === 0, 'GeoJSON valid');
    });
});
