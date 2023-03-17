const esriDump = require('../index.js'),
    test = require('tape'),
    geojsonhint = require('geojsonhint');

test('FeatureServer with points geometry', (t) => {
    t.plan(2);

    const url = 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Fire/Sheep/FeatureServer/0';
    const data = {
        type: 'FeatureCollection',
        features: []
    };

    const stream = esriDump(url);

    stream.on('type', (type) => {
        t.equals(type, 'FeatureServer', 'recognizes FeatureServer');
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

test('FeatureServer with polygon geometry', (t) => {
    t.plan(2);

    const url = 'http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Fire/Sheep/FeatureServer/2';
    const data = {
        type: 'FeatureCollection',
        features: []
    };

    const stream = esriDump(url);

    stream.on('type', (type) => {
        t.equals(type, 'FeatureServer', 'recognizes FeatureServer');
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
