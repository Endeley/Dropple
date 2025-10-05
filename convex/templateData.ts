type Id = string;

type Size = { width: number; height: number };
type Point = { x: number; y: number };
type HexColor = string;

type Transform = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    flipX?: boolean;
    flipY?: boolean;
};

type Constraint = 'scale' | 'fixed' | 'pin-left' | 'pin-right' | 'pin-top' | 'pin-bottom' | 'center';

type VariableBinding =
    | { kind: 'text'; key: string }
    | { kind: 'image'; key: string }
    | { kind: 'color'; token: string };

type Stroke = {
    color: HexColor;
    width: number;
    align?: 'inside' | 'center' | 'outside';
    dash?: number[];
    opacity?: number;
};

type Shadow = {
    color: HexColor;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity?: number;
};

type GradientStop = { at: number; color: HexColor };
type GradientValue = {
    type: 'linear' | 'radial';
    angle?: number;
    stops: GradientStop[];
};

type Fill =
    | { kind: 'solid'; color: HexColor }
    | { kind: 'gradient'; gradient: GradientValue }
    | { kind: 'image'; assetId: Id; fit?: string; scale?: number; offset?: Point };

type BaseLayer = {
    id: Id;
    type: 'text' | 'image' | 'shape' | 'group' | 'frame';
    name?: string;
    transform: Transform;
    visible?: boolean;
    locked?: boolean;
    constraints?: Constraint[];
    bindings?: VariableBinding[];
    blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
    zIndex?: number;
    a11yLabel?: string;
    notes?: string;
};

type TextLayer = BaseLayer & {
    type: 'text';
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight?: number | string;
    fontStyle?: 'normal' | 'italic';
    lineHeight?: number;
    letterSpacing?: number;
    fill: HexColor;
    align?: 'left' | 'center' | 'right' | 'justify';
    maxWidth?: number;
    autosize?: 'height' | 'width' | 'both' | 'none';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    decoration?: 'none' | 'underline' | 'line-through';
    paragraphSpacing?: number;
    list?: 'none' | 'bullets' | 'numbers';
};

type ImageLayer = BaseLayer & {
    type: 'image';
    src?: string;
    assetId?: Id;
    fit?: 'cover' | 'contain' | 'fill' | 'fit-width' | 'fit-height';
    cornerRadius?: number | { tl: number; tr: number; br: number; bl: number };
    stroke?: Stroke;
    shadow?: Shadow;
    filters?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        blur?: number;
        grayscale?: number;
    };
    crop?: { x: number; y: number; width: number; height: number };
};

type ShapeLayer = BaseLayer & {
    type: 'shape';
    shape: 'rect' | 'ellipse' | 'line' | 'polygon' | 'star';
    fill?: Fill;
    stroke?: Stroke;
    shadow?: Shadow;
    cornerRadius?: number | { tl: number; tr: number; br: number; bl: number };
    points?: Point[];
    closed?: boolean;
};

type GroupLayer = BaseLayer & {
    type: 'group';
    children: Layer[];
    clip?: boolean;
};

type FrameLayer = BaseLayer & {
    type: 'frame';
    children: Layer[];
    clip?: boolean;
    cornerRadius?: number | { tl: number; tr: number; br: number; bl: number };
    mask?: boolean;
};

export type Layer = TextLayer | ImageLayer | ShapeLayer | GroupLayer | FrameLayer;

export type Artboard = {
    id: Id;
    name?: string;
    size: Size;
    background?:
        | { kind: 'color'; value: HexColor }
        | { kind: 'gradient'; value: GradientValue }
        | { kind: 'image'; assetId: Id; fit?: string; position?: Point; scale?: number };
    layers: Layer[];
    variables?: Record<string, unknown>;
    defaultLayerOrder?: Id[];
    thumbnailUrl?: string;
};

export type TemplateData = {
    version: number;
    artboards: Artboard[];
    defaultArtboardId: Id;
    variables?: Record<string, unknown>;
    colorTokens?: { id: Id; name: string; value: HexColor }[];
    assets?: { id: Id; kind: string; src: string; meta?: Record<string, unknown> }[];
    title?: string;
    slug?: string;
    category?: string;
    description?: string;
    tags?: string[];
    // Legacy fields kept for backward compatibility.
    canvas?: Size;
    background?: string;
    elements?: LegacyElement[];
    brandBindings?: Record<string, unknown>;
};

export type LegacyElement = {
    id?: string;
    type: string;
    name?: string;
    position?: Point;
    size?: Size;
    rotation?: number;
    opacity?: number;
    fill?: { type?: string; color: string };
    stroke?: { color: string; width: number };
    radius?: number;
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    textAlign?: string;
    letterSpacing?: number;
    lineHeight?: number;
    color?: string;
    src?: string;
    fit?: 'cover' | 'contain' | 'fill';
    locked?: boolean;
    bindings?: VariableBinding[];
};

export type LegacyTemplateLike = {
    version?: number;
    canvas?: Size;
    background?: string;
    elements?: LegacyElement[];
    artboards?: Artboard[];
    defaultArtboardId?: Id;
    title?: string;
    slug?: string;
    category?: string;
    description?: string;
    tags?: string[];
    variables?: Record<string, unknown>;
    colorTokens?: { id: Id; name: string; value: HexColor }[];
    brandBindings?: Record<string, unknown>;
    assets?: { id: Id; kind: string; src: string; meta?: Record<string, unknown> }[];
};

const DEFAULT_TEXT_COLOR: HexColor = '#111827';
const DEFAULT_SHAPE_COLOR: HexColor = '#000000';

function toTransform(element: LegacyElement): Transform {
    const position = element.position ?? { x: 0, y: 0 };
    const size = element.size ?? { width: 0, height: 0 };
    return {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        rotation: element.rotation ?? 0,
        opacity: element.opacity ?? 1,
    };
}

function ensureLayerId(element: LegacyElement, index: number): string {
    return element.id ?? `layer-${index}`;
}

function normalizeColor(color: string | undefined, fallback: HexColor): HexColor {
    if (!color || typeof color !== 'string') {
        return fallback;
    }
    return color as HexColor;
}

function convertLegacyElement(element: LegacyElement, index: number): Layer {
    const id = ensureLayerId(element, index);
    const base: BaseLayer = {
        id,
        type: 'shape',
        name: element.name,
        transform: toTransform(element),
        visible: element.opacity === 0 ? false : true,
        locked: element.locked ?? false,
        bindings: element.bindings,
    };

    if (element.type === 'text') {
        const alignment = element.textAlign;
        const alignValue: TextLayer['align'] = alignment === 'center' || alignment === 'right' || alignment === 'justify' ? alignment : 'left';
        return {
            ...base,
            type: 'text',
            content: element.text ?? '',
            fontFamily: element.fontFamily ?? 'Inter',
            fontSize: element.fontSize ?? 48,
            fontWeight: element.fontWeight,
            fill: normalizeColor(element.color ?? element.fill?.color, DEFAULT_TEXT_COLOR),
            align: alignValue,
            letterSpacing: element.letterSpacing,
            lineHeight: element.lineHeight,
        };
    }

    if (element.type === 'image') {
        return {
            ...base,
            type: 'image',
            src: element.src,
            fit: element.fit ?? 'cover',
            cornerRadius: element.radius,
        };
    }

    const shape: ShapeLayer = {
        ...base,
        type: 'shape',
        shape: element.type === 'ellipse' ? 'ellipse' : element.type === 'polygon' ? 'polygon' : element.type === 'line' ? 'line' : 'rect',
        fill: element.fill ? { kind: 'solid', color: normalizeColor(element.fill.color, DEFAULT_SHAPE_COLOR) } : undefined,
        stroke: element.stroke
            ? { color: normalizeColor(element.stroke.color, DEFAULT_SHAPE_COLOR), width: element.stroke.width }
            : undefined,
        cornerRadius: element.radius,
    };

    return shape;
}

function normalizeArtboard(artboard: Artboard): Artboard {
    const normalizedLayers = artboard.layers.map((layer, index) => {
        if ((layer as any).position) {
            // Legacy fallback in case a layer already resembles LegacyElement.
            return convertLegacyElement(layer as unknown as LegacyElement, index);
        }
        return layer;
    });

    return {
        ...artboard,
        layers: normalizedLayers,
        defaultLayerOrder: artboard.defaultLayerOrder ?? normalizedLayers.map((layer) => layer.id),
    };
}

export function ensureTemplateData(data: LegacyTemplateLike, options?: { artboardId?: Id; artboardName?: string }): TemplateData {
    const version = data.version ?? 1;

    if (data.artboards && data.artboards.length > 0) {
        const normalizedArtboards = data.artboards.map(normalizeArtboard);
        return {
            version,
            artboards: normalizedArtboards,
            defaultArtboardId: data.defaultArtboardId ?? normalizedArtboards[0].id,
            variables: data.variables,
            colorTokens: data.colorTokens,
            assets: data.assets,
            title: data.title,
            slug: data.slug,
            category: data.category,
            description: data.description,
            tags: data.tags,
            canvas: data.canvas,
            background: data.background,
            elements: data.elements,
            brandBindings: data.brandBindings,
        };
    }

    const canvas = data.canvas ?? { width: 1080, height: 1080 };
    const artboardId = options?.artboardId ?? 'ab-default';
    const layers = (data.elements ?? []).map((element, index) => convertLegacyElement(element, index));

    const artboard: Artboard = {
        id: artboardId,
        name: options?.artboardName ?? 'Default',
        size: canvas,
        background: data.background ? { kind: 'color', value: data.background as HexColor } : undefined,
        layers,
        variables: data.variables,
        defaultLayerOrder: layers.map((layer) => layer.id),
    };

    return {
        version,
        artboards: [artboard],
        defaultArtboardId: artboard.id,
        variables: data.variables,
        colorTokens: data.colorTokens,
        assets: data.assets,
        title: data.title,
        slug: data.slug,
        category: data.category,
        description: data.description,
        tags: data.tags,
        canvas: data.canvas,
        background: data.background,
        elements: data.elements,
        brandBindings: data.brandBindings,
    };
}

export function validateTemplateData(data: TemplateData): void {
    if (!data) {
        throw new Error('Template data is required');
    }
    if (typeof data.version !== 'number') {
        throw new Error('Template data must include a numeric version');
    }
    if (!Array.isArray(data.artboards) || data.artboards.length === 0) {
        throw new Error('Template data must include at least one artboard');
    }
    data.artboards.forEach((artboard, artboardIndex) => {
        if (!artboard.id) {
            throw new Error(`Artboard at index ${artboardIndex} is missing an id`);
        }
        if (!artboard.size || typeof artboard.size.width !== 'number' || typeof artboard.size.height !== 'number') {
            throw new Error(`Artboard ${artboard.id} is missing a valid size`);
        }
        if (!Array.isArray(artboard.layers)) {
            throw new Error(`Artboard ${artboard.id} must include a layers array`);
        }
        artboard.layers.forEach((layer, layerIndex) => {
            if (!layer.id) {
                throw new Error(`Layer at index ${layerIndex} in artboard ${artboard.id} is missing an id`);
            }
            if (!layer.transform) {
                throw new Error(`Layer ${layer.id} in artboard ${artboard.id} is missing transform data`);
            }
            const { width, height } = layer.transform as { width: unknown; height: unknown };
            if (typeof width !== 'number' || typeof height !== 'number') {
                throw new Error(`Layer ${layer.id} in artboard ${artboard.id} must have numeric width and height`);
            }
        });
    });
}
