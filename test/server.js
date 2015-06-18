'use strict';

var http = require('http');
var server = http.createServer(handleRequest);
var options;

if (process.argv[2] === 'start') {
    new Server({
        mode: process.argv[3]
    }, function(){
        console.log("Server Started");
    });
}

function Server(opts, cb) {
    if (!opts.mode) { throw new Error('options.mode must be set'); }
    options = opts;

    server.listen(3000, function(){
        cb(stop);
    });

}

function stop(cb) {
    server.close(cb);
}

function handleRequest(request, response) {
    if (options.debug) {
        console.log('#', request.url);
    }
    if (r[request.url] && r[request.url][options.mode]) {
        response.writeHead(
            r[request.url][options.mode].code ? r[request.url][options.mode].code : 200,
            r[request.url][options.mode].header ? r[request.url][options.mode].header : {'Content-Type': 'application/json'}
        );
        response.end(JSON.stringify(r[request.url][options.mode].data));
    } else {
        throw new Error(request.url + ' NOT FOUND');
    }
}

var r = {
    '/arcgis/rest/services/images/ImageServer?f=json': {
        download: {
            data: require('./fixtures/ImageServer_json_Download.json')
        },
        noDownload: {
            data: require('./fixtures/ImageServer_json_noDownload.json')
        }
    },
    '/arcgis/rest/services/images/ImageServer/1?f=json': {
        download: {
            data: require('./fixtures/ImageServer-1_json_Download.json')
        }
    },
    '/arcgis/rest/services/images/ImageServer/2?f=json': {
        download: {
            data: require('./fixtures/ImageServer-2_json_Download.json')
        }
    },
    '/arcgis/rest/services/images/ImageServer/3?f=json': {
        download: {
            data: require('./fixtures/ImageServer-3_json_Download.json')
        }
    },
    '/arcgis/rest/services/images/ImageServer/download?rasterIds=1&geometryType=esriGeometryEnvelope&f=json': {
        download: {
            data: require('./fixtures/ImageServer-Download-1_json_Download.json')
        }
    },
    '/arcgis/rest/services/images/ImageServer/download?rasterIds=2&geometryType=esriGeometryEnvelope&f=json': {
        download: {
            data: require('./fixtures/ImageServer-Download-2_json_Download.json')
        }
    }
};

module.exports = Server;
