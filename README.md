esri-dump
=========

A Node module to assist with pulling data out of an ESRI ArcGIS REST server into GeoJSON or ImageryURLs.

This is based on [Python code](http://github.com/iandees/esri-dump) @iandees wrote to do the same thing.

## install

    npm install -g esri-dump

## API

exposes a function, which if you give it a url, will return a stream of the geojson/image features.

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

Streams a geojson/image feature collection to stdout

```sh
esri-dump http://services2.bhamaps.com/arcgis/rest/services/AGS_jackson_co_il_taxmap/MapServer/0 > output.geojson
```

## Data Output

### MapServer

Output from an ESRI `MapServer` is retured as GeoJSON like the example below.

```json
{
    "type": "FeatureCollection",
    "features": [
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
    ]
}
```

### ImageServer

Output from an ESRI `ImageServer` is returned in a modified GeoJSON format like the example below.

```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Image",
            "properties": {
                "id": 1
            },
            "feature": [
                {
                    "type": "ImageData",
                    "file": {
                        "url": "http://example.com/image.tif",
                        "name": "image.tif"
                    }
                },
                {
                    "type": "ImageData",
                    "file": {
                        "url": "http://example.com/image.tif.ovr",
                        "name": "image.tif.ovr"
                    }
                },
                {
                    "type": "ImageData",
                    "file": {
                        "url": "http://example.com/image.tif.aux.xml",
                        "name": "image.tif.aux.xml"
                    }
                }
            ]
        }
    ]
}
```
