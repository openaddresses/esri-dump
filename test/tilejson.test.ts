import fs from 'node:fs';
import test from 'tape';
import proj4 from 'proj4';
import EsriDump from '../index.js';
import TileJSON from '../lib/tilejson.js';
import Server from './server.js';

function approx(t: test.Test, actual: number, expected: number, delta: number, message: string) {
    t.ok(Math.abs(actual - expected) <= delta, `${message}: expected ${expected}, got ${actual}`);
}

test('TileJSON builds a vector document from vector metadata', (t) => {
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

    t.equals(doc.tilejson, '3.0.0');
    t.equals(doc.version, '1.0.0');
    t.equals(doc.type, 'vector');
    t.equals(doc.scheme, 'xyz');
    t.equals(doc.name, 'Wildfire Response Points');
    t.equals(doc.description, 'Wildfire incidents');
    t.ok(Array.isArray(doc.bounds), 'includes bounds');
    t.ok(Array.isArray(doc.center), 'includes center');
    t.ok(Array.isArray(doc.vector_layers), 'includes vector layers');
    t.deepEquals(doc.vector_layers, [{
        id: 'out',
        fields: {
            objectid: 'number',
            eventdate: 'date-time',
            description: 'string'
        }
    }]);

    approx(t, doc.bounds![0], expectedBounds[0], 0.000001, 'min lon');
    approx(t, doc.bounds![1], expectedBounds[1], 0.000001, 'min lat');
    approx(t, doc.bounds![2], expectedBounds[2], 0.000001, 'max lon');
    approx(t, doc.bounds![3], expectedBounds[3], 0.000001, 'max lat');
    approx(t, doc.center![0], (expectedBounds[0] + expectedBounds[2]) / 2, 0.000001, 'center lon');
    approx(t, doc.center![1], (expectedBounds[1] + expectedBounds[3]) / 2, 0.000001, 'center lat');
    t.equals(doc.center![2], doc.minzoom, 'center zoom defaults to minzoom');

    t.end();
});

test('TileJSON builds a raster document from ImageServer metadata', (t) => {
    const metadata = JSON.parse(String(
        fs.readFileSync(new URL('./fixtures/ImageServer_json_Download.json', import.meta.url))
    ));

    const doc = TileJSON(metadata, {
        resourceType: 'ImageServer'
    });

    t.equals(doc.type, 'raster');
    t.equals(doc.name, 'image/images');
    t.equals(doc.description, 'Even more words');
    t.equals(doc.attribution, 'Lawyers :/');
    t.notOk('vector_layers' in doc, 'omits vector_layers for raster sources');
    approx(t, doc.bounds![0], -117.55256932195272, 0.000001, 'raster min lon');
    approx(t, doc.bounds![1], 41.89181133113208, 0.000001, 'raster min lat');
    approx(t, doc.bounds![2], -110.59779625882915, 0.000001, 'raster max lon');
    approx(t, doc.bounds![3], 49.04113757310969, 0.000001, 'raster max lat');
    approx(t, doc.center![0], -114.07518279039093, 0.000001, 'raster center lon');
    approx(t, doc.center![1], 45.466474452120885, 0.000001, 'raster center lat');
    t.equals(doc.minzoom, 0);
    t.equals(doc.maxzoom, 22);

    t.end();
});

test('TileJSON falls back from unsupported latestWkid to wkid definition', (t) => {
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

    t.equals(doc.type, 'raster');
    approx(t, doc.bounds![0], -89.01846770012975, 0.000001, 'fallback min lon');
    approx(t, doc.bounds![1], 42.83851413306932, 0.000001, 'fallback min lat');
    approx(t, doc.bounds![2], -88.53106880092396, 0.000001, 'fallback max lon');
    approx(t, doc.bounds![3], 43.202907314004854, 0.000001, 'fallback max lat');

    t.end();
});

test('EsriDump exposes tilejson() for ImageServer endpoints', (t) => {
    Server({
        mode: 'download'
    }, async (stop: (cb: () => void) => void) => {
        try {
            const esri = new EsriDump('http://localhost:3000/arcgis/rest/services/images/ImageServer');
            const doc = await esri.tilejson();

            t.equals(doc.type, 'raster');
            t.equals(doc.name, 'image/images');
            t.ok(Array.isArray(doc.bounds), 'includes bounds');
            t.ok(Array.isArray(doc.center), 'includes center');

            stop(() => t.end());
        } catch (err) {
            stop(() => {
                t.fail(err instanceof Error ? err.message : String(err));
                t.end();
            });
        }
    });
});
