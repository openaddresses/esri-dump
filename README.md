esri-dump
=========

A Node module to assist with pulling data out of an ESRI ArcGIS REST server into a more useful format.

This is based on [Python code](http://github.com/iandees/esri-dump) I wrote to do the same thing.

## install

    npm install -g esri-dump

## api

`.fetch(url, callback)`

Given a base MapServer URL, recursively download contents and call back
with ¿"EsriJSON"?

`.fetchGeoJSON(url, callback)`

Given a base MapServer URL, recursively download contents and call back
with GeoJSON

```sh
npm install -g esri-dump

esri-dump http://services2.bhamaps.com/arcgis/rest/services/AGS_jackson_co_il_taxmap/MapServer/0 > output.geojson
```
