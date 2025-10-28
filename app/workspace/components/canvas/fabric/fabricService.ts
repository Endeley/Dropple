import type { Canvas } from 'fabric';
import { FABRIC_EXPORT_OPTIONS, frameToFabric, extractMetadata, fabricToElement } from './fabricAdapters';
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
}
