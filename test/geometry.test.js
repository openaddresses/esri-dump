import test from 'tape';
import Geometry from '../lib/geometry.js';

test('geometry#splitBbox', (t) => {
    t.deepEquals(Geometry.splitBbox({
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

    t.deepEquals(Geometry.splitBbox({
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
    t.end();
});

test('geometry#findOidField', (t) =>{
    t.equals(Geometry.findOidField([{
        name: 'test',
        type: 'esriFieldTypeOID',
        alias: 'st_length(shape)',
        domain: null
    }]), 'test', 'Find Oid Field');

    t.equals(Geometry.findOidField([{
        name: 'id',
        type: 'esriTypeDouble',
        alias: 'st_length(shape)',
        domain: null
    }]), 'id', 'Finds a suitable ID field');

    t.equals(Geometry.findOidField([{
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

    t.throws(() => {
        Geometry.findOidField([{
            name: 'test',
            type: 'esriTypeDouble',
            alias: 'st_length(shape)',
            domain: null
        }]);
    }, /Could not determine OBJECTID field./, 'Recognizes absense of any likely OBJECTID field');

    t.end();
});
