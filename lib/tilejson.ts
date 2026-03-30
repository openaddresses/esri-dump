import { readFileSync } from 'node:fs';
import proj4 from 'proj4';

export type TileJSONResourceType = 'FeatureServer' | 'MapServer' | 'ImageServer';

interface SpatialReference {
    wkid?: number;
    latestWkid?: number;
    wkt?: string;
}

interface Extent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference?: SpatialReference;
}

interface TileJSONVectorLayer {
    id: string;
    fields: Record<string, string>;
}

export interface TileJSONDocument {
    tilejson: '3.0.0';
    version: '1.0.0';
    scheme: 'xyz';
    type: 'vector' | 'raster';
    name?: string;
    description?: string;
    attribution?: string;
    bounds?: [number, number, number, number];
    center?: [number, number];
    minzoom: number;
    maxzoom: number;
    vector_layers?: TileJSONVectorLayer[];
}

const WKID = JSON.parse(
    readFileSync(new URL('./wkid.json', import.meta.url), 'utf8')
) as Record<string, string>;

const FIELD_TYPES: Record<string, string> = {
    esriFieldTypeDate: 'date-time',
    esriFieldTypeString: 'string',
    esriFieldTypeDouble: 'number',
    esriFieldTypeSingle: 'number',
    esriFieldTypeOID: 'number',
    esriFieldTypeInteger: 'integer',
    esriFieldTypeSmallInteger: 'integer',
    esriFieldTypeGlobalID: 'string',
    esriFieldTypeGUID: 'string',
    esriFieldTypeXML: 'string'
};

function stripVerticalReference(wkt: string): string {
    for (const marker of [',VERTCS[', ',VERTCRS[']) {
        const start = wkt.indexOf(marker);
        if (start === -1) continue;

        let depth = 0;
        let seenOpen = false;

        for (let index = start; index < wkt.length; index++) {
            const char = wkt[index];

            if (char === '[') {
                depth++;
                seenOpen = true;
            } else if (char === ']') {
                depth--;

                if (seenOpen && depth === 0) {
                    return wkt.slice(0, start) + wkt.slice(index + 1);
                }
            }
        }
    }

    return wkt;
}

function projectionDefinition(spatialReference?: SpatialReference): string {
    if (!spatialReference) return 'EPSG:4326';
    if (spatialReference.wkt) return stripVerticalReference(spatialReference.wkt);

    const candidates = [
        spatialReference.latestWkid,
        spatialReference.wkid
    ].filter((candidate): candidate is number => typeof candidate === 'number');

    for (const candidate of candidates) {
        if (candidate === 4326) return 'EPSG:4326';
        if (WKID[String(candidate)]) return WKID[String(candidate)];
    }

    if (typeof spatialReference.latestWkid === 'number') return `EPSG:${spatialReference.latestWkid}`;
    if (typeof spatialReference.wkid === 'number') return `EPSG:${spatialReference.wkid}`;

    return 'EPSG:4326';
}

function extentFromMetadata(metadata: any): Extent | undefined {
    if (metadata.fullExtent) return metadata.fullExtent as Extent;
    if (metadata.extent) return metadata.extent as Extent;
    if (metadata.initialExtent) return metadata.initialExtent as Extent;
    return undefined;
}

function boundsFromExtent(extent?: Extent): [number, number, number, number] | undefined {
    if (!extent) return undefined;

    if (
        !extent.spatialReference
        || extent.spatialReference.wkid === 4326
        || extent.spatialReference.latestWkid === 4326
    ) {
        return [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
    }

    const source = projectionDefinition(extent.spatialReference);
    const corners = [
        proj4(source, 'EPSG:4326', [extent.xmin, extent.ymin]),
        proj4(source, 'EPSG:4326', [extent.xmin, extent.ymax]),
        proj4(source, 'EPSG:4326', [extent.xmax, extent.ymin]),
        proj4(source, 'EPSG:4326', [extent.xmax, extent.ymax])
    ] as Array<[number, number]>;

    return [
        Math.min(...corners.map(([lon]) => lon)),
        Math.min(...corners.map(([, lat]) => lat)),
        Math.max(...corners.map(([lon]) => lon)),
        Math.max(...corners.map(([, lat]) => lat))
    ];
}

function zoomRange(metadata: any): { minzoom: number; maxzoom: number } {
    if (metadata.tileInfo && Array.isArray(metadata.tileInfo.lods) && metadata.tileInfo.lods.length) {
        return {
            minzoom: Number(metadata.tileInfo.lods[0].level),
            maxzoom: Number(metadata.tileInfo.lods[metadata.tileInfo.lods.length - 1].level)
        };
    }

    if (!isNaN(Number(metadata.minLOD)) || !isNaN(Number(metadata.maxLOD))) {
        return {
            minzoom: isNaN(Number(metadata.minLOD)) ? 0 : Number(metadata.minLOD),
            maxzoom: isNaN(Number(metadata.maxLOD)) ? 22 : Number(metadata.maxLOD)
        };
    }

    return { minzoom: 0, maxzoom: 22 };
}

function vectorLayers(metadata: any): TileJSONVectorLayer[] | undefined {
    if (!Array.isArray(metadata.fields)) return undefined;

    const fields = Object.fromEntries(
        metadata.fields
            .filter((field: any) => !['esriFieldTypeGeometry', 'esriFieldTypeBlob', 'esriFieldTypeRaster'].includes(String(field.type)))
            .map((field: any) => {
                return [String(field.name), FIELD_TYPES[String(field.type)] || 'string'] as const;
            })
    );

    return [{
        id: 'out',
        fields
    }];
}

function sourceType(metadata: any, resourceType?: TileJSONResourceType): 'vector' | 'raster' {
    if (resourceType === 'ImageServer') return 'raster';
    if (metadata.geometryType) return 'vector';
    if (metadata.serviceDataType) return 'raster';
    return 'vector';
}

export default function TileJSON(
    metadata: any,
    opts: {
        resourceType?: TileJSONResourceType;
    } = {}
): TileJSONDocument {
    const bounds = boundsFromExtent(extentFromMetadata(metadata));
    const { minzoom, maxzoom } = zoomRange(metadata);
    const type = sourceType(metadata, opts.resourceType);
    const name = metadata.name || metadata.mapName || metadata.documentInfo?.Title;
    const description = metadata.description || metadata.serviceDescription || '';
    const attribution = metadata.copyrightText || undefined;

    const doc: TileJSONDocument = {
        tilejson: '3.0.0',
        version: '1.0.0',
        scheme: 'xyz',
        type,
        minzoom,
        maxzoom
    };

    if (name) doc.name = String(name);
    if (description) doc.description = String(description);
    if (attribution) doc.attribution = String(attribution);

    if (bounds) {
        doc.bounds = bounds;
        doc.center = [
            (bounds[0] + bounds[2]) / 2,
            (bounds[1] + bounds[3]) / 2
        ];
    }

    if (type === 'vector') {
        const layers = vectorLayers(metadata);
        if (layers) doc.vector_layers = layers;
    }

    return doc;
}
