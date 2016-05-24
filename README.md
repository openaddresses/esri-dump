esri-dump
=========

A Node module to assist with pulling data out of an ESRI ArcGIS REST server into GeoJSON or ImageryURLs.

This is based on [Python code](http://github.com/iandees/esri-dump) @iandees wrote to do the same thing.

## install

    npm install -g esri-dump

## API

exposes a function, which if you give it a url, will return a stream of the geojson features.

```js
var esriDump = require("esri-dump");
var jsonStream = esriDump(url);
var featureCollection = {
  type: 'FeatureCollection',
  features: []
}
jsonStream.on('type', function(type) {
    //Emitted before any data events
    //emits one of
    // - `MapServer'
    // - 'ImageServer'
});

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

## Data Output

### FeatureServer and MapServer

Output from an ESRI `FeatureServer` or an ESRI `MapServer` is returned as GeoJSON like the example below.

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

Output from an ESRI `ImageServer` is returned as GeoJSON extents for the image like in the example below.
Each GeoJSON feature will include an `id` in the properties which refers to its Raster ID from the server.
It will also include a `files` array which will contain the URL of the image as well as additional metadata.

```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": 1,
                "files": [
                    {
                        "url": "http://example.com/image.tif",
                        "name": "image.tif"
                    },
                    {
                        "url": "http://example.com/image.tif.ovr",
                        "name": "image.tif.ovr"
                    },
                    {
                        "url": "http://example.com/image.tif.aux.xml",
                        "name": "image.tif.aux.xml"
                    }
                ]
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -116.12798172618578,
                            44.99864757152258
                        ],
                        [
                            -116.12698194645195,
                            45.06444365118384
                        ],
                        [
                            -116.0595423622439,
                            45.06390817866521
                        ],
                        [
                            -116.06061934720236,
                            44.99811331869774
                        ],
                        [
                            -116.12798172618578,
                            44.99864757152258
                        ]
                    ]
                ]
            }
        }
    ]
}
```
