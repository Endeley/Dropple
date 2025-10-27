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
        default:
            return null;
    }
}

export function fabricToElement(target: FabricObject, base: Partial<CanvasElement> = {}): Partial<CanvasElement> {
    const metadata = extractMetadata(target);
    if (!metadata) return base;
    const width = (target.width ?? 0) * (target.scaleX ?? 1);
    const height = (target.height ?? 0) * (target.scaleY ?? 1);
    return {
        ...base,
        id: metadata.droppleId,
        type: metadata.elementType ?? base.type ?? 'rect',
        props: {
            ...(base.props ?? {}),
            x: target.left ?? base.props?.x ?? 0,
            y: target.top ?? base.props?.y ?? 0,
            width,
            height,
        },
    };
}

export function exportFabricJSON(canvas: Canvas) {
    return canvas.toJSON(FABRIC_EXPORT_OPTIONS);
}
