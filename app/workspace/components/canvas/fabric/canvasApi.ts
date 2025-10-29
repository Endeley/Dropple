import { fabricService } from './fabricServiceSingleton';
import { useCanvasStore } from '../context/CanvasStore';
import { createElement } from '../utils/elementFactory';
import { findFrameAtPoint } from '../utils/frameUtils';
import type { CanvasElement, CanvasFrame } from './types';

type Point = { x: number; y: number };

const SNAP_PROPERTIES = ['grid'] as const;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const snapPoint = (point: Point, snapping: Record<string, unknown> | undefined | null): Point => {
    if (!snapping) return point;
    const next = { ...point };
    SNAP_PROPERTIES.forEach((prop) => {
        const value = snapping[prop];
        if (prop === 'grid' && isFiniteNumber(value) && value > 0) {
            next.x = Math.round(next.x / value) * value;
            next.y = Math.round(next.y / value) * value;
        }
    });
    return next;
};

const ensureFrame = async (frameId: string | null) => {
    const store = useCanvasStore.getState();
    if (!frameId) return;
    const frame = store.getFrameById(frameId);
    if (frame) {
        await fabricService.upsertFrame(frame);
    }
};

const ensureElement = async (frameId: string | null, elementId: string | null) => {
    const store = useCanvasStore.getState();
    if (!frameId || !elementId) return;
    const frame = store.getFrameById(frameId);
    if (!frame) return;
    const element = frame.elements.find((item) => item.id === elementId);
    if (!element) return;
    await fabricService.upsertElement(frame, element);
};

type FrameToolContext = {
    pointer: Point;
    canvasBehavior: Record<string, any>;
    mode: string | null;
    historyLabel?: string;
};

export const performFrameTool = async (context: FrameToolContext) => {
    const { pointer, canvasBehavior, historyLabel } = context;
    const store = useCanvasStore.getState();
    const defaults = canvasBehavior.frameDefaults ?? {};
    const width = defaults.width ?? 960;
    const height = defaults.height ?? 640;
    const snapped = snapPoint(pointer, canvasBehavior.snapping);
    const framePosition = {
        x: snapped.x - width / 2,
        y: snapped.y - height / 2,
    };

    const newFrame = store.addFrameAt(framePosition, { width, height });
    if (!newFrame) return null;

    await fabricService.upsertFrame({ ...newFrame, elements: [] });
    store.setSelectedFrame(newFrame.id);
    store.commitHistory(historyLabel ?? 'Add frame');
    return { frameId: newFrame.id };
};

type ElementToolContext = {
    pointer: Point;
    canvasBehavior: Record<string, any>;
    mode: string | null;
    behavior: {
        elementType: string;
        preset?: Record<string, unknown> | null;
        toolId?: string;
    };
};

export const performElementTool = async (context: ElementToolContext) => {
    const { pointer, canvasBehavior, mode, behavior } = context;
    const store = useCanvasStore.getState();
    const frames = store.frames ?? [];
    let targetFrame = findFrameAtPoint(frames, pointer);

    if (!targetFrame) {
        const fallback = snapPoint(pointer, canvasBehavior.snapping);
        const frameDefaults = canvasBehavior.frameDefaults ?? {};
        targetFrame = store.addFrameAt(
            {
                x: fallback.x - (frameDefaults.width ?? 960) / 2,
                y: fallback.y - (frameDefaults.height ?? 640) / 2,
            },
            {
                width: frameDefaults.width ?? 960,
                height: frameDefaults.height ?? 640,
            },
        );
        if (!targetFrame) return null;
        await fabricService.upsertFrame({ ...targetFrame, elements: [] });
        store.setSelectedFrame(targetFrame.id);
    }

    const snappedPoint = snapPoint(pointer, canvasBehavior.snapping);
    const element = createElement(behavior.elementType, targetFrame, snappedPoint, {
        mode,
        preset: behavior.preset,
    });

    store.addElementToFrame(targetFrame.id, element);
    store.setSelectedElement(targetFrame.id, element.id);

    const latestFrame = store.getFrameById(targetFrame.id);
    if (latestFrame) {
        await fabricService.upsertElement(latestFrame, element);
    }

    const result: {
        frameId: string;
        elementId: string;
        requestImageUpload?: { frameId: string; elementId: string };
        aiGenerator?: {
            frameId: string;
            elementId: string;
            baseWidth: number;
            baseHeight: number;
        };
    } = {
        frameId: targetFrame.id,
        elementId: element.id,
    };

    if (behavior.toolId === 'image') {
        result.requestImageUpload = { frameId: targetFrame.id, elementId: element.id };
    }

    if (behavior.toolId === 'ai-generator') {
        const baseWidth = Math.max(360, element.props?.width ?? 320);
        const baseHeight = Math.max(160, element.props?.height ?? 160);
        store.updateElementProps(
            targetFrame.id,
            element.id,
            {
                text: 'Generating AI copy…',
                width: baseWidth,
                height: baseHeight,
            },
            { skipHistory: true },
        );
        await ensureElement(targetFrame.id, element.id);
        result.aiGenerator = { frameId: targetFrame.id, elementId: element.id, baseWidth, baseHeight };
    }

    return result;
};

type UpdateOptions = {
    historyLabel?: string;
    source?: string;
    skipHistory?: boolean;
};

export const updateFramePropsViaFabric = async (
    frameId: string,
    updates: Partial<CanvasFrame>,
    options: UpdateOptions = {},
) => {
    const store = useCanvasStore.getState();
    store.updateFrame(frameId, updates, options);
    await ensureFrame(frameId);
};

export const setFrameBackgroundViaFabric = async (
    frameId: string,
    updates: Record<string, unknown>,
    options: UpdateOptions = {},
) => {
    const store = useCanvasStore.getState();
    store.setFrameBackground(frameId, updates, options);
    await ensureFrame(frameId);
};

export const updateElementPropsViaFabric = async (
    frameId: string,
    elementId: string,
    updates: Partial<CanvasElement['props']>,
    options: UpdateOptions = {},
) => {
    const store = useCanvasStore.getState();
    store.updateElementProps(frameId, elementId, updates, options);
    await ensureElement(frameId, elementId);
};

export const updateElementsPropsBatchViaFabric = async (
    frameId: string,
    entries: Array<{ elementId: string; props: Partial<CanvasElement['props']> }>,
    options: UpdateOptions = {},
) => {
    if (!entries.length) return;
    const store = useCanvasStore.getState();
    store.updateElementsPropsBatch(frameId, entries, options);
    await Promise.all(entries.map((entry) => ensureElement(frameId, entry.elementId)));
};
