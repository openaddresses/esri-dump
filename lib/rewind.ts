import {
    GeoJSON,
    FeatureCollection,
    GeometryCollection,
    Feature,
    Polygon,
    MultiPolygon
} from 'geojson';

export default function rewind(gj: GeoJSON, outer?: any) {
    const type = gj && gj.type;

    if (type === 'FeatureCollection') {
        gj = gj as FeatureCollection;
        for (let i = 0; i < gj.features.length; i++) rewind(gj.features[i], outer);

    } else if (type === 'GeometryCollection') {
        gj = gj as GeometryCollection;
        for (let i = 0; i < gj.geometries.length; i++) rewind(gj.geometries[i], outer);

    } else if (type === 'Feature') {
        gj = gj as Feature;
        rewind(gj.geometry, outer);

    } else if (type === 'Polygon') {
        gj = gj as Polygon;
        rewindRings(gj.coordinates, outer);
    } else if (type === 'MultiPolygon') {
        gj = gj as MultiPolygon;
        for (let i = 0; i < gj.coordinates.length; i++) rewindRings(gj.coordinates[i], outer);
    }

    return gj;
}

function rewindRings(rings: Array<any>, outer: any) {
    if (rings.length === 0) return;

    rewindRing(rings[0], outer);
    for (let i = 1; i < rings.length; i++) {
        rewindRing(rings[i], !outer);
    }
}

function rewindRing(ring: Array<any>, dir: any) {
    let area = 0, err = 0;
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
        let k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1]);
        let  m = area + k;
        err += Math.abs(area) >= Math.abs(k) ? area - m + k : k - m + area;
        area = m;
    }
    if (area + err >= 0 !== !!dir) ring.reverse();
}
