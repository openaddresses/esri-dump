import assert from 'node:assert/strict';
import test from 'node:test';
import Geometry from '../lib/geometry.js';

test('geometry#splitBbox', () => {
    assert.deepEqual(Geometry.splitBbox({
        xmin: -97.0189932385465,
        ymin: 20.52053000026018,
        xmax: -88.57449931419137,
        ymax: 29.116263085773653
    }), [
        {
            xmax: -92.79674627636894,
            xmin: -97.0189932385465,
            ymax: 24.818396543016917,
            ymin: 20.52053000026018
        }, {
            xmax: -88.57449931419137,
            xmin: -92.79674627636894,
            ymax: 24.818396543016917,
            ymin: 20.52053000026018
        }, {
            xmax: -92.79674627636894,
            xmin: -97.0189932385465,
            ymax: 29.116263085773653,
            ymin: 24.818396543016917
        }, {
            xmax: -88.57449931419137,
            xmin: -92.79674627636894,
            ymax: 29.116263085773653,
            ymin: 24.818396543016917
        }
    ], 'returns split bbox');

    assert.deepEqual(Geometry.splitBbox({
        xmin: 2,
        ymin: 2,
        xmax: 4,
        ymax: 4
    }), [
        {
            xmax: 3,
            xmin: 2,
            ymax: 3,
            ymin: 2
        }, {
            xmax: 4,
            xmin: 3,
            ymax: 3,
            ymin: 2
        }, {
            xmax: 3,
            xmin: 2,
            ymax: 4,
            ymin: 3
        }, {
            xmax: 4,
            xmin: 3,
            ymax: 4,
            ymin: 3
        }
    ], 'returns split bbox');
});

test('geometry#decodeHtmlEntities', () => {
    assert.equal(Geometry.decodeHtmlEntities("Larimer County Sheriff&#x27;s Office"), "Larimer County Sheriff's Office", 'decodes &#x27; hex entity');
    assert.equal(Geometry.decodeHtmlEntities("test&#39;s"), "test's Office".replace(' Office', ''), 'decodes &#39; decimal entity');
    assert.equal(Geometry.decodeHtmlEntities("a &amp; b"), 'a & b', 'decodes &amp;');
    assert.equal(Geometry.decodeHtmlEntities("&lt;tag&gt;"), '<tag>', 'decodes &lt; &gt;');
    assert.equal(Geometry.decodeHtmlEntities("say &quot;hello&quot;"), 'say "hello"', 'decodes &quot;');
    assert.equal(Geometry.decodeHtmlEntities("it&apos;s"), "it's", 'decodes &apos;');
    assert.equal(Geometry.decodeHtmlEntities("no entities here"), 'no entities here', 'leaves plain strings unchanged');
});

test('geometry#findOidField', () =>{
    assert.equal(Geometry.findOidField([{
        name: 'test',
        type: 'esriFieldTypeOID',
        alias: 'st_length(shape)',
        domain: null
    }]), 'test', 'Find Oid Field');

    assert.equal(Geometry.findOidField([{
        name: 'id',
        type: 'esriTypeDouble',
        alias: 'st_length(shape)',
        domain: null
    }]), 'id', 'Finds a suitable ID field');

    assert.equal(Geometry.findOidField([{
        name: 'id',
        type: 'esriTypeDouble',
        alias: 'st_length(shape)',
        domain: null
    },{
        name: 'objectid',
        type: 'esriTypeString',
        alias: 'st_length(shape)',
        domain: null
    }]), 'objectid', 'Finds the best available ID field');

    assert.throws(() => {
        Geometry.findOidField([{
            name: 'test',
            type: 'esriTypeDouble',
            alias: 'st_length(shape)',
            domain: null
        }]);
    }, /Could not determine OBJECTID field./, 'Recognizes absense of any likely OBJECTID field');
});
