// @ts-nocheck

import fabric from 'fabric';

import type {
    Artboard,
    Background,
    CanvasAdapter,
    CanvasExportOptions,
    CanvasSnapshot,
    Layer,
    Layer as LayerType,
    ShapeLayer,
    TextLayer,
    ImageLayer,
    CanvasExportFormat,
    VariableValue,
} from './schema';

const DEFAULT_TEXT_COLOR = '#111827';
const DEFAULT_SHAPE_COLOR = '#000000';

function toRadians(angle: number | undefined): number {
    return ((angle ?? 0) * Math.PI) / 180;
}

function cornerValue(value: ShapeLayer['cornerRadius']): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return value.tl ?? value.tr ?? value.br ?? value.bl ?? 0;
}

function applyCommonProps(object: fabric.Object, layer: Layer) {
    object.set({
        opacity: layer.transform.opacity ?? 1,
        angle: layer.transform.rotation ?? 0,
        flipX: layer.transform.flipX ?? false,
        flipY: layer.transform.flipY ?? false,
        selectable: !(layer.locked ?? false),
        evented: !(layer.locked ?? false),
        visible: layer.visible ?? true,
        name: layer.name,
    });
    const data = object.get('data') ?? {};
    object.set('data', { ...data, layerId: layer.id });
}

function convertLayerToFabric(layer: Layer): Promise<fabric.Object | null> {
    switch (layer.type) {
        case 'text':
            return Promise.resolve(
                new fabric.IText(layer.content ?? '', {
                    left: layer.transform.x,
                    top: layer.transform.y,
                    width: layer.transform.width,
                    height: layer.transform.height,
                    fontFamily: layer.fontFamily ?? 'Inter',
                    fontSize: layer.fontSize ?? 48,
                    fontWeight: layer.fontWeight,
                    fontStyle: layer.fontStyle ?? 'normal',
                    fill: layer.fill ?? DEFAULT_TEXT_COLOR,
                    textAlign: layer.align ?? 'left',
                    lineHeight: layer.lineHeight,
                    charSpacing: layer.letterSpacing ? layer.letterSpacing * 10 : undefined,
                })
            );
        case 'image':
            if (!layer.src) {
                return Promise.resolve(null);
            }
            return new Promise((resolve) => {
                fabric.Image.fromURL(
                    layer.src!,
                    (img) => {
                        if (!img) return resolve(null);
                        const width = layer.transform.width;
                        const height = layer.transform.height;
                        if (width) {
                            img.scaleToWidth(width, false);
                        }
                        if (height) {
                            img.scaleToHeight(height, false);
                        }
                        img.set({
                            left: layer.transform.x,
                            top: layer.transform.y,
                        });
                        resolve(img);
                    },
                    { crossOrigin: 'anonymous' }
                );
            });
        case 'shape':
            if (layer.shape === 'ellipse') {
                return Promise.resolve(
                    new fabric.Ellipse({
                        left: layer.transform.x,
                        top: layer.transform.y,
                        originX: 'left',
                        originY: 'top',
                        rx: layer.transform.width / 2,
                        ry: layer.transform.height / 2,
                        fill: layer.fill && layer.fill.kind === 'solid' ? layer.fill.color : DEFAULT_SHAPE_COLOR,
                        stroke: layer.stroke?.color,
                        strokeWidth: layer.stroke?.width,
                    })
                );
            }
            if (layer.shape === 'line') {
                const x2 = layer.transform.x + layer.transform.width;
                const y2 = layer.transform.y + layer.transform.height;
                return Promise.resolve(
                    new fabric.Line([layer.transform.x, layer.transform.y, x2, y2], {
                        stroke: layer.stroke?.color ?? DEFAULT_SHAPE_COLOR,
                        strokeWidth: layer.stroke?.width ?? 2,
                    })
                );
            }
            if (layer.shape === 'polygon' && layer.points?.length) {
                return Promise.resolve(
                    new fabric.Polygon(layer.points.map((pt) => ({ ...pt })), {
                        left: layer.transform.x,
                        top: layer.transform.y,
                        fill: layer.fill && layer.fill.kind === 'solid' ? layer.fill.color : DEFAULT_SHAPE_COLOR,
                        stroke: layer.stroke?.color,
                        strokeWidth: layer.stroke?.width,
                    })
                );
            }
            return Promise.resolve(
                new fabric.Rect({
                    left: layer.transform.x,
                    top: layer.transform.y,
                    width: layer.transform.width,
                    height: layer.transform.height,
                    rx: cornerValue(layer.cornerRadius),
                    ry: cornerValue(layer.cornerRadius),
                    fill: layer.fill && layer.fill.kind === 'solid' ? layer.fill.color : DEFAULT_SHAPE_COLOR,
                    stroke: layer.stroke?.color,
                    strokeWidth: layer.stroke?.width,
                })
            );
        default:
            return Promise.resolve(null);
    }
}

function extractTransform(object: fabric.Object) {
    const width = object.getScaledWidth();
    const height = object.getScaledHeight();
    const left = object.left ?? 0;
    const top = object.top ?? 0;

    return {
        x: left,
        y: top,
        width,
        height,
        rotation: object.angle ?? 0,
        opacity: object.opacity ?? 1,
        flipX: object.flipX ?? false,
        flipY: object.flipY ?? false,
    };
}

function fabricObjectToLayer(object: fabric.Object, fallbackId: string, index: number): Layer {
    const data = (object.get('data') ?? {}) as { layerId?: string; type?: string };
    const id = data.layerId ?? fallbackId;

    if (object.type === 'i-text' || object.type === 'textbox' || object.type === 'text') {
        const textObject = object as fabric.IText;
        const layer: TextLayer = {
            id,
            type: 'text',
            name: object.name,
            transform: extractTransform(object),
            content: textObject.text ?? '',
            fontFamily: textObject.fontFamily ?? 'Inter',
            fontSize: textObject.fontSize ?? 48,
            fontWeight: textObject.fontWeight,
            fill: (textObject.fill as string) ?? DEFAULT_TEXT_COLOR,
            align: (textObject.textAlign as TextLayer['align']) ?? 'left',
            letterSpacing: textObject.charSpacing ? textObject.charSpacing / 10 : undefined,
            lineHeight: textObject.lineHeight,
        };
        return layer;
    }

    if (object.type === 'image') {
        const imageObject = object as fabric.Image;
        const layer: ImageLayer = {
            id,
            type: 'image',
            name: object.name,
            transform: extractTransform(object),
            src: imageObject.getSrc(),
            fit: 'cover',
        };
        return layer;
    }

    const shapeLayer: ShapeLayer = {
        id,
        type: 'shape',
        name: object.name,
        transform: extractTransform(object),
        shape: object.type === 'ellipse' || object.type === 'circle' ? 'ellipse' : object.type === 'line' ? 'line' : 'rect',
        fill: object.fill
            ? { kind: 'solid', color: object.fill as string }
            : { kind: 'solid', color: DEFAULT_SHAPE_COLOR },
        stroke: object.stroke
            ? {
                  color: object.stroke as string,
                  width: object.strokeWidth ?? 1,
              }
            : undefined,
        cornerRadius: 'rx' in object ? ((object as any).rx ?? 0) : undefined,
    };

    if (object.type === 'line') {
        const line = object as fabric.Line;
        const points = line.points ?? [
            { x: line.x1 ?? 0, y: line.y1 ?? 0 },
            { x: line.x2 ?? 0, y: line.y2 ?? 0 },
        ];
        shapeLayer.points = points.map((pt: any) => ({ x: pt.x, y: pt.y }));
    }

    return shapeLayer;
}

function resolveBackground(canvas: fabric.Canvas): Background | undefined {
    const bg = canvas.backgroundColor;
    if (typeof bg === 'string') {
        return { kind: 'color', value: bg };
    }
    return undefined;
}

function sortLayers(artboard: Artboard): Layer[] {
    if (!artboard.layers.length) {
        return [];
    }
    const order = new Map<string, number>();
    artboard.defaultLayerOrder?.forEach((id, idx) => {
        order.set(id, idx);
    });
    return [...artboard.layers].sort((a, b) => {
        const aOrder = order.has(a.id) ? order.get(a.id)! : artboard.layers.indexOf(a);
        const bOrder = order.has(b.id) ? order.get(b.id)! : artboard.layers.indexOf(b);
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        const aZ = a.zIndex ?? 0;
        const bZ = b.zIndex ?? 0;
        return aZ - bZ;
    });
}

export class FabricCanvasAdapter implements CanvasAdapter {
    public engine = 'fabric';

    private canvas: fabric.Canvas;
    private layerMap = new Map<string, fabric.Object>();
    private currentArtboardId: string | null = null;
    private variables: Record<string, VariableValue> = {};

    constructor(canvas: fabric.Canvas) {
        this.canvas = canvas;
    }

    async loadArtboard(artboard: Artboard, variables: Record<string, VariableValue> = {}): Promise<void> {
        this.canvas.clear();
        this.layerMap.clear();

        this.canvas.setWidth(artboard.size.width);
        this.canvas.setHeight(artboard.size.height);

        if (artboard.background?.kind === 'color') {
            this.canvas.setBackgroundColor(artboard.background.value, () => {});
        } else {
            this.canvas.setBackgroundColor('#ffffff', () => {});
        }

        const orderedLayers = sortLayers(artboard);
        const fabricObjects = await Promise.all(orderedLayers.map((layer) => convertLayerToFabric(layer)));

        fabricObjects.forEach((obj, idx) => {
            if (!obj) return;
            const layer = orderedLayers[idx];
            applyCommonProps(obj, layer);
            this.canvas.add(obj);
            this.layerMap.set(layer.id, obj);
        });

        this.canvas.renderAll();
        this.currentArtboardId = artboard.id;
        this.variables = { ...(variables ?? artboard.variables ?? {}) };
    }

    setVariables(variables: Record<string, VariableValue>): void {
        this.variables = { ...variables };
    }

    addLayer(layer: LayerType): Promise<void> {
        return convertLayerToFabric(layer).then((obj) => {
            if (!obj) return;
            applyCommonProps(obj, layer);
            this.canvas.add(obj);
            this.layerMap.set(layer.id, obj);
            this.canvas.renderAll();
        });
    }

    updateLayer(layer: LayerType): Promise<void> {
        const existing = this.layerMap.get(layer.id);
        if (existing) {
            this.canvas.remove(existing);
            this.layerMap.delete(layer.id);
        }
        return this.addLayer(layer);
    }

    removeLayer(layerId: string): void {
        const object = this.layerMap.get(layerId);
        if (!object) return;
        this.canvas.remove(object);
        this.layerMap.delete(layerId);
        this.canvas.renderAll();
    }

    reorderLayer(layerId: string, newIndex: number): void {
        const object = this.layerMap.get(layerId);
        if (!object) return;
        this.canvas.moveTo(object, newIndex);
        this.canvas.renderAll();
    }

    selectLayers(layerIds: string[]): void {
        const objects = layerIds
            .map((id) => this.layerMap.get(id))
            .filter((obj): obj is fabric.Object => Boolean(obj));
        if (!objects.length) {
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            return;
        }
        if (objects.length === 1) {
            this.canvas.setActiveObject(objects[0]);
        } else {
            const activeSelection = new fabric.ActiveSelection(objects, {
                canvas: this.canvas,
            });
            this.canvas.setActiveObject(activeSelection);
        }
        this.canvas.requestRenderAll();
    }

    getSelection(): string[] {
        const active = this.canvas.getActiveObjects();
        return active
            .map((obj) => {
                const data = obj.get('data') ?? {};
                return (data as any).layerId as string | undefined;
            })
            .filter((id): id is string => Boolean(id));
    }

    snapshot(): CanvasSnapshot {
        if (!this.currentArtboardId) {
            throw new Error('No artboard loaded to snapshot');
        }
        const objects = this.canvas.getObjects();
        const layers = objects.map((obj, index) => fabricObjectToLayer(obj, `layer-${index}`, index));
        return {
            artboardId: this.currentArtboardId,
            size: { width: this.canvas.getWidth(), height: this.canvas.getHeight() },
            background: resolveBackground(this.canvas),
            layers,
            variables: this.variables,
        };
    }

    async export(options: CanvasExportOptions): Promise<string> {
        const format: CanvasExportFormat = options.format;
        const multiplier = options.scale ?? 1;
        switch (format) {
            case 'png':
                return this.canvas.toDataURL({ format: 'png', multiplier });
            case 'jpeg':
                return this.canvas.toDataURL({ format: 'jpeg', quality: options.quality ?? 0.92, multiplier });
            case 'svg':
                return this.canvas.toSVG();
            default:
                throw new Error(`Export format ${format} not supported yet`);
        }
    }

    dispose(): void {
        this.canvas.dispose();
        this.layerMap.clear();
        this.currentArtboardId = null;
        this.variables = {};
    }
}
