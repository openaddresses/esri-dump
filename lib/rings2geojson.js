/* Code from https://github.com/Esri/Terraformer
   and https://github.com/Esri/terraformer-arcgis-parser
   Copyright (c) 2013 Esri, Inc
 */

// Determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
// or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
// points-are-in-clockwise-order
function ringIsClockwise(ringToTest) {
    let total = 0,
        i = 0,
        pt1 = ringToTest[i],
        pt2;
    const rLength = ringToTest.length;
    for (i; i < rLength - 1; i++) {
        pt2 = ringToTest[i + 1];
        total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
        pt1 = pt2;
    }
    return (total >= 0);
}

// checks if the first and last points of a ring are equal and closes the ring

function closeRing(coordinates) {
    if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
        coordinates.push(coordinates[0]);
    }
    return coordinates;
}

// checks if 2 x,y points are equal

function pointsEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

function coordinatesContainCoordinates(outer, inner) {
    const intersects = arraysIntersectArrays(outer, inner);
    const contains = coordinatesContainPoint(outer, inner[0]);
    if (!intersects && contains) {
        return true;
    }
    return false;
}

function coordinatesContainPoint(coordinates, point) {
    let contains = false;
    for (let i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
        if (((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1]) ||
                (coordinates[j][1] <= point[1] && point[1] < coordinates[i][1])) &&
            (point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0])) {
            contains = !contains;
        }
    }
    return contains;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function edgeIntersectsEdge(a1, a2, b1, b2) {
    const ua_t = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
    const ub_t = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
    const u_b = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

    if (u_b !== 0) {
        const ua = ua_t / u_b;
        const ub = ub_t / u_b;

        if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            return true;
        }
    }

    return false;
}

function arraysIntersectArrays(a, b) {
    if (isNumber(a[0][0])) {
        if (isNumber(b[0][0])) {
            for (let i = 0; i < a.length - 1; i++) {
                for (let j = 0; j < b.length - 1; j++) {
                    if (edgeIntersectsEdge(a[i], a[i + 1], b[j], b[j + 1])) {
                        return true;
                    }
                }
            }
        } else {
            for (let k = 0; k < b.length; k++) {
                if (arraysIntersectArrays(a, b[k])) {
                    return true;
                }
            }
        }
    } else {
        for (let l = 0; l < a.length; l++) {
            if (arraysIntersectArrays(a[l], b)) {
                return true;
            }
        }
    }
    return false;
}

// Do any polygons in this array contain any other polygons in this array?
// used for checking for holes in arcgis rings
// from https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L170

export default function (rings) {
    const outerRings = [];
    const holes = [];

    // for each ring
    for (let r = 0; r < rings.length; r++) {
        const ring = closeRing(rings[r].slice(0));
        if (ring.length < 4) {
            continue;
        }
        // is this ring an outer ring? is it clockwise?
        if (ringIsClockwise(ring)) {
            const polygon = [ring];
            outerRings.push(polygon); // push to outer rings
        } else {
            holes.push(ring); // counterclockwise push to holes
        }
    }

    // while there are holes left...
    while (holes.length) {
        // pop a hole off out stack
        const hole = holes.pop();
        let matched = false;

        // loop over all outer rings and see if they contain our hole.
        for (let x = outerRings.length - 1; x >= 0; x--) {
            const outerRing = outerRings[x][0];
            if (coordinatesContainCoordinates(outerRing, hole)) {
                // the hole is contained push it into our polygon
                outerRings[x].push(hole);

                // we matched the hole
                matched = true;

                // stop checking to see if other outer rings contian this hole
                break;
            }
        }

        // no outer rings contain this hole turn it into and outer ring (reverse it)
        if (!matched) {
            outerRings.push([hole.reverse()]);
        }
    }

    if (outerRings.length === 1) {
        return {
            type: 'Polygon',
            coordinates: outerRings[0]
        };
    } else {
        return {
            type: 'MultiPolygon',
            coordinates: outerRings
        };
    }
}
