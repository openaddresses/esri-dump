import rewind from '../lib/rewind.js';
import fs from 'node:fs';
import path from 'node:path';
import test from 'tape';

const base = new URL(path.parse(import.meta.url).dir).pathname;

function f(_: string) {
    return JSON.parse(fs.readFileSync(_, 'utf8'));
}

function fixture(t: any, name: string, title: string) {
    var result = rewind(f(name));
    var outputName = name.replace('.input.', '.output.');
    if (process.env.UPDATE) {
        fs.writeFileSync(outputName, JSON.stringify(result, null, 4));
    }
    var expect = f(outputName);
    t.deepEqual(result, expect, title);
}

test('rewind', (t) => {
    fixture(t, base + '/fixtures/rewind/featuregood.input.geojson', 'feature-good');
    fixture(t, base + '/fixtures/rewind/flip.input.geojson', 'flip');
    fixture(t, base + '/fixtures/rewind/collection.input.geojson', 'feature-collection');
    fixture(t, base + '/fixtures/rewind/geomcollection.input.geojson', 'geometry-collection');
    fixture(t, base + '/fixtures/rewind/multipolygon.input.geojson', 'multipolygon');
    fixture(t, base + '/fixtures/rewind/rev.input.geojson', 'rev');
    fixture(t, base + '/fixtures/rewind/near-zero.input.geojson', 'near-zero');
    t.end();
});

test('passthrough', (t) => {
    t.equal(rewind(null), null);
    t.end();
});
