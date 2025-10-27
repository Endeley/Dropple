import type { Canvas } from 'fabric';
import { FABRIC_EXPORT_OPTIONS, frameToFabric, extractMetadata, fabricToElement } from './fabricAdapters';
import type { CanvasFrame, FabricServiceConfig } from './types';

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
            } else if (metadata.droppleType === 'element') {
                const updates = fabricToElement(target, { id: metadata.droppleId })?.props ?? {};
                const frameId = (target as any).droppleFrameId;
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
