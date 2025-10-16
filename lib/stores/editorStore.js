import { create } from 'zustand';
import { demoScreenNodes, createNode, findNode, recalcRootBounds } from '@/components/ui-designer/uiNodeModel';

const DEFAULT_DEVICE = { width: 1440, height: 900 };
const DEFAULT_LAYOUT = {
    auto: false,
    direction: 'vertical',
    spacing: 24,
    padding: 32,
    alignment: 'start',
    distribute: 'start',
};

const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 10);
};

const deepClone = (value) => {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
};

const applyAutoLayout = (node) => {
    if (!node || !Array.isArray(node.children)) return;
    node.children.forEach(applyAutoLayout);

    const layout = node.layout;
    if (!layout || !layout.auto) return;

    const frame = node.frame ?? (node.frame = { x: 0, y: 0, width: 0, height: 0 });
    const padding = layout.padding ?? 0;
    const rawSpacing = layout.spacing ?? 0;
    const direction = layout.direction ?? 'vertical';
    const alignment = layout.alignment ?? 'start';
    const distribute = layout.distribute ?? 'start';

    const visibleChildren = node.children.filter((child) => child?.visible !== false);
    if (!visibleChildren.length) return;

    const childSizes = visibleChildren.map((child) => {
        const cf = child.frame ?? (child.frame = { x: 0, y: 0, width: child.width ?? 0, height: child.height ?? 0 });
        return {
            node: child,
            frame: cf,
            width: cf.width ?? child.width ?? 0,
            height: cf.height ?? child.height ?? 0,
        };
    });

    const totalChildWidth = childSizes.reduce((sum, child) => sum + child.width, 0);
    const totalChildHeight = childSizes.reduce((sum, child) => sum + child.height, 0);

    if (direction === 'vertical') {
        let spacing = rawSpacing;
        if (distribute === 'space-between' && childSizes.length > 1) {
            const available = Math.max(frame.height ?? 0, padding * 2 + totalChildHeight);
            spacing = Math.max(rawSpacing, (available - padding * 2 - totalChildHeight) / (childSizes.length - 1));
        }

        let cursor = padding;
        childSizes.forEach(({ frame: cf, width }) => {
            cf.y = cursor;
            cursor += (cf.height ?? 0) + spacing;

            if (alignment === 'center') {
                cf.x = padding + Math.max(0, (frame.width ?? totalChildWidth) - width) / 2;
            } else if (alignment === 'end') {
                cf.x = Math.max(padding, (frame.width ?? totalChildWidth) - padding - width);
            } else {
                cf.x = padding;
            }
        });

        const newHeight = padding * 2 + totalChildHeight + spacing * Math.max(childSizes.length - 1, 0);
        node.frame.height = Math.max(frame.height ?? 0, newHeight);
    } else {
        let spacing = rawSpacing;
        if (distribute === 'space-between' && childSizes.length > 1) {
            const available = Math.max(frame.width ?? 0, padding * 2 + totalChildWidth);
            spacing = Math.max(rawSpacing, (available - padding * 2 - totalChildWidth) / (childSizes.length - 1));
        }

        let cursor = padding;
        childSizes.forEach(({ frame: cf, height }) => {
            cf.x = cursor;
            cursor += (cf.width ?? 0) + spacing;

            if (alignment === 'center') {
                cf.y = padding + Math.max(0, (frame.height ?? totalChildHeight) - height) / 2;
            } else if (alignment === 'end') {
                cf.y = Math.max(padding, (frame.height ?? totalChildHeight) - padding - height);
            } else {
                cf.y = padding;
            }
        });

        const newWidth = padding * 2 + totalChildWidth + spacing * Math.max(childSizes.length - 1, 0);
        node.frame.width = Math.max(frame.width ?? 0, newWidth);
    }
};

const nodeToLayer = (node) => {
    const frame = node?.frame ?? {};
    const props = node?.props ?? {};
    return {
        id: node.id,
        type: node.type,
        name: node.name ?? props.name ?? node.type,
        frame: {
            x: frame.x ?? 0,
            y: frame.y ?? 0,
            width: frame.width ?? 120,
            height: frame.height ?? 120,
        },
        x: frame.x ?? 0,
        y: frame.y ?? 0,
        width: frame.width ?? 120,
        height: frame.height ?? 120,
        fill: props.fill,
        color: props.color ?? props.fill ?? '#000000',
        text: props.text,
        fontSize: props.fontSize,
        props: { ...props },
        opacity: node.opacity ?? 1,
        angle: node.angle ?? 0,
        visible: node.visible ?? true,
        locked: node.locked ?? false,
        layout: node.layout ?? undefined,
        constraints: node.constraints ?? undefined,
    };
};

const canvasNodeToLayer = (node) => {
    if (!node) return null;
    const props = node.props ?? {};
    const frame = props.frame ?? {};
    const style = props.style ?? {};
    const x = Math.round(frame.x ?? 0);
    const y = Math.round(frame.y ?? 0);
    const width = Math.max(1, Math.round(frame.width ?? 0) || 120);
    const height = Math.max(1, Math.round(frame.height ?? 0) || 120);

    return {
        id: node.nodeId ?? node.id ?? generateId(),
        type: node.type ?? 'rect',
        name: props.name ?? node.type ?? 'Layer',
        frame: { x, y, width, height },
        x,
        y,
        width,
        height,
        fill: style.fill,
        color: style.color ?? style.fill,
        text: props.text,
        fontSize: style.fontSize,
        props: {
            fill: style.fill,
            color: style.color,
            text: props.text,
            fontSize: style.fontSize,
            opacity: style.opacity,
            angle: style.angle,
        },
        opacity: style.opacity ?? 1,
        angle: style.angle ?? 0,
        visible: props.visible ?? true,
        locked: props.locked ?? false,
        layout: props.layout,
        constraints: props.constraints,
    };
};

const layerToNode = (layer) => {
    if (!layer) return null;
    const frame = layer.frame ?? {};
    return {
        id: layer.id,
        type: layer.type ?? 'rect',
        frame: {
            x: frame.x ?? layer.x ?? 0,
            y: frame.y ?? layer.y ?? 0,
            width: frame.width ?? layer.width ?? 120,
            height: frame.height ?? layer.height ?? 120,
        },
        props: {
            ...(layer.props ?? {}),
            fill: layer.fill ?? layer.color,
            color: layer.color,
            text: layer.text,
            fontSize: layer.fontSize,
            opacity: layer.opacity,
            angle: layer.angle,
        },
        visible: layer.visible ?? true,
        locked: layer.locked ?? false,
        opacity: layer.opacity ?? 1,
        angle: layer.angle ?? 0,
        layout: layer.layout ?? null,
        constraints: layer.constraints ?? null,
    };
};

const buildRootFromLayers = (existingRoot, layers) => {
    const root = {
        ...(existingRoot ?? {}),
        id: existingRoot?.id ?? 'root',
        type: 'root',
        children: layers.map(layerToNode).filter(Boolean),
    };
    root.layout = { ...DEFAULT_LAYOUT, ...(existingRoot?.layout ?? {}) };
    applyAutoLayout(root);
    recalcRootBounds(root);
    return root;
};

const extractLayers = (root) => {
    if (!root || !Array.isArray(root.children)) return [];
    return root.children.filter((child) => child && child.frame).map(nodeToLayer);
};

const computeActiveScreen = (screens, activeId) =>
    screens.find((screen) => screen.id === activeId) ?? null;

export const useEditorStore = create((set, get) => ({
    title: 'Untitled Design',
    screens: [],
    activeScreenId: null,
    activeScreen: null,
    selectedIds: [],

    addScreen: (template = {}) => {
        const id = template.id ?? generateId();
        const device = template.device ?? { ...DEFAULT_DEVICE };
        const kind = template.kind ?? 'blank';
        const root = demoScreenNodes(device.width, kind, device.height);
        const layers = extractLayers(root);
        const newScreen = {
            id,
            name: template.label ?? template.name ?? 'New Page',
            kind,
            device,
            root,
            layers,
        };

        set((state) => ({
            screens: [...state.screens, newScreen],
            activeScreenId: id,
            activeScreen: newScreen,
            selectedIds: [],
        }));
    },

    renameScreen: (id, name) =>
        set((state) => {
            let touched = false;
            const screens = state.screens.map((screen) => {
                if (screen.id !== id) return screen;
                touched = true;
                return { ...screen, name: name?.trim?.() || screen.name };
            });
            if (!touched) return undefined;
            return {
                screens,
                activeScreen: computeActiveScreen(screens, state.activeScreenId),
            };
        }),

    deleteScreen: (id) =>
        set((state) => {
            if (!state.screens.length) return undefined;
            const screens = state.screens.filter((screen) => screen.id !== id);
            const removedActive = state.activeScreenId === id;
            const nextActiveId = removedActive ? screens[screens.length - 1]?.id ?? null : state.activeScreenId;
            return {
                screens,
                activeScreenId: nextActiveId,
                activeScreen: computeActiveScreen(screens, nextActiveId),
                selectedIds: removedActive ? [] : state.selectedIds.filter((selectedId) => selectedId !== id),
            };
        }),

    duplicateScreen: (id) => {
        const original = get().screens.find((screen) => screen.id === id);
        if (!original) return;
        const root = deepClone(original.root);
        const layers = extractLayers(root);
        const newId = generateId();
        const copy = {
            ...deepClone(original),
            id: newId,
            name: `${original.name ?? 'Page'} Copy`,
            root,
            layers,
        };

        set((state) => ({
            screens: [...state.screens, copy],
            activeScreenId: newId,
            activeScreen: copy,
            selectedIds: [],
        }));
    },

    updateScreenRoot: (id, nextRoot) =>
        set((state) => {
            let changed = false;
            const screens = state.screens.map((screen) => {
                if (screen.id !== id) return screen;
                const rootValue = typeof nextRoot === 'function' ? nextRoot(screen.root) : nextRoot;
                if (rootValue === undefined) return screen;
                changed = true;
                applyAutoLayout(rootValue);
                return {
                    ...screen,
                    root: rootValue,
                    layers: extractLayers(rootValue),
                };
            });
            if (!changed) return undefined;
            return {
                screens,
                activeScreen: computeActiveScreen(screens, state.activeScreenId),
            };
        }),

    addLayer: (layer) => {
        const activeScreenId = get().activeScreenId;
        if (!activeScreenId) return;
        const layerId = layer?.id ?? generateId();
        const type = layer?.type ?? 'rect';
        const frame = {
            x: layer?.x ?? layer?.frame?.x ?? 100,
            y: layer?.y ?? layer?.frame?.y ?? 100,
            width: layer?.width ?? layer?.frame?.width ?? 160,
            height: layer?.height ?? layer?.frame?.height ?? 120,
        };

        set((state) => {
            let updatedScreen = null;
            const screens = state.screens.map((screen) => {
                if (screen.id !== state.activeScreenId) return screen;

                const root = deepClone(screen.root ?? { id: generateId(), type: 'root', children: [] });
                if (!Array.isArray(root.children)) root.children = [];

                const node = createNode(type, {
                    frame,
                    props: {
                        ...(layer?.props ?? {}),
                        fill: layer?.fill ?? layer?.props?.fill,
                        text: layer?.text ?? layer?.props?.text,
                        fontSize: layer?.fontSize ?? layer?.props?.fontSize,
                        color: layer?.color ?? layer?.props?.color,
                        src: layer?.src ?? layer?.props?.src,
                    },
                    layout: layer?.layout ?? null,
                    constraints: layer?.constraints ?? null,
                });
                node.id = layerId;
                node.visible = layer?.visible ?? true;
                node.locked = layer?.locked ?? false;
                node.name = layer?.name ?? node.props?.name ?? node.type;

                root.children = [...root.children, node];
                applyAutoLayout(root);
                recalcRootBounds(root);
                const layers = extractLayers(root);
                updatedScreen = { ...screen, root, layers };
                return updatedScreen;
            });

            if (!updatedScreen) return undefined;

            return {
                screens,
                selectedIds: [layerId],
                activeScreen: updatedScreen,
            };
        });
    },

    updateLayer: (id, updates = {}) =>
        set((state) => {
            if (!state.activeScreenId) return undefined;
            let updatedScreen = null;

            const screens = state.screens.map((screen) => {
                if (screen.id !== state.activeScreenId) return screen;

                let layerChanged = false;
                const layers = (screen.layers ?? []).map((layer) => {
                    if (layer.id !== id) return layer;
                    layerChanged = true;

                    const nextFrame = {
                        ...(layer.frame ?? {
                            x: layer.x ?? 0,
                            y: layer.y ?? 0,
                            width: layer.width ?? 120,
                            height: layer.height ?? 120,
                        }),
                        x: updates.x ?? layer.x ?? layer.frame?.x ?? 0,
                        y: updates.y ?? layer.y ?? layer.frame?.y ?? 0,
                        width: updates.width ?? layer.width ?? layer.frame?.width ?? 120,
                        height: updates.height ?? layer.height ?? layer.frame?.height ?? 120,
                    };

                    const nextProps = {
                        ...(layer.props ?? {}),
                    };
                    if (updates.text !== undefined) nextProps.text = updates.text;
                    if (updates.fontSize !== undefined) nextProps.fontSize = updates.fontSize;
                    if (updates.fill !== undefined) nextProps.fill = updates.fill;
                    if (updates.color !== undefined) nextProps.color = updates.color;

                    const fillValue = updates.fill ?? layer.fill;
                    const colorValue = updates.fill ?? updates.color ?? layer.color;
                    const nextLayout = updates.layout !== undefined ? updates.layout : layer.layout;
                    const nextConstraints = updates.constraints !== undefined ? updates.constraints : layer.constraints;

                    return {
                        ...layer,
                        ...(Object.prototype.hasOwnProperty.call(updates, 'name')
                            ? { name: updates.name ?? layer.name }
                            : {}),
                        frame: nextFrame,
                        x: nextFrame.x,
                        y: nextFrame.y,
                        width: nextFrame.width,
                        height: nextFrame.height,
                        fill: fillValue,
                        color: colorValue,
                        text: updates.text ?? layer.text,
                        fontSize: updates.fontSize ?? layer.fontSize,
                        props: nextProps,
                        opacity: updates.opacity ?? layer.opacity ?? 1,
                        angle: updates.angle ?? layer.angle ?? 0,
                        visible: updates.visible ?? layer.visible ?? true,
                        locked: updates.locked ?? layer.locked ?? false,
                        layout: nextLayout,
                        constraints: nextConstraints,
                    };
                });

                if (!layerChanged) return screen;

                const root = deepClone(screen.root);
                const target = findNode(root, id);
                if (target) {
                    const frame = target.frame ?? { x: 0, y: 0, width: 120, height: 120 };
                    target.frame = {
                        ...frame,
                        x: updates.x ?? frame.x,
                        y: updates.y ?? frame.y,
                        width: updates.width ?? frame.width,
                        height: updates.height ?? frame.height,
                    };
                    if (!target.props) target.props = {};
                    if (updates.text !== undefined) target.props.text = updates.text;
                    if (updates.fontSize !== undefined) target.props.fontSize = updates.fontSize;
                    if (updates.fill !== undefined) target.props.fill = updates.fill;
                    if (updates.color !== undefined) target.props.color = updates.color;
                    if (updates.opacity !== undefined) target.opacity = updates.opacity;
                    if (updates.angle !== undefined) target.angle = updates.angle;
                    if (updates.visible !== undefined) target.visible = updates.visible;
                    if (updates.locked !== undefined) target.locked = updates.locked;
                    if (updates.name !== undefined) target.name = updates.name;
                    if (updates.layout !== undefined) target.layout = updates.layout;
                    if (updates.constraints !== undefined) target.constraints = updates.constraints;
                }

                applyAutoLayout(root);
                recalcRootBounds(root);
                const recalculatedLayers = extractLayers(root);
                updatedScreen = { ...screen, layers: recalculatedLayers, root };
                return updatedScreen;
            });

            if (!updatedScreen) return undefined;

            return {
                screens,
                activeScreen: updatedScreen,
            };
        }),

    getActiveScreen: () => get().activeScreen,

    selectScreen: (id) =>
        set((state) => ({
            activeScreenId: id,
            activeScreen: computeActiveScreen(state.screens, id),
            selectedIds: [],
        })),

    setSelectedIds: (ids = []) => set({ selectedIds: Array.isArray(ids) ? ids : [] }),
    setTitle: (title) => set({ title }),

    updateRootLayout: (changes = {}) =>
        set((state) => {
            if (!state.activeScreenId) return undefined;
            const screens = state.screens.map((screen) => {
                if (screen.id !== state.activeScreenId) return screen;
                const root = deepClone(screen.root ?? { id: 'root', type: 'root', children: [] });
                root.layout = { ...DEFAULT_LAYOUT, ...(root.layout ?? {}), ...changes };
                applyAutoLayout(root);
                recalcRootBounds(root);
                const layers = extractLayers(root);
                return { ...screen, root, layers };
            });
            return {
                screens,
                activeScreen: computeActiveScreen(screens, state.activeScreenId),
            };
        }),

    hydrateCanvasNodes: (screenId, nodes = []) =>
        set((state) => {
            if (!screenId) return undefined;
            const index = state.screens.findIndex((screen) => screen.id === screenId);
            if (index === -1) return undefined;

            const layers = nodes.map(canvasNodeToLayer).filter(Boolean);
            const targetScreen = state.screens[index];
            const root = buildRootFromLayers(targetScreen?.root, layers);
            const updatedScreen = {
                ...targetScreen,
                layers,
                root,
            };

            const screens = state.screens.map((screen, idx) => (idx === index ? updatedScreen : screen));
            return {
                screens,
                activeScreen: computeActiveScreen(screens, state.activeScreenId),
            };
        }),
}));
