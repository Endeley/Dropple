import type { Canvas, Object as FabricObject } from 'fabric';
import type { CanvasFrame, CanvasElement } from './types';

export type DroppleFabricMeta = {
    droppleId: string;
    droppleType: 'frame' | 'element';
    elementType?: string;
};

const CUSTOM_PROPERTIES = ['droppleId', 'droppleType', 'elementType'] as const;

export const FABRIC_EXPORT_OPTIONS = {
    customProperties: CUSTOM_PROPERTIES,
};

export function attachMetadata(target: FabricObject, metadata: DroppleFabricMeta) {
    CUSTOM_PROPERTIES.forEach((prop) => {
        // @ts-expect-error - custom property assignment
        target[prop] = metadata[prop];
    });
    return target;
}

export function extractMetadata(target: FabricObject): DroppleFabricMeta | null {
    const droppleId = (target as any).droppleId;
    if (!droppleId) return null;
    return {
        droppleId,
        droppleType: (target as any).droppleType ?? 'element',
        elementType: (target as any).elementType,
    };
}

export function frameToFabric(frame: CanvasFrame, fabric: typeof import('fabric')['fabric']): FabricObject {
    const rect = new fabric.Rect({
        left: frame.x ?? 0,
        top: frame.y ?? 0,
        width: frame.width ?? 960,
        height: frame.height ?? 640,
        fill: frame.backgroundColor ?? 'rgba(15,23,42,0.9)',
        rx: frame.cornerRadius ?? 24,
        ry: frame.cornerRadius ?? 24,
        stroke: 'rgba(139,92,246,0.35)',
        strokeWidth: 1.2,
        strokeUniform: true,
        hasControls: true,
        originX: 'left',
        originY: 'top',
    });
    attachMetadata(rect, { droppleId: frame.id, droppleType: 'frame' });
    return rect;
}

export function fabricToFrame(target: FabricObject, frame: Partial<CanvasFrame> = {}): Partial<CanvasFrame> {
    const width = (target.width ?? 0) * (target.scaleX ?? 1);
    const height = (target.height ?? 0) * (target.scaleY ?? 1);
    return {
        ...frame,
        x: target.left ?? frame.x ?? 0,
        y: target.top ?? frame.y ?? 0,
        width,
        height,
    };
}

export function elementToFabric(
    element: CanvasElement,
    frame: CanvasFrame,
    fabric: typeof import('fabric')['fabric'],
): FabricObject | null {
    const frameX = frame.x ?? 0;
    const frameY = frame.y ?? 0;
    const left = frameX + (element.props?.x ?? 0);
    const top = frameY + (element.props?.y ?? 0);
    switch (element.type) {
        case 'rect':
        case 'shape': {
            const rect = new fabric.Rect({
                left,
                top,
                width: element.props?.width ?? 240,
                height: element.props?.height ?? 160,
                fill: element.props?.fill ?? '#2A244B',
                rx: element.props?.cornerRadius ?? 16,
                ry: element.props?.cornerRadius ?? 16,
                stroke: element.props?.stroke ?? 'rgba(139,92,246,0.35)',
                strokeWidth: element.props?.strokeWidth ?? 1,
                opacity: element.props?.opacity ?? 1,
                strokeUniform: true,
                originX: 'left',
                originY: 'top',
            });
            attachMetadata(rect, { droppleId: element.id, droppleType: 'element', elementType: element.type });
            (rect as any).droppleFrameId = frame.id;
            return rect;
        }
        case 'text': {
            const text = new fabric.Textbox(element.props?.text ?? element.name ?? 'Text', {
                left,
                top,
                width: element.props?.width ?? 320,
                fontSize: element.props?.fontSize ?? 24,
                fill: element.props?.fill ?? '#ECE9FE',
                fontWeight: element.props?.fontWeight?.toString() ?? '500',
                fontFamily: element.props?.fontFamily ?? 'Inter, system-ui, sans-serif',
                lineHeight: element.props?.lineHeight ?? 1.3,
                charSpacing: ((element.props?.letterSpacing ?? 0) * 1000) / (element.props?.fontSize ?? 24),
                opacity: element.props?.opacity ?? 1,
                originX: 'left',
                originY: 'top',
            });
            attachMetadata(text, { droppleId: element.id, droppleType: 'element', elementType: element.type });
            (text as any).droppleFrameId = frame.id;
            return text;
        }
        case 'image': {
            // Image creation is handled asynchronously in the canvas sync effect.
            return null;
        }
        case 'path': {
            const rawPath = element.props?.pathData;
            if (!rawPath) return null;
            const pathString = Array.isArray(rawPath) ? fabric.util.joinPath(rawPath as any) : rawPath;
            if (!pathString || typeof pathString !== 'string') return null;
            const path = new fabric.Path(pathString, {
                left,
                top,
                originX: 'left',
                originY: 'top',
                opacity: element.props?.opacity ?? 1,
                stroke: element.props?.stroke ?? '#F8FAFC',
                strokeWidth: element.props?.strokeWidth ?? 2.5,
                fill: element.props?.fill ?? 'transparent',
                strokeLineCap: element.props?.strokeLineCap ?? 'round',
                strokeLineJoin: element.props?.strokeLineJoin ?? 'round',
            });
            const baseWidth = path.width ?? 1;
            const baseHeight = path.height ?? 1;
            const targetWidth = Math.max(element.props?.width ?? baseWidth, 1);
            const targetHeight = Math.max(element.props?.height ?? baseHeight, 1);
            path.scaleX = targetWidth / baseWidth;
            path.scaleY = targetHeight / baseHeight;
            attachMetadata(path, { droppleId: element.id, droppleType: 'element', elementType: element.type });
            (path as any).droppleFrameId = frame.id;
            path.brushType = element.props?.brushType ?? 'pen';
            return path;
        }
        default:
            return null;
    }
}

export function fabricToElement(
    target: FabricObject,
    base: Partial<CanvasElement> = {},
    frame?: CanvasFrame,
): Partial<CanvasElement> {
    const metadata = extractMetadata(target);
    if (!metadata) return base;
    const frameOffsetX = frame?.x ?? 0;
    const frameOffsetY = frame?.y ?? 0;
    const scaleX = target.scaleX ?? 1;
    const scaleY = target.scaleY ?? 1;
    const width = (target.width ?? 0) * scaleX;
    const height = (target.height ?? 0) * scaleY;
    const left = (target.left ?? frameOffsetX) - frameOffsetX;
    const top = (target.top ?? frameOffsetY) - frameOffsetY;

    const props: Record<string, unknown> = {
        ...(base.props ?? {}),
        x: left,
        y: top,
        width,
        height,
    };

    const angle = target.angle ?? (base.props as any)?.rotation;
    if (angle !== undefined) {
        props.rotation = angle;
    }

    if (target.opacity !== undefined) {
        props.opacity = target.opacity;
    }

    if (metadata.elementType === 'rect' || metadata.elementType === 'shape' || metadata.elementType === 'overlay' || metadata.elementType === 'clip') {
        if (typeof (target as any).fill === 'string') {
            props.fill = (target as any).fill;
        }
        if (typeof (target as any).stroke === 'string' || (target as any).stroke === null) {
            props.stroke = (target as any).stroke ?? null;
        }
        if (typeof (target as any).strokeWidth === 'number') {
            props.strokeWidth = (target as any).strokeWidth;
        }
        const rx = (target as any).rx ?? (target as any).ry ?? (base.props as any)?.cornerRadius ?? 0;
        if (typeof rx === 'number') {
            props.cornerRadius = rx;
        }
    } else if (metadata.elementType === 'text' || metadata.elementType === 'script') {
        const fabricText = target as any;
        if (typeof fabricText.text === 'string') {
            props.text = fabricText.text;
        }
        if (typeof fabricText.fontSize === 'number') {
            props.fontSize = fabricText.fontSize;
        }
        if (typeof fabricText.fontFamily === 'string') {
            props.fontFamily = fabricText.fontFamily;
        }
        if (fabricText.fontWeight !== undefined) {
            props.fontWeight = fabricText.fontWeight;
        }
        if (typeof fabricText.lineHeight === 'number') {
            props.lineHeight = fabricText.lineHeight;
        }
        if (typeof fabricText.charSpacing === 'number') {
            const fontSize = typeof fabricText.fontSize === 'number' ? fabricText.fontSize : 16;
            props.letterSpacing = (fabricText.charSpacing / 1000) * fontSize;
        }
        if (typeof fabricText.textAlign === 'string') {
            props.align = fabricText.textAlign;
        }
    } else if (metadata.elementType === 'path') {
        const pathTarget: any = target;
        if (typeof pathTarget.stroke === 'string') {
            props.stroke = pathTarget.stroke;
        }
        if (typeof pathTarget.strokeWidth === 'number') {
            props.strokeWidth = pathTarget.strokeWidth;
        }
        if (typeof pathTarget.fill === 'string') {
            props.fill = pathTarget.fill;
        }
        if (typeof pathTarget.strokeLineCap === 'string') {
            props.strokeLineCap = pathTarget.strokeLineCap;
        }
        if (typeof pathTarget.strokeLineJoin === 'string') {
            props.strokeLineJoin = pathTarget.strokeLineJoin;
        }
        if (Array.isArray(pathTarget.path)) {
            props.pathData = pathTarget.path.map((segment) => [...segment]);
        }
        if (pathTarget.brushType) {
            props.brushType = pathTarget.brushType;
        }
    }

    target.set({
        scaleX: 1,
        scaleY: 1,
        width,
        height,
    });
    target.setCoords();

    return {
        ...base,
        id: metadata.droppleId,
        type: metadata.elementType ?? base.type ?? 'rect',
        props,
    };
}

export function exportFabricJSON(canvas: Canvas) {
    return canvas.toJSON(FABRIC_EXPORT_OPTIONS);
}
