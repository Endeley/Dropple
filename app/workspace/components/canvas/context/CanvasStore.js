'use client';

import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_FRAME_BACKGROUND = '#0F172A';
const DEFAULT_TEXT_COLOR = '#ECE9FE';

const SHARED_ELEMENT_DEFAULTS = {
    rotation: 0,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    fillType: 'solid',
    gradientType: 'linear',
    gradientAngle: 45,
    gradientStart: '#8B5CF6',
    gradientEnd: '#3B82F6',
    patternRepeat: 'repeat',
    patternScale: 1,
    patternOffsetX: 0,
    patternOffsetY: 0,
    imageUrl: null,
    backgroundFit: 'cover',
    backgroundBlendMode: 'normal',
    visible: true,
    blendMode: 'normal',
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    shadowColor: null,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    glowColor: null,
    glowBlur: 24,
};

const TEXT_ELEMENT_DEFAULTS = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
    align: 'left',
    fill: DEFAULT_TEXT_COLOR,
    textFillType: 'solid',
    textGradientStart: '#8B5CF6',
    textGradientEnd: '#3B82F6',
    textGradientAngle: 45,
    textShadowColor: null,
    textShadowBlur: 0,
    textShadowX: 0,
    textShadowY: 0,
};

const RECT_ELEMENT_DEFAULTS = {
    fill: '#201C3C',
    cornerRadius: 16,
    stroke: null,
    strokeWidth: 0,
};

const IMAGE_ELEMENT_DEFAULTS = {
    preserveAspectRatio: true,
};

const ELEMENT_NAME_MAP = {
    rect: 'Rectangle',
    shape: 'Rectangle',
    overlay: 'Overlay',
    clip: 'Clip',
    text: 'Text',
    script: 'Script',
    image: 'Image',
    component: 'Component',
    character: 'Character',
    group: 'Group',
};

const getDefaultElementName = (type) => ELEMENT_NAME_MAP[type] ?? 'Layer';

function withElementDefaults(element) {
    if (!element) return element;
    if (element.type === 'group') {
        return {
            ...element,
            name: element.name ?? getDefaultElementName('group'),
            props: {
                opacity: element.props?.opacity ?? 1,
                rotation: element.props?.rotation ?? 0,
                scaleX: element.props?.scaleX ?? 1,
                scaleY: element.props?.scaleY ?? 1,
                skewX: element.props?.skewX ?? 0,
                skewY: element.props?.skewY ?? 0,
                visible: element.props?.visible ?? true,
                ...(element.props ?? {}),
            },
        };
    }

    const typeDefaults =
        element.type === 'text'
            ? TEXT_ELEMENT_DEFAULTS
            : element.type === 'rect'
                ? RECT_ELEMENT_DEFAULTS
                : element.type === 'image'
                    ? IMAGE_ELEMENT_DEFAULTS
                    : {};

    return {
        ...element,
        name: element.name ?? getDefaultElementName(element.type),
        props: {
            ...SHARED_ELEMENT_DEFAULTS,
            ...typeDefaults,
            ...(element.props ?? {}),
        },
    };
}

const initialFrame = {
    id: 'frame-1',
    name: 'Home Page',
    x: 160,
    y: 120,
    width: 1440,
    height: 1024,
    opacity: 1,
    backgroundColor: DEFAULT_FRAME_BACKGROUND,
    backgroundImage: null,
    backgroundFit: 'cover',
    backgroundFillType: 'solid',
    backgroundGradientType: 'linear',
    backgroundGradientStart: '#8B5CF6',
    backgroundGradientEnd: '#3B82F6',
    backgroundGradientAngle: 45,
    backgroundPatternScale: 1,
    backgroundPatternOffsetX: 0,
    backgroundPatternOffsetY: 0,
    backgroundPatternRepeat: 'repeat',
    backgroundBlendMode: 'normal',
    timelineDuration: 20,
    elements: [
        withElementDefaults({
            id: 'text-hero',
            type: 'text',
            parentId: null,
            name: 'Hero Text',
            props: {
                text: 'Welcome to Dropple',
                fontSize: 48,
                fontWeight: 700,
                fill: DEFAULT_TEXT_COLOR,
                x: 120,
                y: 140,
                width: 520,
                lineHeight: 1.2,
                letterSpacing: 0,
                align: 'left',
                opacity: 1,
            },
        }),
        withElementDefaults({
            id: 'rect-card',
            type: 'rect',
            parentId: null,
            name: 'Hero Card',
            props: {
                x: 120,
                y: 260,
                width: 420,
                height: 220,
                fill: '#201C3C',
                cornerRadius: 24,
                stroke: '#8B5CF6',
                strokeWidth: 1,
                opacity: 0.92,
                shadowColor: 'rgba(139,92,246,0.35)',
                shadowBlur: 48,
                shadowOffsetX: 0,
                shadowOffsetY: 24,
            },
        }),
    ],
};

function computeBoundingBox(elements) {
    if (!Array.isArray(elements) || elements.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((element) => {
        const props = element?.props ?? {};
        const width = Number.isFinite(props.width) ? props.width : 0;
        const height = Number.isFinite(props.height) ? props.height : 0;
        const x = Number.isFinite(props.x) ? props.x : 0;
        const y = Number.isFinite(props.y) ? props.y : 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
        return null;
    }

    return {
        x: minX,
        y: minY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
    };
}

export const useCanvasStore = create(
    persist(
        (set, get) => ({
            mode: 'design',
            scale: 1,
    position: { x: 0, y: 0 },
    frames: [initialFrame],
    selectedFrameId: initialFrame.id,
    selectedElementId: null,
    selectedElementIds: [],
    selectedTool: 'pointer',
    prototypeMode: false,
    activePrototypeFrameId: initialFrame.id,
    frameLinks: [],
            activeGuides: [],
            activeToolOverlay: null,
            comments: [],
            timelineAssets: [],
            timelineActions: [],
            clipboard: null,
            contextMenu: null,

            setMode: (mode) => set({ mode }),
            setScale: (value) =>
                set((state) => ({ scale: typeof value === 'function' ? value(state.scale) : value })),
            setPosition: (value) =>
        set((state) => ({ position: typeof value === 'function' ? value(state.position) : value })),
    setSelectedTool: (tool) => set({ selectedTool: tool }),
    setActiveGuides: (guides) => set({ activeGuides: Array.isArray(guides) ? guides : [] }),
    clearActiveGuides: () => set({ activeGuides: [] }),
    setActiveToolOverlay: (overlay) => set({ activeToolOverlay: overlay }),

    setSelectedFrame: (id) =>
        set((state) => ({
            selectedFrameId: id,
            selectedElementId: null,
            selectedElementIds: [],
            activePrototypeFrameId: state.activePrototypeFrameId ?? id ?? state.frames[0]?.id ?? null,
        })),

    setSelectedElement: (frameId, elementId, options = {}) =>
        set((state) => {
            if (!frameId || !elementId) {
                return {
                    selectedFrameId: frameId ?? state.selectedFrameId,
                    selectedElementId: elementId ?? null,
                    selectedElementIds: elementId ? [elementId] : [],
                };
            }

            const additive = Boolean(options.additive);
            const sameFrame = state.selectedFrameId === frameId;
            let nextIds = [];

            if (additive && sameFrame) {
                nextIds = state.selectedElementIds.includes(elementId)
                    ? state.selectedElementIds
                    : [...state.selectedElementIds, elementId];
            } else {
                nextIds = [elementId];
            }

            return {
                selectedFrameId: frameId,
                selectedElementId: nextIds[0] ?? null,
                selectedElementIds: nextIds,
            };
        }),

    toggleElementSelection: (frameId, elementId) =>
        set((state) => {
            if (!frameId || !elementId) return {};

            if (state.selectedFrameId !== frameId) {
                return {
                    selectedFrameId: frameId,
                    selectedElementId: elementId,
                    selectedElementIds: [elementId],
                };
            }

            const exists = state.selectedElementIds.includes(elementId);
            const nextIds = exists
                ? state.selectedElementIds.filter((id) => id !== elementId)
                : [...state.selectedElementIds, elementId];

            return {
                selectedFrameId: frameId,
                selectedElementId: nextIds[0] ?? null,
                selectedElementIds: nextIds,
            };
        }),

    clearSelection: () => set({ selectedFrameId: null, selectedElementId: null, selectedElementIds: [] }),

    addFrame: (frame) =>
        set((state) => ({
            frames: [...state.frames, frame],
        })),

    addFrameAt: (position, overrides = {}) => {
        let createdFrame = null;
        set((state) => {
            const width = overrides.width ?? 960;
            const height = overrides.height ?? 640;
            const newFrame = {
                id: `frame-${nanoid(6)}`,
                name: overrides.name ?? `Frame ${state.frames.length + 1}`,
                x: position.x,
                y: position.y,
                width,
                height,
                opacity: overrides.opacity ?? 1,
                backgroundColor: overrides.backgroundColor ?? DEFAULT_FRAME_BACKGROUND,
                backgroundImage: overrides.backgroundImage ?? null,
                backgroundFit: overrides.backgroundFit ?? 'cover',
                backgroundFillType: overrides.backgroundFillType ?? 'solid',
                backgroundGradientType: overrides.backgroundGradientType ?? 'linear',
                backgroundGradientStart: overrides.backgroundGradientStart ?? '#8B5CF6',
                backgroundGradientEnd: overrides.backgroundGradientEnd ?? '#3B82F6',
                backgroundGradientAngle: overrides.backgroundGradientAngle ?? 45,
                backgroundPatternScale: overrides.backgroundPatternScale ?? 1,
                backgroundPatternOffsetX: overrides.backgroundPatternOffsetX ?? 0,
                backgroundPatternOffsetY: overrides.backgroundPatternOffsetY ?? 0,
                backgroundPatternRepeat: overrides.backgroundPatternRepeat ?? 'repeat',
                backgroundBlendMode: overrides.backgroundBlendMode ?? 'normal',
                timelineDuration: overrides.timelineDuration ?? 20,
                elements: [],
            };
            createdFrame = newFrame;
            return {
                frames: [...state.frames, newFrame],
                selectedFrameId: newFrame.id,
                selectedElementId: null,
                selectedElementIds: [],
            };
        });
        return createdFrame;
    },

    updateFrame: (id, updates) =>
        set((state) => ({
            frames: state.frames.map((frame) => (frame.id === id ? { ...frame, ...updates } : frame)),
        })),

    setFrameBackground: (frameId, updates) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    backgroundFillType: updates.backgroundFillType ?? frame.backgroundFillType ?? 'solid',
                    backgroundColor:
                        updates.backgroundColor !== undefined ? updates.backgroundColor : frame.backgroundColor,
                    backgroundImage:
                        updates.backgroundImage !== undefined ? updates.backgroundImage : frame.backgroundImage,
                    backgroundFit: updates.backgroundFit ?? frame.backgroundFit ?? 'cover',
                    backgroundBlendMode: updates.backgroundBlendMode ?? frame.backgroundBlendMode ?? 'normal',
                    backgroundGradientType: updates.backgroundGradientType ?? frame.backgroundGradientType ?? 'linear',
                    backgroundGradientStart:
                        updates.backgroundGradientStart ?? frame.backgroundGradientStart ?? '#8B5CF6',
                    backgroundGradientEnd:
                        updates.backgroundGradientEnd ?? frame.backgroundGradientEnd ?? '#3B82F6',
                    backgroundGradientAngle:
                        updates.backgroundGradientAngle ?? frame.backgroundGradientAngle ?? 45,
                    backgroundPatternScale:
                        updates.backgroundPatternScale ?? frame.backgroundPatternScale ?? 1,
                    backgroundPatternOffsetX:
                        updates.backgroundPatternOffsetX ?? frame.backgroundPatternOffsetX ?? 0,
                    backgroundPatternOffsetY:
                        updates.backgroundPatternOffsetY ?? frame.backgroundPatternOffsetY ?? 0,
                    backgroundPatternRepeat:
                        updates.backgroundPatternRepeat ?? frame.backgroundPatternRepeat ?? 'repeat',
                };
            }),
        })),

    addElementToFrame: (frameId, element, parentId = null) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const newElement = withElementDefaults({
                    ...element,
                    name: element?.name ?? getDefaultElementName(element?.type),
                    parentId: parentId ?? element.parentId ?? null,
                });
                return { ...frame, elements: [...frame.elements, newElement] };
            }),
        })),

    updateElement: (frameId, elementId, updates) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                let changed = false;
                const elements = frame.elements.map((element) => {
                    if (element.id !== elementId) return element;
                    changed = true;
                    return { ...element, ...updates };
                });
                return changed ? { ...frame, elements } : frame;
            }),
        })),

    updateElementProps: (frameId, elementId, propUpdates) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                let changed = false;
                const elements = frame.elements.map((element) => {
                    if (element.id !== elementId) return element;
                    changed = true;
                    return {
                        ...element,
                        props: {
                            ...element.props,
                            ...propUpdates,
                        },
                    };
                });
                return changed ? { ...frame, elements } : frame;
            }),
        })),

    setElementLink: (frameId, elementId, targetFrameId) => {
        const sanitized = targetFrameId || null;
        get().updateElementProps(frameId, elementId, { linkTarget: sanitized });
    },

    setElementParent: (frameId, elementId, parentId = null) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    elements: frame.elements.map((element) =>
                        element.id === elementId ? { ...element, parentId } : element,
                    ),
                };
            }),
        })),

    removeElement: (frameId, elementId) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    elements: frame.elements.filter((element) => element.id !== elementId),
                };
            }),
            comments: state.comments.filter((comment) => comment.elementId !== elementId),
        })),
    removeFrame: (frameId) => {
        const state = get();
        const remainingFrames = state.frames.filter((frame) => frame.id !== frameId);
        if (remainingFrames.length === state.frames.length) return;

        const nextFrame = state.selectedFrameId === frameId ? remainingFrames[0]?.id ?? null : state.selectedFrameId;

        set({
            frames: remainingFrames,
            selectedFrameId: nextFrame,
            selectedElementId: null,
            selectedElementIds: [],
            comments: state.comments.filter((comment) => comment.frameId !== frameId),
            timelineAssets: state.timelineAssets.filter((asset) => asset.frameId !== frameId),
            frameLinks: state.frameLinks.filter((link) => link.from !== frameId && link.to !== frameId),
        });
    },

    bringElementForward: (frameId, elementId) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index === -1 || index === frame.elements.length - 1) return frame;
                const elements = [...frame.elements];
                [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
                return { ...frame, elements };
            }),
        })),

    sendElementBackward: (frameId, elementId) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index <= 0) return frame;
                const elements = [...frame.elements];
                [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
                return { ...frame, elements };
            }),
        })),

    bringElementToFront: (frameId, elementId) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index === -1 || index === frame.elements.length - 1) return frame;
                const elements = [...frame.elements];
                const [target] = elements.splice(index, 1);
                elements.push(target);
                return { ...frame, elements };
            }),
        })),

    sendElementToBack: (frameId, elementId) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const index = frame.elements.findIndex((element) => element.id === elementId);
                if (index <= 0) return frame;
                const elements = [...frame.elements];
                const [target] = elements.splice(index, 1);
                elements.unshift(target);
                return { ...frame, elements };
            }),
        })),

    groupSelectedElements: () => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length < 2) return;

        const frame = state.getFrameById(selectedFrameId);
        if (!frame) return;

        const selectedSet = new Set(selectedElementIds);
        const elementsToGroup = frame.elements.filter((element) => selectedSet.has(element.id));
        if (elementsToGroup.length < 2) return;

        const parentId = elementsToGroup[0].parentId ?? null;
        const sameParent = elementsToGroup.every((element) => (element.parentId ?? null) === parentId);
        if (!sameParent) return;

        const bounds = computeBoundingBox(elementsToGroup);
        if (!bounds) return;

        const groupId = `group-${nanoid(6)}`;
        const groupElement = withElementDefaults({
            id: groupId,
            type: 'group',
            parentId,
            name: 'Group',
            props: {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width || 120,
                height: bounds.height || 120,
                fill: 'transparent',
                stroke: 'rgba(148,163,184,0.35)',
                strokeWidth: 1,
            },
        });

        let groupInserted = false;
        const updatedElements = [];

        frame.elements.forEach((element) => {
            if (selectedSet.has(element.id)) {
                if (!groupInserted) {
                    updatedElements.push(groupElement);
                    groupInserted = true;
                }
                const props = element.props ?? {};
                updatedElements.push({
                    ...element,
                    parentId: groupId,
                    props: {
                        ...props,
                        x: (props.x ?? 0) - bounds.x,
                        y: (props.y ?? 0) - bounds.y,
                    },
                });
            } else {
                updatedElements.push(element);
            }
        });

        set({
            frames: state.frames.map((item) =>
                item.id === frame.id ? { ...item, elements: updatedElements } : item,
            ),
            selectedElementId: groupId,
            selectedElementIds: [groupId],
        });
    },

    ungroupElement: (frameId, groupId) => {
        const state = get();
        if (!frameId || !groupId) return;

        const frame = state.getFrameById(frameId);
        if (!frame) return;

        const group = frame.elements.find((element) => element.id === groupId && element.type === 'group');
        if (!group) return;

        const groupProps = group.props ?? {};
        const childElements = frame.elements.filter((element) => element.parentId === groupId);

        const updatedElements = [];
        frame.elements.forEach((element) => {
            if (element.id === groupId) return;

            if (element.parentId === groupId) {
                updatedElements.push({
                    ...element,
                    parentId: group.parentId ?? null,
                    props: {
                        ...element.props,
                        x: (element.props?.x ?? 0) + (groupProps.x ?? 0),
                        y: (element.props?.y ?? 0) + (groupProps.y ?? 0),
                    },
                });
            } else {
                updatedElements.push(element);
            }
        });

        set({
            frames: state.frames.map((item) =>
                item.id === frame.id ? { ...item, elements: updatedElements } : item,
            ),
            selectedElementId: childElements[0]?.id ?? null,
            selectedElementIds: childElements.length ? [childElements[0].id] : [],
        });
    },

            liftElementOutOfGroup: (frameId, elementId) => {
                const state = get();
                const frame = state.getFrameById(frameId);
                if (!frame) return;
                const element = frame.elements.find((item) => item.id === elementId);
        if (!element || !element.parentId) return;
        const parent = frame.elements.find((item) => item.id === element.parentId);
        const parentProps = parent?.props ?? {};

        const siblings = frame.elements.filter((item) => item.parentId === element.parentId && item.id !== elementId);

        const updatedElements = frame.elements
            .map((item) => {
                if (item.id === elementId) {
                    return {
                        ...item,
                        parentId: parent?.parentId ?? null,
                        props: {
                            ...item.props,
                            x: (item.props?.x ?? 0) + (parentProps.x ?? 0),
                            y: (item.props?.y ?? 0) + (parentProps.y ?? 0),
                        },
                    };
                }
                return item;
            })
            .filter((item) => {
                if (parent && item.id === parent.id) {
                    return siblings.length > 0;
                }
                return true;
            });

        set({
            frames: state.frames.map((item) =>
                item.id === frame.id ? { ...item, elements: updatedElements } : item,
            ),
            selectedElementIds: [elementId],
            selectedElementId: elementId,
        });
    },

            renameElement: (frameId, elementId, name) => {
                if (!frameId || !elementId) return;
                const trimmed = (name ?? '').trim();
                set((state) => ({
                    frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    elements: frame.elements.map((element) =>
                        element.id === elementId
                            ? {
                                  ...element,
                                  name: trimmed || getDefaultElementName(element.type),
                              }
                            : element,
                    ),
                };
            }),
        }));
    },

    alignSelectedElements: (alignment) => {
        const state = get();
        const { selectedFrameId, selectedElementIds } = state;
        if (!selectedFrameId || selectedElementIds.length === 0) return;

        set((currentState) => {
            const frame = currentState.frames.find((item) => item.id === selectedFrameId);
            if (!frame) return {};

            const selection = new Set(selectedElementIds);
            const updatedElements = frame.elements.map((element) => {
                if (!selection.has(element.id)) return element;
                const props = element.props ?? {};
                const width = Number.isFinite(props.width) ? props.width : 0;
                const height = Number.isFinite(props.height) ? props.height : 0;
                const updates = {};
                switch (alignment) {
                    case 'left':
                        updates.x = 0;
                        break;
                    case 'center':
                        updates.x = Number.isFinite(width) ? (frame.width - width) / 2 : props.x ?? 0;
                        break;
                    case 'right':
                        updates.x = Number.isFinite(width) ? frame.width - width : props.x ?? 0;
                        break;
                    case 'top':
                        updates.y = 0;
                        break;
                    case 'middle':
                        updates.y = Number.isFinite(height) ? (frame.height - height) / 2 : props.y ?? 0;
                        break;
                    case 'bottom':
                        updates.y = Number.isFinite(height) ? frame.height - height : props.y ?? 0;
                        break;
                    default:
                        break;
                }
                return {
                    ...element,
                    props: {
                        ...props,
                        ...updates,
                    },
                };
            });

            const updatedFrame = { ...frame, elements: updatedElements };
            return {
                frames: currentState.frames.map((item) =>
                    item.id === frame.id ? updatedFrame : item,
                ),
            };
        });
    },

            distributeSelectedElements: (axis) => {
                const state = get();
                const { selectedFrameId, selectedElementIds } = state;
                if (!selectedFrameId || selectedElementIds.length < 3) return;

                set((currentState) => {
            const frame = currentState.frames.find((item) => item.id === selectedFrameId);
            if (!frame) return {};

            const selection = frame.elements
                .filter((element) => selectedElementIds.includes(element.id))
                .filter((element) => {
                    const props = element.props ?? {};
                    return axis === 'horizontal'
                        ? Number.isFinite(props.width)
                        : Number.isFinite(props.height);
                });

            if (selection.length < 3) return {};

            const sorted = [...selection].sort((a, b) => {
                const aProps = a.props ?? {};
                const bProps = b.props ?? {};
                if (axis === 'horizontal') {
                    return (aProps.x ?? 0) - (bProps.x ?? 0);
                }
                return (aProps.y ?? 0) - (bProps.y ?? 0);
            });

            const firstProps = sorted[0]?.props ?? {};
            const lastProps = sorted[sorted.length - 1]?.props ?? {};
            const firstStart = axis === 'horizontal' ? firstProps.x ?? 0 : firstProps.y ?? 0;
            const lastEnd =
                axis === 'horizontal'
                    ? (lastProps.x ?? 0) + (lastProps.width ?? 0)
                    : (lastProps.y ?? 0) + (lastProps.height ?? 0);

            const totalSpan = lastEnd - firstStart;
            const totalSize = sorted.reduce((acc, element) => {
                const props = element.props ?? {};
                return acc + (axis === 'horizontal' ? props.width ?? 0 : props.height ?? 0);
            }, 0);
            const gap = (totalSpan - totalSize) / (sorted.length - 1);

            if (!Number.isFinite(gap)) return {};

            const firstWidth = axis === 'horizontal' ? firstProps.width ?? 0 : firstProps.height ?? 0;
            let cursor = firstStart + firstWidth + gap;
            const updates = new Map();
            sorted.forEach((element, index) => {
                const props = element.props ?? {};
                if (index === 0) {
                    return;
                }

                const targetPosition = cursor;
                updates.set(element.id, {
                    ...props,
                    [axis === 'horizontal' ? 'x' : 'y']: targetPosition,
                });
                cursor += (axis === 'horizontal' ? props.width ?? 0 : props.height ?? 0) + gap;
            });

            const updatedElements = frame.elements.map((element) => {
                if (!updates.has(element.id)) return element;
                return {
                    ...element,
                    props: {
                        ...element.props,
                        ...updates.get(element.id),
                    },
                };
            });

            const updatedFrame = { ...frame, elements: updatedElements };
            return {
                frames: currentState.frames.map((item) =>
                    item.id === frame.id ? updatedFrame : item,
                ),
            };
        });
    },

    setPrototypeMode: (value) =>
        set((state) => {
            const frames = state.frames ?? [];
            const fallbackFrameId = state.selectedFrameId ?? frames[0]?.id ?? null;
            return {
                prototypeMode: value,
                activePrototypeFrameId: value ? state.activePrototypeFrameId ?? fallbackFrameId : null,
                selectedTool: value ? 'pointer' : state.selectedTool,
            };
        }),

    setActivePrototypeFrameId: (frameId) => set({ activePrototypeFrameId: frameId }),

    addFrameLink: (fromFrameId, toFrameId) =>
        set((state) => {
            if (!fromFrameId || !toFrameId) return {};
            const existing = state.frameLinks.find((link) => link.from === fromFrameId);
            if (existing?.to === toFrameId) return {};
            const filtered = state.frameLinks.filter((link) => link.from !== fromFrameId);
            return {
                frameLinks: [...filtered, { id: `link-${nanoid(6)}`, from: fromFrameId, to: toFrameId }],
            };
        }),

    removeFrameLink: (fromFrameId, toFrameId = null) =>
        set((state) => ({
            frameLinks: state.frameLinks.filter((link) => {
                if (link.from !== fromFrameId) return true;
                if (toFrameId == null) return false;
                return link.to !== toFrameId;
            }),
        })),

    resetCanvas: () =>
        set({
            scale: 1,
            position: { x: 0, y: 0 },
            frames: [initialFrame],
            selectedFrameId: initialFrame.id,
            selectedElementId: null,
            selectedElementIds: [],
            selectedTool: 'pointer',
            prototypeMode: false,
            activePrototypeFrameId: initialFrame.id,
            frameLinks: [],
            activeGuides: [],
            activeToolOverlay: null,
            comments: [],
            timelineAssets: [],
        }),

    getFrameById: (id) => get().frames.find((frame) => frame.id === id),
    getElementById: (frameId, elementId) => {
        const frame = get().getFrameById(frameId);
        if (!frame) return null;
        return frame.elements.find((element) => element.id === elementId) ?? null;
    },
    getLinkedFrames: (frameId) => get().frameLinks.filter((link) => link.from === frameId),
    addComment: ({ frameId, elementId = null, text }) => {
        if (!frameId || !text) return;
        set((state) => ({
            comments: [
                ...state.comments,
                {
                    id: `comment-${nanoid(6)}`,
                    frameId,
                    elementId,
                    text,
                    createdAt: new Date().toISOString(),
                },
            ],
        }));
    },
    removeComment: (commentId) =>
        set((state) => ({
            comments: state.comments.filter((comment) => comment.id !== commentId),
        })),
    pushTimelineAction: (action) =>
        set((state) => ({
            timelineActions: [...state.timelineActions.slice(-49), action],
        })),
    undoTimelineAction: () => {
        const state = get();
        const actions = [...state.timelineActions];
        const last = actions.pop();
        if (!last) return null;
        set((prevState) => {
            let timelineAssets = prevState.timelineAssets;
            switch (last.type) {
                case 'add':
                    timelineAssets = prevState.timelineAssets.filter((asset) => asset.id !== last.assetId);
                    break;
                case 'remove':
                    if (last.before) {
                        timelineAssets = [...prevState.timelineAssets, last.before];
                    }
                    break;
                case 'update':
                    if (last.before) {
                        timelineAssets = prevState.timelineAssets.map((asset) =>
                            asset.id === last.assetId ? last.before : asset,
                        );
                    }
                    break;
                default:
                    break;
            }
            return {
                timelineAssets,
                timelineActions: actions,
            };
        });
        return last;
    },
    clearTimelineHistory: () => set({ timelineActions: [] }),
    commitTimelineAssetChange: (assetId, previousState) => {
        const current = get().timelineAssets.find((asset) => asset.id === assetId);
        if (!current || !previousState) return;
        get().pushTimelineAction({
            id: `ta-${nanoid(6)}`,
            type: 'update',
            assetId,
            frameId: current.frameId,
            before: { ...previousState, waveform: previousState.waveform ? [...previousState.waveform] : null },
            after: { ...current, waveform: current.waveform ? [...current.waveform] : null },
            timestamp: new Date().toISOString(),
        });
    },
    addTimelineAsset: ({ frameId, label, type, duration, offset = 0, thumbnailUrl = null, waveform = null }) => {
        if (!frameId || !label) return;
        const normalizedWaveform = Array.isArray(waveform)
            ? waveform.filter((value) => Number.isFinite(value))
            : typeof waveform === 'string'
                ? waveform
                      .split(',')
                      .map((value) => Number(value.trim()))
                      .filter((value) => Number.isFinite(value))
                : null;
        const newAsset = {
            id: `asset-${nanoid(6)}`,
            frameId,
            label,
            type: type ?? 'clip',
            duration: duration ?? 5,
            offset: Math.max(0, offset ?? 0),
            thumbnailUrl: thumbnailUrl ?? null,
            waveform: normalizedWaveform,
            createdAt: new Date().toISOString(),
        };
        set((state) => ({
            timelineAssets: [...state.timelineAssets, newAsset],
        }));
        get().pushTimelineAction({
            id: `ta-${nanoid(6)}`,
            type: 'add',
            assetId: newAsset.id,
            frameId,
            before: null,
            after: { ...newAsset, waveform: newAsset.waveform ? [...newAsset.waveform] : null },
            timestamp: new Date().toISOString(),
        });
    },
    removeTimelineAsset: (assetId) => {
        const existing = get().timelineAssets.find((asset) => asset.id === assetId);
        if (!existing) return;
        set((state) => ({
            timelineAssets: state.timelineAssets.filter((asset) => asset.id !== assetId),
        }));
        get().pushTimelineAction({
            id: `ta-${nanoid(6)}`,
            type: 'remove',
            assetId,
            frameId: existing.frameId,
            before: { ...existing, waveform: existing.waveform ? [...existing.waveform] : null },
            after: null,
            timestamp: new Date().toISOString(),
        });
    },
    updateTimelineAsset: (assetId, updates, options = {}) => {
        const { log = true, previousState = null } = options;
        let before = null;
        let after = null;
        set((state) => {
            const timelineAssets = state.timelineAssets.map((asset) => {
                if (asset.id !== assetId) return asset;
                before = asset;
                const updated = {
                    ...asset,
                    ...(updates.duration !== undefined
                        ? { duration: Math.max(0.1, updates.duration) }
                        : {}),
                    ...(updates.offset !== undefined ? { offset: Math.max(0, updates.offset) } : {}),
                    ...(updates.thumbnailUrl !== undefined ? { thumbnailUrl: updates.thumbnailUrl } : {}),
                    ...(updates.waveform !== undefined
                        ? {
                              waveform: Array.isArray(updates.waveform)
                                  ? updates.waveform.filter((value) => Number.isFinite(value))
                                  : typeof updates.waveform === 'string'
                                      ? updates.waveform
                                            .split(',')
                                            .map((value) => Number(value.trim()))
                                            .filter((value) => Number.isFinite(value))
                                      : null,
                          }
                        : {}),
                };
                after = updated;
                return updated;
            });
            return { timelineAssets };
        });
        if (log && before && after && (previousState || before.offset !== after.offset || before.duration !== after.duration)) {
            get().pushTimelineAction({
                id: `ta-${nanoid(6)}`,
                type: 'update',
                assetId,
                frameId: before.frameId,
                before: previousState
                    ? { ...previousState, waveform: previousState.waveform ? [...previousState.waveform] : null }
                    : { ...before, waveform: before.waveform ? [...before.waveform] : null },
                after: { ...after, waveform: after.waveform ? [...after.waveform] : null },
                timestamp: new Date().toISOString(),
            });
        }
    },
            chainFrames: (frameIds) => {
                const uniqueIds = Array.from(new Set(Array.isArray(frameIds) ? frameIds : [])).filter(Boolean);
                if (uniqueIds.length < 2) return;

                set((state) => {
            const filteredLinks = state.frameLinks.filter((link) => !uniqueIds.includes(link.from));
            const generatedLinks = uniqueIds.slice(0, -1).map((fromId, index) => ({
                id: `link-${nanoid(6)}`,
                from: fromId,
                to: uniqueIds[index + 1],
            }));
            return {
                frameLinks: [...filteredLinks, ...generatedLinks],
            };
                });
            },
            setContextMenu: (contextMenu) => set({ contextMenu }),
            closeContextMenu: () => set({ contextMenu: null }),
            copyElement: (frameId, elementId) => {
                const frame = get().getFrameById(frameId);
                if (!frame) return;
                const element = frame.elements.find((item) => item.id === elementId);
                if (!element) return;
                const elementCopy = {
                    ...element,
                    props: { ...element.props },
                    id: undefined,
                    parentId: null,
                };
                set({
                    clipboard: {
                        type: 'element',
                        frameId,
                        element: elementCopy,
                    },
                });
            },
            duplicateElement: (frameId, elementId) => {
                const state = get();
                const frame = state.getFrameById(frameId);
                if (!frame) return;
                const element = frame.elements.find((item) => item.id === elementId);
                if (!element) return;
                const nextProps = {
                    ...element.props,
                    x: (element.props?.x ?? 0) + 32,
                    y: (element.props?.y ?? 0) + 32,
                };
                const newElement = {
                    ...element,
                    id: `el-${nanoid(6)}`,
                    name: `${element.name ?? getDefaultElementName(element.type)} Copy`,
                    parentId: null,
                    props: nextProps,
                };
                set({
                    frames: state.frames.map((item) =>
                        item.id === frameId ? { ...item, elements: [...item.elements, newElement] } : item,
                    ),
                    selectedElementId: newElement.id,
                    selectedElementIds: [newElement.id],
                });
            },
            pasteElement: (targetFrameId = null, position = null) => {
                const state = get();
                const { clipboard } = state;
                if (!clipboard || clipboard.type !== 'element') return;

                const frameId = targetFrameId ?? clipboard.frameId ?? state.selectedFrameId ?? state.frames[0]?.id;
                if (!frameId) return;

                const frame = state.getFrameById(frameId);
                if (!frame) return;

                const baseElement = clipboard.element;
                const baseProps = baseElement.props ?? {};
                const newElement = {
                    ...baseElement,
                    id: `el-${nanoid(6)}`,
                    name: `${baseElement.name ?? getDefaultElementName(baseElement.type)} Copy`,
                    parentId: null,
                    props: {
                        ...baseElement.props,
                        x:
                            position?.x !== null && position?.x !== undefined
                                ? position.x - frame.x
                                : (baseProps.x ?? 0) + 40,
                        y:
                            position?.y !== null && position?.y !== undefined
                                ? position.y - frame.y
                                : (baseProps.y ?? 0) + 40,
                    },
                };

                set({
                    frames: state.frames.map((item) =>
                        item.id === frameId ? { ...item, elements: [...item.elements, newElement] } : item,
                    ),
                    selectedFrameId: frameId,
                    selectedElementId: newElement.id,
                    selectedElementIds: [newElement.id],
                });
            },
            copyFrame: (frameId) => {
                const frame = get().getFrameById(frameId);
                if (!frame) return;
                const frameCopy = {
                    ...frame,
                    id: undefined,
                    elements: frame.elements.map((element) => ({
                        ...element,
                        id: undefined,
                        props: { ...element.props },
                    })),
                };
                set({
                    clipboard: {
                        type: 'frame',
                        frame: frameCopy,
                    },
                });
            },
            duplicateFrame: (frameId) => {
                const state = get();
                const frame = state.getFrameById(frameId);
                if (!frame) return;
                const newFrame = {
                    ...frame,
                    id: `frame-${nanoid(6)}`,
                    name: `${frame.name ?? 'Frame'} Copy`,
                    x: frame.x + 80,
                    y: frame.y + 80,
                    elements: frame.elements.map((element) => ({
                        ...element,
                        id: `el-${nanoid(6)}`,
                        props: {
                            ...element.props,
                        },
                    })),
                };
                set({
                    frames: [...state.frames, newFrame],
                    selectedFrameId: newFrame.id,
                    selectedElementIds: [],
                    selectedElementId: null,
                });
            },
            pasteFrame: (position = null) => {
                const state = get();
                const { clipboard } = state;
                if (!clipboard || clipboard.type !== 'frame') return;
                const baseFrame = clipboard.frame;
                const newFrameId = `frame-${nanoid(6)}`;
                const newFrame = {
                    ...baseFrame,
                    id: newFrameId,
                    name: `${baseFrame.name ?? 'Frame'} Copy`,
                    x: position?.x ?? (baseFrame.x ?? 0) + 120,
                    y: position?.y ?? (baseFrame.y ?? 0) + 120,
                    elements: (baseFrame.elements ?? []).map((element) => ({
                        ...element,
                        id: `el-${nanoid(6)}`,
                        props: {
                            ...element.props,
                        },
                    })),
                };
                set({
                    frames: [...state.frames, newFrame],
                    selectedFrameId: newFrameId,
                    selectedElementIds: [],
                    selectedElementId: null,
                });
            },
        }),
        {
            name: 'dropple-canvas-state',
            version: 1,
            partialize: (state) => ({
                mode: state.mode,
                scale: state.scale,
                position: state.position,
                frames: state.frames,
                selectedFrameId: state.selectedFrameId,
                frameLinks: state.frameLinks,
                comments: state.comments,
                timelineAssets: state.timelineAssets,
                prototypeMode: state.prototypeMode,
                activePrototypeFrameId: state.activePrototypeFrameId,
            }),
        },
    ),
);
