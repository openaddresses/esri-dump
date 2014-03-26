esri-dump
=========

A Node module to assist with pulling data out of an ESRI ArcGIS REST server into a more useful format.

This is based on [Python code](http://github.com/iandees/esri-dump) I wrote to do the same thing.

## install

    npm install -g esri-dump

## api

exposes a function, which if you give it a url, will return a stream of the geojson features.

```js
var esriDump = require("esri-dump");
var jsonStream = esriDump(url);
var featureCollection = {
  type: 'FeatureCollection',
  features: []
}
jsonStream.on('data', function (feature) {
    featureCollection.features.push(feature);
});
jsonStream.on('end', function () {
    doSomething(null, featureCollection)
});
jsonStream.on('error', function (err) {
    doSomething(err);
});
```

## Command Line

Streams a geojson feature collection to stdout 

```sh
esri-dump http://services2.bhamaps.com/arcgis/rest/services/AGS_jackson_co_il_taxmap/MapServer/0 > output.geojson
```
