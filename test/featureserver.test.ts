import EsriDump from '../index.js';
import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error No Type Defs
import geojsonhint from 'geojsonhint';
import { Feature } from 'geojson';

test('FeatureServer with points geometry', async () => {
    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/0';
    const data: {
        type: string,
        features: Feature[]
    } = {
        type: 'FeatureCollection',
        features: []
    };

    const esri = new EsriDump(url);
    await new Promise<void>((resolve, reject) => {
        esri.on('type', (type) => {
            assert.equal(type, 'FeatureServer', 'recognizes FeatureServer');
        });

        esri.on('feature', (feature) => {
            data.features.push(feature);
        });

        esri.on('error', reject);

        esri.on('done', () => {
            const errors = geojsonhint.hint(data);
            assert.equal(errors.length, 0, 'GeoJSON valid');
            assert.ok(data.features.length > 1);
            resolve();
        });

        esri.fetch();
    });
});

test('FeatureServer with polygon geometry', async () => {
    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/2';
    const data: {
        type: string,
        features: Feature[]
    } = {
        type: 'FeatureCollection',
        features: []
    };

    const esri = new EsriDump(url);
    await new Promise<void>((resolve, reject) => {
        esri.on('type', (type) => {
            assert.equal(type, 'FeatureServer', 'recognizes FeatureServer');
        });

        esri.on('feature', (feature) => {
            data.features.push(feature);
        });

        esri.on('error', reject);

        esri.on('done', () => {
            const errors = geojsonhint.hint(data);
            assert.equal(errors.length, 0, 'GeoJSON valid');
            assert.ok(data.features.length > 1);
            resolve();
        });

        esri.fetch();
    });
});
