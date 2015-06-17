var test = require('tape');
var fs = require('fs');
var stream = require('../stream');

test('stream#splitBbox', function(t) {
   t.deepEquals(stream.splitBbox({
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

   t.deepEquals(stream.splitBbox({
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

test('stream#findOidField', function(t){
    t.deepEquals(stream.findOidField([{
        name: 'test',
        type: 'esriFieldTypeOID',
        alias: 'st_length(shape)',
        domain: null
    }]), {
        alias: 'st_length(shape)',
        domain: null,
        name: 'test',
        type: 'esriFieldTypeOID'
    }, 'Find Oid Field');

    t.deepEquals(stream.findOidField([{
        name: 'test',
        type: 'esriTypeDouble',
        alias: 'st_length(shape)',
        domain: null
    }]), undefined, 'Can\'t Find Oid Field');
    t.end();
});
