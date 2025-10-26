'use client';

import { nanoid } from 'nanoid';
import { create } from 'zustand';

const DEFAULT_FRAME_BACKGROUND = '#0F172A';
const DEFAULT_TEXT_COLOR = '#ECE9FE';

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
    timelineDuration: 20,
    elements: [
        {
            id: 'text-hero',
            type: 'text',
            parentId: null,
            props: {
                text: 'Welcome to Dropple',
                fontSize: 48,
                fill: DEFAULT_TEXT_COLOR,
                fontStyle: 'bold',
                x: 120,
                y: 140,
                width: 520,
                lineHeight: 1.2,
                letterSpacing: 0,
                align: 'left',
                opacity: 1,
            },
        },
        {
            id: 'rect-card',
            type: 'rect',
            parentId: null,
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
            },
        },
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

export const useCanvasStore = create((set, get) => ({
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
                    backgroundColor:
                        updates.backgroundColor !== undefined ? updates.backgroundColor : frame.backgroundColor,
                    backgroundImage:
                        updates.backgroundImage !== undefined ? updates.backgroundImage : frame.backgroundImage,
                    backgroundFit: updates.backgroundFit ?? frame.backgroundFit ?? 'cover',
                };
            }),
        })),

    addElementToFrame: (frameId, element, parentId = null) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                const newElement = {
                    ...element,
                    parentId: parentId ?? element.parentId ?? null,
                    props: {
                        opacity: 1,
                        ...element.props,
                    },
                };
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
        const groupElement = {
            id: groupId,
            type: 'group',
            parentId,
            props: {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width || 120,
                height: bounds.height || 120,
                fill: 'transparent',
                opacity: 1,
            },
        };

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
    addTimelineAsset: ({ frameId, label, type, duration }) => {
        if (!frameId || !label) return;
        set((state) => ({
            timelineAssets: [
                ...state.timelineAssets,
                {
                    id: `asset-${nanoid(6)}`,
                    frameId,
                    label,
                    type: type ?? 'clip',
                    duration: duration ?? 5,
                    createdAt: new Date().toISOString(),
                },
            ],
        }));
    },
    removeTimelineAsset: (assetId) =>
        set((state) => ({
            timelineAssets: state.timelineAssets.filter((asset) => asset.id !== assetId),
        })),
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
}));
