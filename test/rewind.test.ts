import rewind from '../lib/rewind.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const base = new URL(path.parse(import.meta.url).dir).pathname;

function f(_: string) {
    return JSON.parse(fs.readFileSync(_, 'utf8'));
}

function fixture(name: string, title: string) {
    const result = rewind(f(name));
    const outputName = name.replace('.input.', '.output.');
    if (process.env.UPDATE) {
        fs.writeFileSync(outputName, JSON.stringify(result, null, 4));
    }
    const expect = f(outputName);
    assert.deepEqual(result, expect, title);
}

test('rewind', () => {
    fixture(base + '/fixtures/rewind/featuregood.input.geojson', 'feature-good');
    fixture(base + '/fixtures/rewind/flip.input.geojson', 'flip');
    fixture(base + '/fixtures/rewind/collection.input.geojson', 'feature-collection');
    fixture(base + '/fixtures/rewind/geomcollection.input.geojson', 'geometry-collection');
    fixture(base + '/fixtures/rewind/multipolygon.input.geojson', 'multipolygon');
    fixture(base + '/fixtures/rewind/rev.input.geojson', 'rev');
    fixture(base + '/fixtures/rewind/near-zero.input.geojson', 'near-zero');
});

test('passthrough', () => {
    assert.equal(rewind(null), null);
});
