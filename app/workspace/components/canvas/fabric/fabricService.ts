import type { Canvas } from 'fabric';
import {
    FABRIC_EXPORT_OPTIONS,
    frameToFabric,
    extractMetadata,
    fabricToElement,
    elementToFabric,
    attachMetadata,
} from './fabricAdapters';
import type { CanvasElement, CanvasFrame, FabricServiceConfig } from './types';

type FabricModule = typeof import('fabric');

export class FabricService {
    private fabricModule: FabricModule | null = null;
    private canvas: Canvas | null = null;
    private config: FabricServiceConfig = {};

    constructor(config: FabricServiceConfig = {}) {
        this.config = config;
    }

    updateConfig(config: FabricServiceConfig) {
        this.config = { ...this.config, ...config };
        if (this.canvas) {
            this.registerEvents(this.canvas);
        }
    }

    async ensureFabricModule() {
        if (this.fabricModule) return this.fabricModule;
        this.fabricModule = await import('fabric');
        return this.fabricModule;
    }

    setCanvas(canvas: Canvas | null) {
        this.canvas = canvas;
        if (canvas) {
            this.registerEvents(canvas);
        }
    }

    getCanvas() {
        return this.canvas;
    }

    registerEvents(canvas: Canvas) {
        canvas.off('selection:created');
        canvas.off('selection:updated');
        canvas.off('selection:cleared');
        canvas.off('object:modified');

        const emitSelection = () => {
            const selectedObjects = canvas.getActiveObjects();
            const frameIds: string[] = [];
            const elementIds: string[] = [];
            selectedObjects.forEach((object) => {
                const metadata = extractMetadata(object as any);
                if (!metadata) return;
                if (metadata.droppleType === 'frame') frameIds.push(metadata.droppleId);
                if (metadata.droppleType === 'element') elementIds.push(metadata.droppleId);
            });
            this.config.onSelectionChange?.({ frameIds, elementIds });
        };

        canvas.off('selection:created');
        canvas.off('selection:updated');
        canvas.off('selection:cleared');
        canvas.off('object:modified');

        canvas.on('selection:created', emitSelection);
        canvas.on('selection:updated', emitSelection);
        canvas.on('selection:cleared', () => this.config.onSelectionChange?.({ frameIds: [], elementIds: [] }));

        canvas.on('object:modified', (event) => {
            const target: any = event?.target;
            if (!target) return;
            if (target.type === 'activeSelection' && typeof target.getObjects === 'function') {
                const items = target.getObjects();
                const elementGroups = new Map<string, Array<{ elementId: string; props: Partial<CanvasElement['props']> }>>();
                items.forEach((item: any) => {
                    const metadata = extractMetadata(item);
                    if (!metadata) return;
                    if (metadata.droppleType === 'frame') {
                        const width = (item.width ?? 0) * (item.scaleX ?? 1);
                        const height = (item.height ?? 0) * (item.scaleY ?? 1);
                        this.config.onFrameChange?.(metadata.droppleId, {
                            x: item.left ?? 0,
                            y: item.top ?? 0,
                            width,
                            height,
                        });
                        item.set({ scaleX: 1, scaleY: 1 });
                        item.setCoords();
                        return;
                    }
                    if (metadata.droppleType === 'element') {
                        const frameId = item.droppleFrameId;
                        if (!frameId) return;
                        const frame = this.config.getFrameById?.(frameId) ?? null;
                        const elementSnapshot = fabricToElement(
                            item,
                            { id: metadata.droppleId, type: metadata.elementType ?? undefined },
                            frame ?? undefined,
                        );
                        item.set({ scaleX: 1, scaleY: 1 });
                        item.setCoords();
                        const props = elementSnapshot.props ?? {};
                        if (!elementGroups.has(frameId)) {
                            elementGroups.set(frameId, []);
                        }
                        elementGroups.get(frameId)?.push({
                            elementId: metadata.droppleId,
                            props,
                        });
                    }
                });

                elementGroups.forEach((entries, frameId) => {
                    if (entries.length === 0) return;
                    this.config.onElementsChange?.(frameId, entries);
                });
                canvas.requestRenderAll();
                return;
            }

            const metadata = extractMetadata(target);
            if (!metadata) return;
            if (metadata.droppleType === 'frame') {
                const width = (target.width ?? 0) * (target.scaleX ?? 1);
                const height = (target.height ?? 0) * (target.scaleY ?? 1);
                this.config.onFrameChange?.(metadata.droppleId, {
                    x: target.left ?? 0,
                    y: target.top ?? 0,
                    width,
                    height,
                });
                target.set({ scaleX: 1, scaleY: 1 });
                target.setCoords();
            } else if (metadata.droppleType === 'element') {
                const frameId = (target as any).droppleFrameId;
                const frame = frameId ? this.config.getFrameById?.(frameId) ?? null : null;
                const elementSnapshot = fabricToElement(
                    target,
                    { id: metadata.droppleId, type: metadata.elementType ?? undefined },
                    frame ?? undefined,
                );
                const updates = elementSnapshot.props ?? {};
                if (frameId) {
                    this.config.onElementChange?.(frameId, metadata.droppleId, updates as any);
                }
            }
            canvas.requestRenderAll();
        });
        emitSelection();
    }

    addFrame(frame: CanvasFrame) {
        if (!this.canvas || !this.fabricModule) return null;
        const rect = frameToFabric(frame, this.fabricModule.fabric);
        this.canvas.add(rect);
        this.canvas.requestRenderAll();
        return rect;
    }

    exportJSON() {
        if (!this.canvas) return null;
        return this.canvas.toJSON(FABRIC_EXPORT_OPTIONS);
    }

    private findObjectById(id: string) {
        if (!this.canvas) return null;
        const objects = this.canvas.getObjects() ?? [];
        for (let index = objects.length - 1; index >= 0; index -= 1) {
            const object = objects[index];
            if ((object as any).droppleId === id) {
                return object;
            }
        }
        return null;
    }

    async upsertFrame(frame: CanvasFrame) {
        const canvas = this.canvas;
        if (!canvas) return null;
        const fabricModule = await this.ensureFabricModule();
        const fabric = fabricModule.fabric;
        let target = this.findObjectById(frame.id);
        if (!target) {
            target = frameToFabric(frame, fabric);
            canvas.add(target);
            canvas.sendToBack(target);
        } else {
            target.set({
                left: frame.x ?? 0,
                top: frame.y ?? 0,
                width: frame.width ?? 960,
                height: frame.height ?? 640,
            });
        }
        target.set({
            fill: frame.backgroundColor ?? 'rgba(15,23,42,0.9)',
        });
        target.setCoords();
        canvas.requestRenderAll();
        return target;
    }

    async upsertElement(frame: CanvasFrame, element: CanvasElement) {
        const canvas = this.canvas;
        if (!canvas) return null;
        const fabricModule = await this.ensureFabricModule();
        const fabric = fabricModule.fabric;
        const frameOffsetX = frame.x ?? 0;
        const frameOffsetY = frame.y ?? 0;
        const props = element.props ?? {};
        const left = frameOffsetX + (props.x ?? 0);
        const top = frameOffsetY + (props.y ?? 0);

        let target = this.findObjectById(element.id);
        if (!target) {
            if (element.type === 'image' && props.imageUrl) {
                fabric.Image.fromURL(
                    props.imageUrl,
                    (image) => {
                        if (!image) return;
                        attachMetadata(image, {
                            droppleId: element.id,
                            droppleType: 'element',
                            elementType: element.type,
                        });
                        (image as any).droppleFrameId = frame.id;
                        const width = props.width ?? image.width ?? 320;
                        const height = props.height ?? image.height ?? 220;
                        image.set({
                            left,
                            top,
                            originX: 'left',
                            originY: 'top',
                            opacity: props.opacity ?? image.opacity ?? 1,
                        });
                        image.scaleToWidth(width);
                        image.scaleToHeight(height);
                        canvas.add(image);
                        canvas.requestRenderAll();
                    },
                    { crossOrigin: 'anonymous' },
                );
                return null;
            }
            target = elementToFabric(element, frame, fabric);
            if (!target) return null;
            attachMetadata(target, {
                droppleId: element.id,
                droppleType: 'element',
                elementType: element.type,
            });
            (target as any).droppleFrameId = frame.id;
            canvas.add(target);
        }

        target.set({
            left,
            top,
            opacity: props.opacity ?? target.opacity ?? 1,
            angle: props.rotation ?? target.angle ?? 0,
            skewX: props.skewX ?? target.skewX ?? 0,
            skewY: props.skewY ?? target.skewY ?? 0,
        });

        if (element.type === 'rect' || element.type === 'shape' || element.type === 'overlay' || element.type === 'clip') {
            target.set({
                width: props.width ?? target.width ?? 240,
                height: props.height ?? target.height ?? 160,
                fill: props.fill ?? (target as any).fill ?? '#2A244B',
                stroke: props.stroke ?? (target as any).stroke ?? 'rgba(139,92,246,0.35)',
                strokeWidth: props.strokeWidth ?? (target as any).strokeWidth ?? 1,
                rx: props.cornerRadius ?? (target as any).rx ?? 0,
                ry: props.cornerRadius ?? (target as any).ry ?? 0,
            });
        } else if (element.type === 'text' || element.type === 'script') {
            const textObject: any = target;
            textObject.set({
                text: props.text ?? textObject.text ?? element.name ?? 'Text',
                fontSize: props.fontSize ?? textObject.fontSize ?? 24,
                fill: props.fill ?? textObject.fill ?? '#ECE9FE',
                fontFamily: props.fontFamily ?? textObject.fontFamily ?? 'Inter, system-ui, sans-serif',
                fontWeight: props.fontWeight ?? textObject.fontWeight ?? '500',
                lineHeight: props.lineHeight ?? textObject.lineHeight ?? 1.3,
                width: props.width ?? textObject.width ?? 320,
                charSpacing:
                    ((props.letterSpacing ?? 0) * 1000) / (props.fontSize ?? textObject.fontSize ?? 24),
                textAlign: props.align ?? textObject.textAlign ?? 'left',
            });
        }

        target.setCoords();
        canvas.bringToFront(target);
        canvas.requestRenderAll();
        return target;
    }
}
