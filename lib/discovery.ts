import EventEmitter from 'node:events';
import Err from '@openaddresses/batch-error';
import Fetch from './fetch.js';
import { Feature } from 'geojson';

export default class Discovery extends EventEmitter {
    baseUrl: URL;

    constructor(url: URL) {
        super();

        this.baseUrl = url;
    }

    async fetch(opts: {
        schema?: boolean
    }) {
        this.emit('done');
    }
}

