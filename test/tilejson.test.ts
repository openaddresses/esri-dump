import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import proj4 from 'proj4';
import EsriDump from '../index.js';
import TileJSON from '../lib/tilejson.js';
import Server from './server.js';

function approx(actual: number, expected: number, delta: number, message: string) {
    assert.ok(Math.abs(actual - expected) <= delta, `${message}: expected ${expected}, got ${actual}`);
}

test('TileJSON builds a vector document from vector metadata', () => {
    const expectedBounds = [-123.5, 45.25, -122.75, 46.5] as const;
    const lowerLeft = proj4('EPSG:4326', 'EPSG:3857', [expectedBounds[0], expectedBounds[1]]);
    const upperRight = proj4('EPSG:4326', 'EPSG:3857', [expectedBounds[2], expectedBounds[3]]);

    const doc = TileJSON({
        currentVersion: 10.91,
        name: 'Wildfire Response Points',
        description: 'Wildfire incidents',
        geometryType: 'esriGeometryPoint',
        extent: {
            xmin: lowerLeft[0],
            ymin: lowerLeft[1],
            xmax: upperRight[0],
            ymax: upperRight[1],
            spatialReference: {
                wkid: 102100,
                latestWkid: 3857
            }
        },
        fields: [{
            name: 'objectid',
            type: 'esriFieldTypeOID'
        }, {
            name: 'eventdate',
            type: 'esriFieldTypeDate'
        }, {
            name: 'description',
            type: 'esriFieldTypeString'
        }]
    }, {
        resourceType: 'FeatureServer'
    });

    assert.equal(doc.tilejson, '3.0.0');
    assert.equal(doc.version, '1.0.0');
    assert.equal(doc.type, 'vector');
    assert.equal(doc.scheme, 'xyz');
    assert.equal(doc.name, 'Wildfire Response Points');
    assert.equal(doc.description, 'Wildfire incidents');
    assert.ok(Array.isArray(doc.bounds), 'includes bounds');
    assert.ok(Array.isArray(doc.center), 'includes center');
    assert.ok(Array.isArray(doc.vector_layers), 'includes vector layers');
    assert.deepEqual(doc.vector_layers, [{
        id: 'out',
        fields: {
            objectid: 'number',
            eventdate: 'date-time',
            description: 'string'
        }
    }]);

    approx(doc.bounds![0], expectedBounds[0], 0.000001, 'min lon');
    approx(doc.bounds![1], expectedBounds[1], 0.000001, 'min lat');
    approx(doc.bounds![2], expectedBounds[2], 0.000001, 'max lon');
    approx(doc.bounds![3], expectedBounds[3], 0.000001, 'max lat');
    approx(doc.center![0], (expectedBounds[0] + expectedBounds[2]) / 2, 0.000001, 'center lon');
    approx(doc.center![1], (expectedBounds[1] + expectedBounds[3]) / 2, 0.000001, 'center lat');
    assert.equal(doc.center!.length, 2, 'center omits zoom coordinate');
});

test('TileJSON builds a raster document from ImageServer metadata', () => {
    const metadata = JSON.parse(String(
        fs.readFileSync(new URL('./fixtures/ImageServer_json_Download.json', import.meta.url))
    ));

    const doc = TileJSON(metadata, {
        resourceType: 'ImageServer'
    });

    assert.equal(doc.type, 'raster');
    assert.equal(doc.name, 'image/images');
    assert.equal(doc.description, 'Even more words');
    assert.equal(doc.attribution, 'Lawyers :/');
    assert.ok(!('vector_layers' in doc), 'omits vector_layers for raster sources');
    approx(doc.bounds![0], -117.55256932195272, 0.000001, 'raster min lon');
    approx(doc.bounds![1], 41.89181133113208, 0.000001, 'raster min lat');
    approx(doc.bounds![2], -110.59779625882915, 0.000001, 'raster max lon');
    approx(doc.bounds![3], 49.04113757310969, 0.000001, 'raster max lat');
    approx(doc.center![0], -114.07518279039093, 0.000001, 'raster center lon');
    approx(doc.center![1], 45.466474452120885, 0.000001, 'raster center lat');
    assert.equal(doc.minzoom, 0);
    assert.equal(doc.maxzoom, 22);
});

test('TileJSON falls back from unsupported latestWkid to wkid definition', () => {
    const doc = TileJSON({
        name: 'Jefferson County 2025 SID',
        description: 'Orthophotography',
        fullExtent: {
            xmin: 2231735.049,
            ymin: 309043.987,
            xmax: 2360165.299,
            ymax: 439980.237,
            spatialReference: {
                wkid: 103191,
                latestWkid: 6609
            }
        },
        serviceDataType: 'esriImageServiceDataTypeGeneric'
    }, {
        resourceType: 'ImageServer'
    });

    assert.equal(doc.type, 'raster');
    approx(doc.bounds![0], -89.01846770012975, 0.000001, 'fallback min lon');
    approx(doc.bounds![1], 42.83851413306932, 0.000001, 'fallback min lat');
    approx(doc.bounds![2], -88.53106880092396, 0.000001, 'fallback max lon');
    approx(doc.bounds![3], 43.202907314004854, 0.000001, 'fallback max lat');
});

test('EsriDump exposes tilejson() for ImageServer endpoints', async () => {
    await new Promise<void>((resolve, reject) => {
        Server({
            mode: 'download'
        }, async (stop: (cb: () => void) => void) => {
            try {
                const esri = new EsriDump('http://localhost:3000/arcgis/rest/services/images/ImageServer');
                const doc = await esri.tilejson();

                assert.equal(doc.type, 'raster');
                assert.equal(doc.name, 'image/images');
                assert.ok(Array.isArray(doc.bounds), 'includes bounds');
                assert.ok(Array.isArray(doc.center), 'includes center');
                assert.equal(doc.center.length, 2, 'center omits zoom coordinate');

                stop(resolve);
            } catch (err) {
                stop(() => {
                    reject(err);
                });
            }
        });
    });
});
