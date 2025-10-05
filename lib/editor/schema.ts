export type Id = string;
export type Timestamp = number;

export type Size = { width: number; height: number };
export type Point = { x: number; y: number };

export type HexColor = `#${string}`;

export type ImageFit = 'cover' | 'contain' | 'fill' | 'fit-width' | 'fit-height';
export type CornerRadii = number | { tl: number; tr: number; br: number; bl: number };

export type Constraint =
    | 'scale'
    | 'fixed'
    | 'pin-left'
    | 'pin-right'
    | 'pin-top'
    | 'pin-bottom'
    | 'center';

export type VariableBinding =
    | { kind: 'text'; key: string }
    | { kind: 'image'; key: string }
    | { kind: 'color'; token: string };

export type LayerKind = 'text' | 'image' | 'shape' | 'group' | 'frame';

export type Stroke = {
    color: HexColor;
    width: number;
    align?: 'inside' | 'center' | 'outside';
    dash?: number[];
    opacity?: number;
};

export type Shadow = {
    color: HexColor;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity?: number;
};

export type GradientStop = { at: number; color: HexColor };
export type GradientValue = {
    type: 'linear' | 'radial';
    angle?: number;
    stops: GradientStop[];
};

export type Fill =
    | { kind: 'solid'; color: HexColor }
    | { kind: 'gradient'; gradient: GradientValue }
    | { kind: 'image'; assetId: Id; fit?: ImageFit; scale?: number; offset?: Point };

export type Transform = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    flipX?: boolean;
    flipY?: boolean;
};

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

export type BaseLayer = {
    id: Id;
    type: LayerKind;
    name?: string;
    transform: Transform;
    visible?: boolean;
    locked?: boolean;
    constraints?: Constraint[];
    bindings?: VariableBinding[];
    blendMode?: BlendMode;
    zIndex?: number;
    a11yLabel?: string;
    notes?: string;
};

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextAutoSize = 'height' | 'width' | 'both' | 'none';

export type TextLayer = BaseLayer & {
    type: 'text';
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight?: number | string;
    fontStyle?: 'normal' | 'italic';
    lineHeight?: number;
    letterSpacing?: number;
    fill: HexColor;
    align?: TextAlign;
    maxWidth?: number;
    autosize?: TextAutoSize;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    decoration?: 'none' | 'underline' | 'line-through';
    paragraphSpacing?: number;
    list?: 'none' | 'bullets' | 'numbers';
};

export type ImageLayer = BaseLayer & {
    type: 'image';
    src?: string;
    assetId?: Id;
    fit?: ImageFit;
    cornerRadius?: CornerRadii;
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

export type ShapeKind = 'rect' | 'ellipse' | 'line' | 'polygon' | 'star';
export type ShapeLayer = BaseLayer & {
    type: 'shape';
    shape: ShapeKind;
    fill?: Fill;
    stroke?: Stroke;
    shadow?: Shadow;
    cornerRadius?: CornerRadii;
    points?: Point[];
    closed?: boolean;
};

export type GroupLayer = BaseLayer & {
    type: 'group';
    children: Layer[];
    clip?: boolean;
};

export type FrameLayer = BaseLayer & {
    type: 'frame';
    children: Layer[];
    clip?: boolean;
    cornerRadius?: CornerRadii;
    mask?: boolean;
};

export type Layer = TextLayer | ImageLayer | ShapeLayer | GroupLayer | FrameLayer;

export type Background =
    | { kind: 'color'; value: HexColor }
    | { kind: 'gradient'; value: GradientValue }
    | { kind: 'image'; assetId: Id; fit?: ImageFit; position?: Point; scale?: number };

export type VariableValue = string | number | boolean | HexColor | string[] | number[];

export type ColorToken = {
    id: Id;
    name: string;
    value: HexColor;
};

export type Artboard = {
    id: Id;
    name?: string;
    size: Size;
    background?: Background;
    layers: Layer[];
    variables?: Record<string, VariableValue>;
    defaultLayerOrder?: Id[];
    thumbnailUrl?: string;
};

export type TemplateAssetRef = {
    id: Id;
    kind: 'image' | 'font' | 'svg' | string;
    src: string;
    meta?: Record<string, unknown>;
};

export type TemplateVersion = 1;

export type TemplateJSON = {
    id: Id;
    slug: string;
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    authorUserId: Id;
    version: TemplateVersion;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    artboards: Artboard[];
    defaultArtboardId?: Id;
    variables?: Record<string, VariableValue>;
    colorTokens?: ColorToken[];
    brandBindings?: Record<string, string>;
    assets?: TemplateAssetRef[];
    isPublic?: boolean;
    forkedFrom?: Id;
    thumbnailUrl?: string;
    // Deprecated: legacy flat canvas representation for older templates.
    canvas?: Size;
    background?: string;
    elements?: LegacyElement[];
};

export type DesignJSON = TemplateJSON & {
    designId: Id;
    templateId?: Id;
    ownerUserId: Id;
    updatedAt: Timestamp;
    overrides?: {
        variables?: Record<string, VariableValue>;
        colorTokens?: ColorToken[];
    };
};

export type LegacyFill = { type: 'solid'; color: string };
export type LegacyStroke = { color: string; width: number };
export type LegacyBaseElement = {
    id: string;
    type: 'rect' | 'ellipse' | 'image' | 'text';
    name?: string;
    position: Point;
    size: Size;
    rotation?: number;
    opacity?: number;
    fill?: LegacyFill;
    stroke?: LegacyStroke;
    locked?: boolean;
};
export type LegacyTextElement = LegacyBaseElement & {
    type: 'text';
    text: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    letterSpacing?: number;
    lineHeight?: number;
};
export type LegacyImageElement = LegacyBaseElement & {
    type: 'image';
    src: string;
    fit?: 'cover' | 'contain' | 'fill';
};
export type LegacyElement = LegacyBaseElement | LegacyTextElement | LegacyImageElement;

export type CanvasSnapshot = {
    artboardId: Id;
    size: Size;
    layers: Layer[];
    background?: Background;
    variables?: Record<string, VariableValue>;
};

export type CanvasExportFormat = 'png' | 'jpeg' | 'pdf' | 'svg';
export type CanvasExportOptions = {
    artboardId: Id;
    format: CanvasExportFormat;
    scale?: number;
    quality?: number;
    backgroundOverride?: Background;
};

export interface CanvasAdapter {
    engine: 'fabric' | 'konva' | string;
    loadArtboard(artboard: Artboard, variables?: Record<string, VariableValue>): Promise<void> | void;
    setVariables(variables: Record<string, VariableValue>): void;
    addLayer(layer: Layer): Promise<void> | void;
    updateLayer(layer: Layer): Promise<void> | void;
    removeLayer(layerId: Id): void;
    reorderLayer(layerId: Id, newIndex: number): void;
    selectLayers(layerIds: Id[]): void;
    getSelection(): Id[];
    snapshot(): CanvasSnapshot;
    export(options: CanvasExportOptions): Promise<string>;
    dispose(): void;
}
