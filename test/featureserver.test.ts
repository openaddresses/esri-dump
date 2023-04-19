import EsriDump from '../index.js';
import test from 'tape';
// @ts-ignore
import geojsonhint from 'geojsonhint';
import { Feature } from 'geojson';

test('FeatureServer with points geometry', (t) => {
    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/0';
    const data: {
        type: string,
        features: Feature[]
    } = {
        type: 'FeatureCollection',
        features: []
    };

    const esri = new EsriDump(url);
    esri.fetch();

    esri.on('type', (type) => {
        t.equals(type, 'FeatureServer', 'recognizes FeatureServer');
    });

    esri.on('feature', (feature) => {
        data.features.push(feature);
    });

    esri.on('error', (err) => {
        throw err;
    });

    esri.on('done', () => {
        const errors = geojsonhint.hint(data);
        t.ok(errors.length === 0, 'GeoJSON valid');

        t.equals(data.features.length, 23);

        t.end();
    });
});

test('FeatureServer with polygon geometry', (t) => {
    t.plan(2);

    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/2';
    const data: {
        type: string,
        features: Feature[]
    } = {
        type: 'FeatureCollection',
        features: []
    };

    const esri = new EsriDump(url);
    esri.fetch();

    esri.on('type', (type) => {
        t.equals(type, 'FeatureServer', 'recognizes FeatureServer');
    });

    esri.on('feature', (feature) => {
        data.features.push(feature);
    });

    esri.on('error', (err) => {
        throw err;
    });

    esri.on('done', () => {
        const errors = geojsonhint.hint(data);
        t.ok(errors.length === 0, 'GeoJSON valid');

        t.equals(data.features.length, 16);

        t.end();
    });
});
