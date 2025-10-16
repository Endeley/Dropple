// @ts-nocheck

import * as fabric from 'fabric';

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
    const shapeKind = layer.type === 'shape' ? layer.shape : data.shapeKind;
    object.set('data', { ...data, layerId: layer.id, shapeKind });
}

function applyShapeStyling(object: fabric.Object, layer: ShapeLayer) {
    if (!object) return;
    if (layer.fill?.kind === 'solid') {
        object.set('fill', layer.fill.color);
    } else if (!layer.fill) {
        object.set('fill', DEFAULT_SHAPE_COLOR);
    }
    if (layer.stroke) {
        object.set('stroke', layer.stroke.color);
        object.set('strokeWidth', layer.stroke.width ?? 1);
        if ('strokeUniform' in object) {
            object.set('strokeUniform', true);
        }
    } else {
        object.set('stroke', undefined);
        object.set('strokeWidth', 0);
    }
    if (layer.shadow) {
        object.set(
            'shadow',
            new fabric.Shadow({
                color: layer.shadow.color,
                blur: layer.shadow.blur,
                offsetX: layer.shadow.offsetX,
                offsetY: layer.shadow.offsetY,
                opacity: layer.shadow.opacity ?? 1,
            })
        );
    } else {
        object.set('shadow', undefined);
    }
}

function applyImageFilters(image: fabric.Image, layer: ImageLayer) {
    if (!image) return;
    const filters: fabric.IBaseFilter[] = [];
    const adjustments = layer.filters ?? {};

    if (typeof adjustments.brightness === 'number') {
        filters.push(new fabric.filters.Brightness({ brightness: adjustments.brightness }));
    }
    if (typeof adjustments.contrast === 'number') {
        filters.push(new fabric.filters.Contrast({ contrast: adjustments.contrast }));
    }
    if (typeof adjustments.saturation === 'number') {
        filters.push(new fabric.filters.Saturation({ saturation: adjustments.saturation }));
    }
    if (typeof adjustments.blur === 'number' && adjustments.blur > 0) {
        filters.push(new fabric.filters.Blur({ blur: adjustments.blur }));
    }
    if (typeof adjustments.grayscale === 'number' && adjustments.grayscale > 0) {
        filters.push(new fabric.filters.Grayscale({ }));
    }

    image.filters = filters;
    image.applyFilters();
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
                        if (layer.cornerRadius) {
                            img.set('rx', cornerValue(layer.cornerRadius));
                            img.set('ry', cornerValue(layer.cornerRadius));
                            img.set('clipPath', undefined);
                        }
                        if (layer.stroke) {
                            img.set('stroke', layer.stroke.color);
                            img.set('strokeWidth', layer.stroke.width ?? 1);
                        }
                        applyImageFilters(img, layer);
                        resolve(img);
                    },
                    { crossOrigin: 'anonymous' }
                );
            });
        case 'shape':
            if (layer.shape === 'ellipse') {
                return Promise.resolve(
                    (() => {
                        const ellipse = new fabric.Ellipse({
                            left: layer.transform.x,
                            top: layer.transform.y,
                            originX: 'left',
                            originY: 'top',
                            rx: layer.transform.width / 2,
                            ry: layer.transform.height / 2,
                        });
                        applyShapeStyling(ellipse, layer);
                        return ellipse;
                    })()
                );
            }
            if (layer.shape === 'line') {
                const x2 = layer.transform.x + layer.transform.width;
                const y2 = layer.transform.y + layer.transform.height;
                return Promise.resolve(
                    (() => {
                        const line = new fabric.Line([layer.transform.x, layer.transform.y, x2, y2], {
                            stroke: layer.stroke?.color ?? DEFAULT_SHAPE_COLOR,
                            strokeWidth: layer.stroke?.width ?? 2,
                        });
                        return line;
                    })()
                );
            }
            if (layer.shape === 'polygon' || layer.shape === 'star') {
                if (layer.points?.length) {
                    return Promise.resolve(
                        (() => {
                            const polygon = new fabric.Polygon(layer.points!.map((pt) => ({ ...pt })), {
                                left: layer.transform.x,
                                top: layer.transform.y,
                                originX: 'center',
                                originY: 'center',
                            });
                            applyShapeStyling(polygon, layer);
                            polygon.set({ data: { layerId: layer.id, shapeKind: layer.shape } });
                            polygon.scaleToWidth(layer.transform.width);
                            polygon.scaleToHeight(layer.transform.height);
                            polygon.set({
                                left: layer.transform.x + layer.transform.width / 2,
                                top: layer.transform.y + layer.transform.height / 2,
                            });
                            return polygon;
                        })()
                    );
                }
            }
            if (layer.shape === 'path' && layer.path?.length) {
                return Promise.resolve(
                    (() => {
                        const path = new fabric.Path(layer.path as any, {
                            left: layer.transform.x,
                            top: layer.transform.y,
                        });
                        applyShapeStyling(path, layer);
                        const bounds = path.getBoundingRect(false, true);
                        if (bounds.width && bounds.height) {
                            const scaleX = layer.transform.width / bounds.width;
                            const scaleY = layer.transform.height / bounds.height;
                            path.scaleX = scaleX;
                            path.scaleY = scaleY;
                        }
                        return path;
                    })()
                );
            }
            return Promise.resolve(
                (() => {
                    const rect = new fabric.Rect({
                    left: layer.transform.x,
                    top: layer.transform.y,
                    width: layer.transform.width,
                    height: layer.transform.height,
                    rx: cornerValue(layer.cornerRadius),
                    ry: cornerValue(layer.cornerRadius),
                });
                    applyShapeStyling(rect, layer);
                    return rect;
                })()
            );
        default:
            return Promise.resolve(null);
   }
}

export function addOverlayRect(canvas: fabric.Canvas, color = 'rgba(14,165,233,0.35)', blend: GlobalCompositeOperation = 'multiply') {
    const overlay = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        fill: color,
        selectable: true,
        hasBorders: false,
        hasControls: true,
        hoverCursor: 'move',
    });
    overlay.globalCompositeOperation = blend;
    overlay.name = 'Overlay';
    canvas.add(overlay);
    overlay.moveTo(canvas.getObjects().length - 1);
    canvas.setActiveObject(overlay);
    canvas.renderAll();
    return overlay;
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
        const filters = imageObject.filters ?? [];
        if (filters.length) {
            const adjustments: ImageLayer['filters'] = {};
            filters.forEach((filter) => {
                if (filter instanceof fabric.filters.Brightness) {
                    adjustments.brightness = filter.brightness;
                }
                if (filter instanceof fabric.filters.Contrast) {
                    adjustments.contrast = filter.contrast;
                }
                if (filter instanceof fabric.filters.Saturation) {
                    adjustments.saturation = filter.saturation;
                }
                if (filter instanceof fabric.filters.Blur) {
                    adjustments.blur = filter.blur;
                }
                if (filter instanceof fabric.filters.Grayscale) {
                    adjustments.grayscale = 1;
                }
            });
            layer.filters = adjustments;
        }
        if (object.stroke) {
            layer.stroke = {
                color: object.stroke as string,
                width: object.strokeWidth ?? 1,
            };
        }
        if ((object as any).rx || (object as any).ry) {
            layer.cornerRadius = (object as any).rx ?? 0;
        }
        return layer;
    }

    const shapeKindFromData = (data.shapeKind as ShapeLayer['shape']) ?? undefined;
    const transform = extractTransform(object);
    const shapeLayer: ShapeLayer = {
        id,
        type: 'shape',
        name: object.name,
        transform,
        shape:
            shapeKindFromData ??
            (object.type === 'ellipse' || object.type === 'circle'
                ? 'ellipse'
                : object.type === 'line'
                ? 'line'
                : object.type === 'polygon'
                ? 'polygon'
                : object.type === 'path'
                ? 'path'
                : 'rect'),
    };

    if (object.fill) {
        shapeLayer.fill = { kind: 'solid', color: object.fill as string };
    } else {
        shapeLayer.fill = { kind: 'solid', color: DEFAULT_SHAPE_COLOR };
    }
    if (object.stroke) {
        shapeLayer.stroke = {
            color: object.stroke as string,
            width: object.strokeWidth ?? 1,
        };
    }
    if ('rx' in object && (object as any).rx) {
        shapeLayer.cornerRadius = (object as any).rx ?? 0;
    }
    if (object.shadow) {
        const shadow = object.shadow as fabric.Shadow;
        shapeLayer.shadow = {
            color: shadow.color ?? '#000000',
            blur: shadow.blur ?? 0,
            offsetX: shadow.offsetX ?? 0,
            offsetY: shadow.offsetY ?? 0,
            opacity: shadow.opacity ?? 1,
        };
    }

    if (object.type === 'line') {
        const line = object as fabric.Line;
        const points = line.points ?? [
            { x: line.x1 ?? 0, y: line.y1 ?? 0 },
            { x: line.x2 ?? 0, y: line.y2 ?? 0 },
        ];
        shapeLayer.points = points.map((pt: any) => ({ x: pt.x, y: pt.y }));
    }
    if (object.type === 'polygon') {
        const polygon = object as fabric.Polygon;
        shapeLayer.points = polygon.points?.map((pt) => ({ x: pt.x, y: pt.y }));
        if (!shapeKindFromData && polygon.points && polygon.points.length === 10) {
            shapeLayer.shape = 'star';
        }
    }
    if (object.type === 'path') {
        const pathObj = object as fabric.Path;
        shapeLayer.shape = 'path';
        shapeLayer.path = pathObj.path?.map((segment) => [...segment]) as any;
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
            this.canvas.backgroundColor = artboard.background.value;
        } else {
            this.canvas.backgroundColor = '#ffffff';
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
        if (existing && layer.type === 'image' && existing.type === 'image') {
            const image = existing as fabric.Image;
            image.set({
                left: layer.transform.x,
                top: layer.transform.y,
                opacity: layer.transform.opacity ?? 1,
                angle: layer.transform.rotation ?? 0,
            });
            if (layer.transform.width && layer.transform.height) {
                image.scaleToWidth(layer.transform.width, false);
                image.scaleToHeight(layer.transform.height, false);
            }
            if (layer.cornerRadius) {
                image.set('rx', cornerValue(layer.cornerRadius));
                image.set('ry', cornerValue(layer.cornerRadius));
            }
            if (layer.stroke) {
                image.set('stroke', layer.stroke.color);
                image.set('strokeWidth', layer.stroke.width ?? 1);
            } else {
                image.set('stroke', undefined);
                image.set('strokeWidth', 0);
            }
            applyImageFilters(image, layer as ImageLayer);
            applyCommonProps(image, layer);
            this.canvas.renderAll();
            return Promise.resolve();
        }
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
