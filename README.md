<h1 align=center>esri-dump</h1>

<p align=center>A Node module to assist with pulling data out of an ESRI ArcGIS REST server into GeoJSON or ImageryURLs</p>

Based On [PyEsriDump](http://github.com/openaddresses/pyesridump) by [@iandees](https://github.com/iandees)

## Install

```sh
npm install -g esri-dump
```

## API

exposes a function, which if you give it a url, will return a stream of the geojson features.

```js
import EsriDump from 'esri-dump';
const esri = new EsriDump(url);

const  featureCollection = {
  type: 'FeatureCollection',
  features: []
}

esri.fetch();

esri.on('type', (type) => {
    //Emitted before any data events
    //emits one of
    // - `MapServer'
    // - `FeatureServer'
});

esri.on('feature', (feature) => {
    featureCollection.features.push(feature);
});

esri.on('done', () => {
    doSomething(null, featureCollection)
});

esri.on('error', (err) => {
    doSomething(err);
});
```

## Command Line

Streams a geojson feature collection to stdout

```sh
esri-dump fetch http://services2.bhamaps.com/arcgis/rest/services/AGS_jackson_co_il_taxmap/MapServer/0 > output.geojson
```

## Data Output

### FeatureServer and MapServer

Output from an ESRI `FeatureServer` or an ESRI `MapServer` is returned as GeoJSON as in the example below.

```json
{
    "type": "Feature",
    "properties": {
        "objectid": 1
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    -65.6231319,
                    31.7127058
                ],
                [
                    -65.6144566,
                    31.7020286
                ],
                [
                    -65.6231319,
                    31.698692
                ],
                [
                    -65.6231319,
                    31.7127058
                ]
            ]
        ]
    }
}
```

# Development

`esri-dump` is written in TypeScript. To compile it locally, run:

```sh
npx tsc
```

See `/dist` for the compiled code.
