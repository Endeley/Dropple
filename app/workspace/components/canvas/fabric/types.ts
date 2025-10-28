export type CanvasElement = {
    id: string;
    type: string;
    name?: string;
    parentId?: string | null;
    props?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        fill?: string;
        stroke?: string | null;
        strokeWidth?: number;
        cornerRadius?: number;
        rotation?: number;
        scaleX?: number;
        scaleY?: number;
        skewX?: number;
        skewY?: number;
        opacity?: number;
        text?: string;
        fontSize?: number;
        fontWeight?: number | string;
        fontFamily?: string;
        lineHeight?: number;
        letterSpacing?: number;
        align?: string;
        imageUrl?: string | null;
    };
};

export type CanvasFrame = {
    id: string;
    name?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor?: string | null;
    cornerRadius?: number;
    elements: CanvasElement[];
};

export type FabricServiceConfig = {
    onSelectionChange?: (payload: { frameIds: string[]; elementIds: string[] }) => void;
    onFrameChange?: (frameId: string, updates: Partial<CanvasFrame>) => void;
    onElementChange?: (
        frameId: string,
        elementId: string,
        updates: Partial<CanvasElement['props']>,
    ) => void;
    onElementsChange?: (
        frameId: string,
        entries: Array<{ elementId: string; props: Partial<CanvasElement['props']> }>,
    ) => void;
    getFrameById?: (frameId: string) => CanvasFrame | null | undefined;
};
