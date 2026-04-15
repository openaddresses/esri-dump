import EsriDump from '../index.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import type { Feature } from 'geojson';
// @ts-expect-error No Type Defs
import geojsonhint from 'geojsonhint';

test('MapServer with points geometry', async () => {
    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/MapServer/0';
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

test('MapServer with polygon geometry', async () => {
    const url = 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/MapServer/2';
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
