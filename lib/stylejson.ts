// ESRI Color: [R, G, B, A] where A is 0-255
export type EsriColor = [number, number, number, number];

// --- Outline ---

export interface EsriOutline {
    type?: 'esriSLS';
    style?: EsriSimpleLineStyle;
    color?: EsriColor;
    width?: number;
}

// --- Symbol Style Enums ---

export type EsriSimpleMarkerStyle =
    | 'esriSMSCircle'
    | 'esriSMSCross'
    | 'esriSMSDiamond'
    | 'esriSMSSquare'
    | 'esriSMSX'
    | 'esriSMSTriangle';

export type EsriSimpleLineStyle =
    | 'esriSLSSolid'
    | 'esriSLSDash'
    | 'esriSLSDashDot'
    | 'esriSLSDashDotDot'
    | 'esriSLSDot'
    | 'esriSLSLongDash'
    | 'esriSLSLongDashDot'
    | 'esriSLSNull'
    | 'esriSLSShortDash'
    | 'esriSLSShortDashDot'
    | 'esriSLSShortDashDotDot'
    | 'esriSLSShortDot';

export type EsriSimpleFillStyle =
    | 'esriSFSSolid'
    | 'esriSFSBackwardDiagonal'
    | 'esriSFSCross'
    | 'esriSFSDiagonalCross'
    | 'esriSFSForwardDiagonal'
    | 'esriSFSHorizontal'
    | 'esriSFSNull'
    | 'esriSFSVertical';

// --- Symbols ---

export interface EsriSimpleMarkerSymbol {
    type: 'esriSMS';
    style: EsriSimpleMarkerStyle;
    color: EsriColor;
    size: number;
    angle?: number;
    xoffset?: number;
    yoffset?: number;
    outline?: EsriOutline;
}

export interface EsriSimpleLineSymbol {
    type: 'esriSLS';
    style: EsriSimpleLineStyle;
    color: EsriColor;
    width: number;
}

export interface EsriSimpleFillSymbol {
    type: 'esriSFS';
    style: EsriSimpleFillStyle;
    color: EsriColor;
    outline?: EsriOutline;
}

export interface EsriPictureMarkerSymbol {
    type: 'esriPMS';
    url?: string;
    imageData?: string;
    contentType?: string;
    width: number;
    height: number;
    angle?: number;
    xoffset?: number;
    yoffset?: number;
}

export interface EsriPictureFillSymbol {
    type: 'esriPFS';
    url?: string;
    imageData?: string;
    contentType?: string;
    width: number;
    height: number;
    xoffset?: number;
    yoffset?: number;
    xscale?: number;
    yscale?: number;
    outline?: EsriOutline;
}

export interface EsriTextSymbol {
    type: 'esriTS';
    color: EsriColor;
    backgroundColor?: EsriColor;
    borderLineColor?: EsriColor;
    borderLineSize?: number;
    verticalAlignment?: 'baseline' | 'top' | 'middle' | 'bottom';
    horizontalAlignment?: 'left' | 'right' | 'center' | 'justify';
    rightToLeft?: boolean;
    angle?: number;
    xoffset?: number;
    yoffset?: number;
    kerning?: boolean;
    haloColor?: EsriColor;
    haloSize?: number;
    font?: EsriFont;
}

export interface EsriFont {
    family?: string;
    size?: number;
    style?: 'italic' | 'normal' | 'oblique';
    weight?: 'bold' | 'bolder' | 'lighter' | 'normal';
    decoration?: 'line-through' | 'underline' | 'none';
}

export type EsriSymbol =
    | EsriSimpleMarkerSymbol
    | EsriSimpleLineSymbol
    | EsriSimpleFillSymbol
    | EsriPictureMarkerSymbol
    | EsriPictureFillSymbol
    | EsriTextSymbol;

// --- Renderers ---

export interface EsriSimpleRenderer {
    type: 'simple';
    symbol: EsriSymbol;
    label?: string;
    description?: string;
}

export interface EsriUniqueValueInfo {
    symbol: EsriSymbol;
    value: string;
    label?: string;
    description?: string;
}

export interface EsriUniqueValueRenderer {
    type: 'uniqueValue';
    field1: string;
    field2?: string;
    field3?: string;
    fieldDelimiter?: string;
    defaultSymbol?: EsriSymbol;
    defaultLabel?: string;
    uniqueValueInfos: EsriUniqueValueInfo[];
}

export interface EsriClassBreakInfo {
    classMinValue?: number;
    classMaxValue: number;
    symbol: EsriSymbol;
    label?: string;
    description?: string;
}

export interface EsriClassBreaksRenderer {
    type: 'classBreaks';
    field: string;
    classificationMethod?: string;
    normalizationType?: string;
    normalizationField?: string;
    normalizationTotal?: number;
    minValue?: number;
    defaultSymbol?: EsriSymbol;
    defaultLabel?: string;
    classBreakInfos: EsriClassBreakInfo[];
}

export type EsriRenderer =
    | EsriSimpleRenderer
    | EsriUniqueValueRenderer
    | EsriClassBreaksRenderer;

// --- Labeling ---

export interface EsriLabelingInfo {
    labelPlacement?: string;
    labelExpression?: string;
    useCodedValues?: boolean;
    symbol?: EsriTextSymbol;
    minScale?: number;
    maxScale?: number;
    where?: string;
}

// --- Drawing Info (top-level) ---

export interface EsriDrawingInfo {
    renderer?: EsriRenderer;
    transparency?: number;
    labelingInfo?: EsriLabelingInfo[] | null;
}

// --- MapLibre Output ---

export interface MapLibreStyle {
    version: 8;
    name?: string;
    metadata?: Record<string, unknown>;
    sources: Record<string, unknown>;
    layers: MapLibreLayer[];
    sprite?: string;
    glyphs?: string;
}

interface LayerBase {
    id: string;
    source: string;
    'source-layer'?: string;
    filter?: unknown;
    minzoom?: number;
    maxzoom?: number;
}

export interface MapLibreCircleLayer extends LayerBase {
    type: 'circle';
    paint?: Record<string, unknown>;
    layout?: Record<string, unknown>;
}

export interface MapLibreLineLayer extends LayerBase {
    type: 'line';
    paint?: Record<string, unknown>;
    layout?: Record<string, unknown>;
}

export interface MapLibreFillLayer extends LayerBase {
    type: 'fill';
    paint?: Record<string, unknown>;
    layout?: Record<string, unknown>;
}

export interface MapLibreSymbolLayer extends LayerBase {
    type: 'symbol';
    paint?: Record<string, unknown>;
    layout?: Record<string, unknown>;
}

export type MapLibreLayer =
    | MapLibreCircleLayer
    | MapLibreLineLayer
    | MapLibreFillLayer
    | MapLibreSymbolLayer;

export interface SpriteImage {
    id: string;
    imageData: string;
    contentType: string;
    width: number;
    height: number;
}

// =====================================================================
// Constants
// =====================================================================

const SOURCE_ID = 'esri';
const SOURCE_LAYER = 'out';

// =====================================================================
// Color & Size Helpers
// =====================================================================

function rgba(color?: EsriColor): string {
    if (!color) return 'rgba(0,0,0,1)';
    const [r, g, b, a = 255] = color;
    return `rgba(${r},${g},${b},${round(a / 255)})`;
}

function layerOpacity(transparency?: number): number {
    if (typeof transparency !== 'number' || transparency <= 0) return 1;
    return round(1 - transparency / 100);
}

function round(n: number): number {
    return Math.round(n * 1000) / 1000;
}

/** ESRI sizes are in points; MapLibre uses pixels (1 pt ≈ 1.333 px at 96 dpi) */
function ptToPx(pt: number): number {
    return Math.round(pt * 4 / 3 * 100) / 100;
}

// =====================================================================
// Line Dash Patterns
// =====================================================================

const DASH_PATTERNS: Record<string, number[] | undefined> = {
    esriSLSSolid: undefined,
    esriSLSDash: [4, 3],
    esriSLSDot: [1, 3],
    esriSLSDashDot: [4, 3, 1, 3],
    esriSLSDashDotDot: [4, 3, 1, 3, 1, 3],
    esriSLSLongDash: [8, 3],
    esriSLSLongDashDot: [8, 3, 1, 3],
    esriSLSShortDash: [4, 1],
    esriSLSShortDot: [1, 1],
    esriSLSShortDashDot: [4, 1, 1, 1],
    esriSLSShortDashDotDot: [4, 1, 1, 1, 1, 1],
    esriSLSNull: undefined,
};

// =====================================================================
// Sprite ID
// =====================================================================

function spriteId(symbol: EsriPictureMarkerSymbol | EsriPictureFillSymbol): string {
    if (symbol.url) return `esri-${symbol.url}`;
    let hash = 0;
    const s = symbol.imageData || '';
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0;
    }
    return `esri-${Math.abs(hash).toString(36)}`;
}

function collectSprite(
    symbol: EsriPictureMarkerSymbol | EsriPictureFillSymbol,
    sprites: SpriteImage[]
): void {
    if (!symbol.imageData) return;
    const id = spriteId(symbol);
    if (sprites.some((s) => s.id === id)) return;
    sprites.push({
        id,
        imageData: symbol.imageData,
        contentType: symbol.contentType || 'image/png',
        width: symbol.width,
        height: symbol.height,
    });
}

// =====================================================================
// Expression Builders
// =====================================================================

/**
 * Build a MapLibre `match` expression.  If every entry produces the same
 * result as the fallback the static value is returned instead.
 */
function matchExpr(
    fieldExpr: unknown[],
    entries: Array<{ value: string | number; result: unknown }>,
    fallback: unknown,
): unknown {
    if (entries.length === 0) return fallback;
    const allSame = entries.every((e) =>
        JSON.stringify(e.result) === JSON.stringify(fallback)
    );
    if (allSame) return fallback;
    const expr: unknown[] = ['match', fieldExpr];
    for (const e of entries) expr.push(e.value, e.result);
    expr.push(fallback);
    return expr;
}

/**
 * Build a MapLibre `step` expression.
 */
function stepExpr(
    fieldExpr: unknown[],
    breaks: Array<{ stop: number; result: unknown }>,
    fallback: unknown,
): unknown {
    if (breaks.length === 0) return fallback;
    const expr: unknown[] = ['step', fieldExpr, fallback];
    for (const b of breaks) expr.push(b.stop, b.result);
    return expr;
}

/**
 * Return the field expression for a unique-value renderer, handling the
 * multi-field + delimiter case.
 */
function uvFieldExpr(renderer: EsriUniqueValueRenderer): unknown[] {
    const fields = [renderer.field1, renderer.field2, renderer.field3]
        .filter(Boolean) as string[];
    if (fields.length === 1) return ['get', fields[0]];
    const delim = renderer.fieldDelimiter || ',';
    const parts: unknown[] = ['concat'];
    for (let i = 0; i < fields.length; i++) {
        if (i > 0) parts.push(delim);
        parts.push(['get', fields[i]]);
    }
    return parts;
}

/**
 * Try to parse a string value as a number for use in match expressions.
 * ESRI serialises all unique-value values as strings, but the underlying
 * field may be numeric.
 */
function parseValue(v: string): string | number {
    const n = Number(v);
    if (!isNaN(n) && String(n) === v) return n;
    return v;
}

// =====================================================================
// Symbol ➜ MapLibre Layer Type
// =====================================================================

type MLLayerType = 'circle' | 'line' | 'fill' | 'symbol';

function symbolToMLType(symbol: EsriSymbol): MLLayerType {
    switch (symbol.type) {
        case 'esriSMS': return 'circle';
        case 'esriSLS': return 'line';
        case 'esriSFS': return 'fill';
        case 'esriPMS': return 'symbol';
        case 'esriPFS': return 'fill';
        case 'esriTS':  return 'symbol';
    }
}

// =====================================================================
// Per-symbol property extractors  (return plain values for expressions)
// =====================================================================

interface CircleProps {
    color: string; radius: number;
    strokeColor: string; strokeWidth: number;
}

function circleProps(s: EsriSimpleMarkerSymbol): CircleProps {
    return {
        color: rgba(s.color),
        radius: ptToPx(s.size / 2),
        strokeColor: s.outline ? rgba(s.outline.color) : 'rgba(0,0,0,0)',
        strokeWidth: s.outline && s.outline.style !== 'esriSLSNull'
            ? (s.outline.width ?? 1)
            : 0,
    };
}

interface LineProps {
    color: string; width: number; dash?: number[];
    opacity: number;
}

function lineProps(s: EsriSimpleLineSymbol): LineProps {
    return {
        color: rgba(s.color),
        width: ptToPx(s.width),
        dash: DASH_PATTERNS[s.style],
        opacity: s.style === 'esriSLSNull' ? 0 : 1,
    };
}

interface FillProps {
    color: string; opacity: number;
    outlineColor?: string; outlineWidth?: number; outlineDash?: number[];
}

function fillProps(s: EsriSimpleFillSymbol): FillProps {
    const fp: FillProps = {
        color: rgba(s.color),
        opacity: s.style === 'esriSFSNull' ? 0 : 1,
    };
    if (s.outline && s.outline.style !== 'esriSLSNull') {
        fp.outlineColor = rgba(s.outline.color);
        fp.outlineWidth = s.outline.width ?? 1;
        fp.outlineDash = DASH_PATTERNS[s.outline.style || 'esriSLSSolid'];
    }
    return fp;
}

// =====================================================================
// Simple Renderer ➜ layers
// =====================================================================

function simpleRendererLayers(
    renderer: EsriSimpleRenderer,
    transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    return symbolLayers('esri-layer', renderer.symbol, transparency, sprites);
}

function symbolLayers(
    id: string,
    symbol: EsriSymbol,
    transparency: number | undefined,
    sprites: SpriteImage[],
    filter?: unknown,
): MapLibreLayer[] {
    const base: LayerBase = {
        id,
        source: SOURCE_ID,
        'source-layer': SOURCE_LAYER,
        ...(filter ? { filter } : {}),
    };

    switch (symbol.type) {
        case 'esriSMS': {
            const p = circleProps(symbol);
            return [{
                ...base, type: 'circle' as const,
                paint: {
                    'circle-color': p.color,
                    'circle-radius': p.radius,
                    'circle-opacity': layerOpacity(transparency),
                    'circle-stroke-color': p.strokeColor,
                    'circle-stroke-width': p.strokeWidth,
                    'circle-stroke-opacity': layerOpacity(transparency),
                },
            }];
        }
        case 'esriSLS': {
            const p = lineProps(symbol);
            const paint: Record<string, unknown> = {
                'line-color': p.color,
                'line-width': p.width,
                'line-opacity': p.opacity * layerOpacity(transparency),
            };
            if (p.dash) paint['line-dasharray'] = p.dash;
            return [{ ...base, type: 'line' as const, paint }];
        }
        case 'esriSFS': {
            const p = fillProps(symbol);
            const layers: MapLibreLayer[] = [{
                ...base, type: 'fill' as const,
                paint: {
                    'fill-color': p.color,
                    'fill-opacity': p.opacity * layerOpacity(transparency),
                },
            }];
            if (p.outlineColor) {
                const olPaint: Record<string, unknown> = {
                    'line-color': p.outlineColor,
                    'line-width': p.outlineWidth ?? 1,
                    'line-opacity': layerOpacity(transparency),
                };
                if (p.outlineDash) olPaint['line-dasharray'] = p.outlineDash;
                layers.push({
                    ...base, id: `${id}-outline`, type: 'line' as const,
                    paint: olPaint,
                });
            }
            return layers;
        }
        case 'esriPMS': {
            collectSprite(symbol, sprites);
            const layout: Record<string, unknown> = {
                'icon-image': spriteId(symbol),
                'icon-allow-overlap': true,
            };
            if (symbol.angle) layout['icon-rotate'] = symbol.angle;
            if (symbol.xoffset || symbol.yoffset) {
                layout['icon-offset'] = [symbol.xoffset || 0, symbol.yoffset || 0];
            }
            const paint: Record<string, unknown> = {};
            const op = layerOpacity(transparency);
            if (op < 1) paint['icon-opacity'] = op;
            return [{ ...base, type: 'symbol' as const, layout, paint }];
        }
        case 'esriPFS': {
            collectSprite(symbol, sprites);
            const layers: MapLibreLayer[] = [{
                ...base, type: 'fill' as const,
                paint: {
                    'fill-pattern': spriteId(symbol),
                    'fill-opacity': layerOpacity(transparency),
                },
            }];
            if (symbol.outline && symbol.outline.style !== 'esriSLSNull') {
                const olPaint: Record<string, unknown> = {
                    'line-color': rgba(symbol.outline.color),
                    'line-width': symbol.outline.width ?? 1,
                    'line-opacity': layerOpacity(transparency),
                };
                const dash = DASH_PATTERNS[symbol.outline.style || 'esriSLSSolid'];
                if (dash) olPaint['line-dasharray'] = dash;
                layers.push({
                    ...base, id: `${id}-outline`, type: 'line' as const,
                    paint: olPaint,
                });
            }
            return layers;
        }
        case 'esriTS': {
            const layout: Record<string, unknown> = {};
            const paint: Record<string, unknown> = {
                'text-color': rgba(symbol.color),
            };
            if (symbol.font) {
                const family = symbol.font.family || 'Arial Unicode MS';
                const bold = symbol.font.weight === 'bold' || symbol.font.weight === 'bolder';
                layout['text-font'] = [bold ? `${family} Bold` : `${family} Regular`];
                if (typeof symbol.font.size === 'number') {
                    layout['text-size'] = ptToPx(symbol.font.size);
                }
            }
            if (symbol.angle) layout['text-rotate'] = symbol.angle;
            if (symbol.haloColor) paint['text-halo-color'] = rgba(symbol.haloColor);
            if (typeof symbol.haloSize === 'number') paint['text-halo-width'] = ptToPx(symbol.haloSize);
            const op = layerOpacity(transparency);
            if (op < 1) paint['text-opacity'] = op;
            return [{ ...base, type: 'symbol' as const, layout, paint }];
        }
    }
}

// =====================================================================
// Unique-Value Renderer ➜ layers  (uses `match` expressions)
// =====================================================================

function uniqueValueRendererLayers(
    renderer: EsriUniqueValueRenderer,
    transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    const infos = renderer.uniqueValueInfos;
    if (!infos || infos.length === 0) {
        if (renderer.defaultSymbol) {
            return symbolLayers('esri-layer', renderer.defaultSymbol, transparency, sprites);
        }
        return [];
    }

    // Group by target MapLibre layer type
    const groups = new Map<MLLayerType, EsriUniqueValueInfo[]>();
    for (const info of infos) {
        const t = symbolToMLType(info.symbol);
        if (!groups.has(t)) groups.set(t, []);
        groups.get(t)!.push(info);
    }

    // All same type → single layer with match expressions
    if (groups.size === 1) {
        const mlType = [...groups.keys()][0];
        return uvSameTypeLayers(mlType, renderer, transparency, sprites);
    }

    // Mixed types → separate layers per type with filters
    return uvMixedTypeLayers(groups, renderer, transparency, sprites);
}

function uvSameTypeLayers(
    mlType: MLLayerType,
    renderer: EsriUniqueValueRenderer,
    transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    const field = uvFieldExpr(renderer);
    const infos = renderer.uniqueValueInfos;

    switch (mlType) {
        case 'circle': return uvCircleLayers(field, infos, renderer.defaultSymbol, transparency);
        case 'line':   return uvLineLayers(field, infos, renderer.defaultSymbol, transparency);
        case 'fill':   return uvFillLayers(field, infos, renderer.defaultSymbol, transparency);
        case 'symbol': return uvSymbolLayers(field, infos, renderer.defaultSymbol, transparency, sprites);
    }
}

function uvCircleLayers(
    field: unknown[], infos: EsriUniqueValueInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
): MapLibreLayer[] {
    const entries = infos.map((i) => ({ value: parseValue(i.value), props: circleProps(i.symbol as EsriSimpleMarkerSymbol) }));
    const def = defaultSymbol?.type === 'esriSMS'
        ? circleProps(defaultSymbol)
        : { color: 'rgba(0,0,0,1)', radius: 5, strokeColor: 'rgba(0,0,0,0)', strokeWidth: 0 };

    return [{
        id: 'esri-layer', type: 'circle' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        paint: {
            'circle-color': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.color })), def.color),
            'circle-radius': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.radius })), def.radius),
            'circle-opacity': layerOpacity(transparency),
            'circle-stroke-color': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.strokeColor })), def.strokeColor),
            'circle-stroke-width': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.strokeWidth })), def.strokeWidth),
            'circle-stroke-opacity': layerOpacity(transparency),
        },
    }];
}

function uvLineLayers(
    field: unknown[], infos: EsriUniqueValueInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
): MapLibreLayer[] {
    const entries = infos.map((i) => ({ value: parseValue(i.value), props: lineProps(i.symbol as EsriSimpleLineSymbol) }));
    const def = defaultSymbol?.type === 'esriSLS'
        ? lineProps(defaultSymbol)
        : { color: 'rgba(0,0,0,1)', width: 1, opacity: 1 };

    const paint: Record<string, unknown> = {
        'line-color': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.color })), def.color),
        'line-width': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.width })), def.width),
        'line-opacity': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.opacity * layerOpacity(transparency) })), def.opacity * layerOpacity(transparency)),
    };
    // dash-array doesn't support expressions; use the most common pattern
    const dashes = entries.map((e) => e.props.dash).filter(Boolean);
    if (dashes.length > 0) paint['line-dasharray'] = dashes[0];

    return [{
        id: 'esri-layer', type: 'line' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        paint,
    }];
}

function uvFillLayers(
    field: unknown[], infos: EsriUniqueValueInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
): MapLibreLayer[] {
    const entries = infos.map((i) => ({ value: parseValue(i.value), props: fillProps(i.symbol as EsriSimpleFillSymbol) }));
    const def = defaultSymbol?.type === 'esriSFS'
        ? fillProps(defaultSymbol)
        : { color: 'rgba(0,0,0,1)', opacity: 1 };

    const layers: MapLibreLayer[] = [{
        id: 'esri-layer', type: 'fill' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        paint: {
            'fill-color': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.color })), def.color),
            'fill-opacity': matchExpr(field, entries.map((e) => ({ value: e.value, result: e.props.opacity * layerOpacity(transparency) })), (def.opacity ?? 1) * layerOpacity(transparency)),
        },
    }];

    // Outline layer if any symbol has one
    const hasOutline = entries.some((e) => e.props.outlineColor);
    if (hasOutline) {
        const defOlColor = def.outlineColor || 'rgba(0,0,0,0)';
        const defOlWidth = def.outlineWidth ?? 0;
        layers.push({
            id: 'esri-layer-outline', type: 'line' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
            paint: {
                'line-color': matchExpr(field, entries.filter((e) => e.props.outlineColor).map((e) => ({ value: e.value, result: e.props.outlineColor! })), defOlColor),
                'line-width': matchExpr(field, entries.filter((e) => e.props.outlineWidth != null).map((e) => ({ value: e.value, result: e.props.outlineWidth! })), defOlWidth),
                'line-opacity': layerOpacity(transparency),
            },
        });
    }
    return layers;
}

function uvSymbolLayers(
    field: unknown[], infos: EsriUniqueValueInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    for (const info of infos) {
        const s = info.symbol;
        if (s.type === 'esriPMS' || s.type === 'esriPFS') collectSprite(s, sprites);
    }
    if (defaultSymbol && (defaultSymbol.type === 'esriPMS' || defaultSymbol.type === 'esriPFS')) {
        collectSprite(defaultSymbol, sprites);
    }

    const pmsInfos = infos.filter((i) => i.symbol.type === 'esriPMS');
    const defaultPms = defaultSymbol?.type === 'esriPMS' ? defaultSymbol : undefined;

    const defaultImage = defaultPms ? spriteId(defaultPms) : '';
    const entries = pmsInfos.map((i) => ({
        value: parseValue(i.value),
        result: spriteId(i.symbol as EsriPictureMarkerSymbol),
    }));

    const layout: Record<string, unknown> = {
        'icon-image': matchExpr(field, entries, defaultImage),
        'icon-allow-overlap': true,
    };
    const paint: Record<string, unknown> = {};
    const op = layerOpacity(transparency);
    if (op < 1) paint['icon-opacity'] = op;

    return [{
        id: 'esri-layer', type: 'symbol' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        layout, paint,
    }];
}

function uvMixedTypeLayers(
    groups: Map<MLLayerType, EsriUniqueValueInfo[]>,
    renderer: EsriUniqueValueRenderer,
    transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    const field = uvFieldExpr(renderer);
    const layers: MapLibreLayer[] = [];
    let idx = 0;

    for (const [, infos] of groups) {
        for (const info of infos) {
            const id = `esri-layer-${idx}`;
            const filter = ['==', field, parseValue(info.value)];
            layers.push(...symbolLayers(id, info.symbol, transparency, sprites, filter));
            idx++;
        }
    }

    // Default symbol for unmatched values
    if (renderer.defaultSymbol) {
        const matchedValues = renderer.uniqueValueInfos.map((i) => parseValue(i.value));
        const filter = ['!', ['in', field, ['literal', matchedValues]]];
        layers.push(...symbolLayers(`esri-layer-default`, renderer.defaultSymbol, transparency, sprites, filter));
    }

    return layers;
}

// =====================================================================
// Class-Breaks Renderer ➜ layers  (uses `step` expressions)
// =====================================================================

function classBreaksRendererLayers(
    renderer: EsriClassBreaksRenderer,
    transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    const breaks = renderer.classBreakInfos;
    if (!breaks || breaks.length === 0) {
        if (renderer.defaultSymbol) {
            return symbolLayers('esri-layer', renderer.defaultSymbol, transparency, sprites);
        }
        return [];
    }

    // Check all same type
    const types = new Set(breaks.map((b) => symbolToMLType(b.symbol)));
    if (types.size !== 1) {
        return cbMixedTypeLayers(renderer, transparency, sprites);
    }

    const mlType = [...types][0];
    const field: unknown[] = ['get', renderer.field];

    switch (mlType) {
        case 'circle': return cbCircleLayers(field, breaks, renderer.defaultSymbol, transparency);
        case 'line':   return cbLineLayers(field, breaks, renderer.defaultSymbol, transparency);
        case 'fill':   return cbFillLayers(field, breaks, renderer.defaultSymbol, transparency);
        case 'symbol': return cbSymbolLayers(field, breaks, renderer.defaultSymbol, transparency, sprites);
    }
}

function cbCircleLayers(
    field: unknown[], breaks: EsriClassBreakInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
): MapLibreLayer[] {
    const entries = breaks.map((b) => ({ stop: b.classMaxValue, props: circleProps(b.symbol as EsriSimpleMarkerSymbol) }));
    const def = defaultSymbol?.type === 'esriSMS'
        ? circleProps(defaultSymbol)
        : entries[0].props;

    return [{
        id: 'esri-layer', type: 'circle' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        paint: {
            'circle-color': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.color })), def.color),
            'circle-radius': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.radius })), def.radius),
            'circle-opacity': layerOpacity(transparency),
            'circle-stroke-color': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.strokeColor })), def.strokeColor),
            'circle-stroke-width': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.strokeWidth })), def.strokeWidth),
            'circle-stroke-opacity': layerOpacity(transparency),
        },
    }];
}

function cbLineLayers(
    field: unknown[], breaks: EsriClassBreakInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
): MapLibreLayer[] {
    const entries = breaks.map((b) => ({ stop: b.classMaxValue, props: lineProps(b.symbol as EsriSimpleLineSymbol) }));
    const def = defaultSymbol?.type === 'esriSLS'
        ? lineProps(defaultSymbol)
        : entries[0].props;

    const paint: Record<string, unknown> = {
        'line-color': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.color })), def.color),
        'line-width': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.width })), def.width),
        'line-opacity': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.opacity * layerOpacity(transparency) })), def.opacity * layerOpacity(transparency)),
    };
    const dashes = entries.map((e) => e.props.dash).filter(Boolean);
    if (dashes.length > 0) paint['line-dasharray'] = dashes[0];

    return [{
        id: 'esri-layer', type: 'line' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        paint,
    }];
}

function cbFillLayers(
    field: unknown[], breaks: EsriClassBreakInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
): MapLibreLayer[] {
    const entries = breaks.map((b) => ({ stop: b.classMaxValue, props: fillProps(b.symbol as EsriSimpleFillSymbol) }));
    const def = defaultSymbol?.type === 'esriSFS'
        ? fillProps(defaultSymbol)
        : entries[0].props;

    const layers: MapLibreLayer[] = [{
        id: 'esri-layer', type: 'fill' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        paint: {
            'fill-color': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.color })), def.color),
            'fill-opacity': stepExpr(field, entries.map((e) => ({ stop: e.stop, result: e.props.opacity * layerOpacity(transparency) })), (def.opacity ?? 1) * layerOpacity(transparency)),
        },
    }];

    const hasOutline = entries.some((e) => e.props.outlineColor);
    if (hasOutline) {
        const defOlColor = def.outlineColor || 'rgba(0,0,0,0)';
        const defOlWidth = def.outlineWidth ?? 0;
        layers.push({
            id: 'esri-layer-outline', type: 'line' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
            paint: {
                'line-color': stepExpr(field, entries.filter((e) => e.props.outlineColor).map((e) => ({ stop: e.stop, result: e.props.outlineColor! })), defOlColor),
                'line-width': stepExpr(field, entries.filter((e) => e.props.outlineWidth != null).map((e) => ({ stop: e.stop, result: e.props.outlineWidth! })), defOlWidth),
                'line-opacity': layerOpacity(transparency),
            },
        });
    }
    return layers;
}

function cbSymbolLayers(
    field: unknown[], breaks: EsriClassBreakInfo[],
    defaultSymbol: EsriSymbol | undefined, transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    for (const b of breaks) {
        const s = b.symbol;
        if (s.type === 'esriPMS' || s.type === 'esriPFS') collectSprite(s, sprites);
    }
    if (defaultSymbol && (defaultSymbol.type === 'esriPMS' || defaultSymbol.type === 'esriPFS')) {
        collectSprite(defaultSymbol, sprites);
    }

    const entries = breaks
        .filter((b) => b.symbol.type === 'esriPMS')
        .map((b) => ({ stop: b.classMaxValue, result: spriteId(b.symbol as EsriPictureMarkerSymbol) }));
    const defaultImage = defaultSymbol?.type === 'esriPMS' ? spriteId(defaultSymbol) : '';

    const layout: Record<string, unknown> = {
        'icon-image': stepExpr(field, entries, defaultImage),
        'icon-allow-overlap': true,
    };
    const paint: Record<string, unknown> = {};
    const op = layerOpacity(transparency);
    if (op < 1) paint['icon-opacity'] = op;

    return [{
        id: 'esri-layer', type: 'symbol' as const, source: SOURCE_ID, 'source-layer': SOURCE_LAYER,
        layout, paint,
    }];
}

function cbMixedTypeLayers(
    renderer: EsriClassBreaksRenderer,
    transparency: number | undefined,
    sprites: SpriteImage[],
): MapLibreLayer[] {
    const field: unknown[] = ['get', renderer.field];
    const layers: MapLibreLayer[] = [];
    const breaks = renderer.classBreakInfos;

    for (let i = 0; i < breaks.length; i++) {
        const b = breaks[i];
        const lo = b.classMinValue ?? (i > 0 ? breaks[i - 1].classMaxValue : renderer.minValue ?? -Infinity);
        const filter = ['all', ['>=', field, lo], ['<', field, b.classMaxValue]];
        layers.push(...symbolLayers(`esri-layer-${i}`, b.symbol, transparency, sprites, filter));
    }

    if (renderer.defaultSymbol) {
        layers.push(...symbolLayers('esri-layer-default', renderer.defaultSymbol, transparency, sprites));
    }
    return layers;
}

// =====================================================================
// Labeling ➜ symbol layers
// =====================================================================

function labelingLayers(
    labelingInfo: EsriLabelingInfo[],
    transparency: number | undefined,
): MapLibreLayer[] {
    const layers: MapLibreLayer[] = [];

    for (let i = 0; i < labelingInfo.length; i++) {
        const info = labelingInfo[i];
        if (!info.symbol) continue;

        const id = `esri-label-${i}`;
        const layout: Record<string, unknown> = {};
        const paint: Record<string, unknown> = {
            'text-color': rgba(info.symbol.color),
        };

        // Label expression → text-field
        if (info.labelExpression) {
            const match = info.labelExpression.match(/^\[(\w+)\]$/);
            if (match) {
                layout['text-field'] = ['get', match[1]];
            } else {
                // Multi-field: "[FIELD1] DELIM [FIELD2]" → ["concat", ...]
                const parts: unknown[] = ['concat'];
                const re = /\[(\w+)\]|([^[\]]+)/g;
                let m: RegExpExecArray | null;
                while ((m = re.exec(info.labelExpression)) !== null) {
                    if (m[1]) parts.push(['get', m[1]]);
                    else if (m[2]) parts.push(m[2]);
                }
                layout['text-field'] = parts.length > 2 ? parts : info.labelExpression;
            }
        }

        // Font
        if (info.symbol.font) {
            const family = info.symbol.font.family || 'Arial Unicode MS';
            const bold = info.symbol.font.weight === 'bold' || info.symbol.font.weight === 'bolder';
            layout['text-font'] = [bold ? `${family} Bold` : `${family} Regular`];
            if (typeof info.symbol.font.size === 'number') {
                layout['text-size'] = ptToPx(info.symbol.font.size);
            }
        }

        // Placement
        if (info.labelPlacement) {
            const anchor = placementToAnchor(info.labelPlacement);
            if (anchor) layout['text-anchor'] = anchor;
            if (info.labelPlacement.includes('Line')) {
                layout['symbol-placement'] = 'line';
            }
        }

        layout['text-allow-overlap'] = false;

        // Halo
        if (info.symbol.haloColor) paint['text-halo-color'] = rgba(info.symbol.haloColor);
        if (typeof info.symbol.haloSize === 'number') paint['text-halo-width'] = ptToPx(info.symbol.haloSize);

        const op = layerOpacity(transparency);
        if (op < 1) paint['text-opacity'] = op;

        const layer: MapLibreSymbolLayer = {
            id,
            type: 'symbol',
            source: SOURCE_ID,
            'source-layer': SOURCE_LAYER,
            layout,
            paint,
        };

        if (info.where) layer.filter = ['==', 1, 1]; // placeholder — ESRI SQL WHERE isn't directly convertible
        if (info.minScale) layer.maxzoom = scaleToZoom(info.minScale);
        if (info.maxScale) layer.minzoom = scaleToZoom(info.maxScale);

        layers.push(layer);
    }

    return layers;
}

const PLACEMENT_MAP: Record<string, string> = {
    esriServerPointLabelPlacementAboveCenter: 'bottom',
    esriServerPointLabelPlacementAboveLeft: 'bottom-right',
    esriServerPointLabelPlacementAboveRight: 'bottom-left',
    esriServerPointLabelPlacementBelowCenter: 'top',
    esriServerPointLabelPlacementBelowLeft: 'top-right',
    esriServerPointLabelPlacementBelowRight: 'top-left',
    esriServerPointLabelPlacementCenterCenter: 'center',
    esriServerPointLabelPlacementCenterLeft: 'right',
    esriServerPointLabelPlacementCenterRight: 'left',
};

function placementToAnchor(placement: string): string | undefined {
    return PLACEMENT_MAP[placement];
}

/** Rough scale-denominator → zoom conversion */
function scaleToZoom(scale: number): number {
    if (scale <= 0) return 22;
    return Math.round(Math.log2(559082264 / scale) * 100) / 100;
}

// =====================================================================
// Main Export
// =====================================================================

export default function StyleJSON(metadata: any): MapLibreStyle {
    const drawingInfo: EsriDrawingInfo | undefined = metadata.drawingInfo;
    const name: string | undefined =
        metadata.name || metadata.mapName || metadata.documentInfo?.Title;

    const sprites: SpriteImage[] = [];
    let layers: MapLibreLayer[] = [];

    if (drawingInfo?.renderer) {
        switch (drawingInfo.renderer.type) {
            case 'simple':
                layers = simpleRendererLayers(drawingInfo.renderer, drawingInfo.transparency, sprites);
                break;
            case 'uniqueValue':
                layers = uniqueValueRendererLayers(drawingInfo.renderer, drawingInfo.transparency, sprites);
                break;
            case 'classBreaks':
                layers = classBreaksRendererLayers(drawingInfo.renderer, drawingInfo.transparency, sprites);
                break;
        }
    }

    if (drawingInfo?.labelingInfo && drawingInfo.labelingInfo.length > 0) {
        layers.push(...labelingLayers(drawingInfo.labelingInfo, drawingInfo.transparency));
    }

    const style: MapLibreStyle = {
        version: 8,
        sources: {
            [SOURCE_ID]: {
                type: 'vector',
            },
        },
        layers,
    };

    if (name) style.name = String(name);

    if (sprites.length > 0) {
        style.metadata = { 'esri:sprites': sprites };
    }

    return style;
}
