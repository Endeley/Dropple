'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import {
    Box,
    Boxes,
    CheckCircle2,
    ChevronDown,
    Circle,
    Eye,
    EyeOff,
    Copy,
    Download,
    Image as ImageIcon,
    Info,
    LayoutTemplate,
    ArrowDown,
    ArrowUp,
    Layers as LayersIcon,
    MessageCircle,
    Move,
    PenTool,
    PlusCircle,
    Pointer,
    RefreshCw,
    Save,
    Shapes as ShapesIcon,
    SlidersHorizontal,
    Sparkles,
    Square,
    Lock,
    Unlock,
    Trash2,
    Type,
    Upload,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

import { FabricCanvasAdapter } from '../../../lib/editor/fabricAdapter';
import { api } from '../../../convex/_generated/api';

const FABRIC_HEIGHT_OFFSET = 200;
const ARTBOARD_SCALE = 0.8;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getVisibleCanvasSize = (dimensions) => {
    const visibleWidth = Math.max(120, Math.round((dimensions?.width ?? 1080) * ARTBOARD_SCALE));
    const visibleHeight = Math.max(120, Math.round(((dimensions?.height ?? 1080) - FABRIC_HEIGHT_OFFSET) * ARTBOARD_SCALE));
    return { visibleWidth, visibleHeight };
};

const TOOLBAR_ITEMS = [
    { id: 'select', icon: Pointer, label: 'Select' },
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'add', icon: PlusCircle, label: 'Add Elements', action: 'rect' },
    { id: 'text', icon: Type, label: 'Text', action: 'text' },
    { id: 'image', icon: ImageIcon, label: 'Images', action: 'image' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates', action: 'template' },
    { id: 'upload', icon: Upload, label: 'Upload Image', action: 'upload' },
    { id: 'ai-tools', icon: Sparkles, label: 'AI Tools' },
    { id: 'shapes', icon: ShapesIcon, label: 'Shapes', action: 'rect' },
    { id: 'draw', icon: PenTool, label: 'Draw', action: 'circle' },
    { id: 'elements', icon: Boxes, label: 'Elements', action: 'image' },
    { id: 'layers', icon: LayersIcon, label: 'Layers' },
    { id: 'settings', icon: SlidersHorizontal, label: 'Settings' },
];

const PROPERTY_TABS = ['Properties', 'Layers', 'Variables'];

const CANVAS_PRESET_OPTIONS = [
    { id: 'instagram', label: 'Instagram Post', width: 1080, height: 1080 },
    { id: 'story', label: 'Instagram Story', width: 1080, height: 1920 },
    { id: 'poster', label: 'Poster', width: 1200, height: 1500 },
    { id: 'a4', label: 'A4 Portrait', width: 1240, height: 1754 },
];

const DEFAULT_VARIABLES = {
    colors: {
        primary: '#4338CA',
        accent: '#0EA5E9',
        highlight: '#FBBF24',
        neutral: '#111827',
    },
    textStyles: {
        heading: {
            fontFamily: 'Inter',
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: 0,
        },
        subheading: {
            fontFamily: 'Inter',
            fontSize: 42,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: 0,
        },
        body: {
            fontFamily: 'Inter',
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: 0,
        },
    },
    tokens: {
        radius: 24,
        shadow: {
            color: '#0f172a26',
            blur: 30,
            offsetX: 0,
            offsetY: 18,
            opacity: 0.22,
        },
    },
};

function normalizeVariables(raw = {}) {
    const colors = { ...DEFAULT_VARIABLES.colors };
    if (Array.isArray(raw.brandColors)) {
        raw.brandColors.forEach((color, index) => {
            if (typeof color === 'string') {
                colors[`brand${index + 1}`] = color;
            }
        });
    }
    if (raw.colors && typeof raw.colors === 'object') {
        Object.entries(raw.colors).forEach(([key, value]) => {
            if (typeof value === 'string') {
                colors[key] = value;
            }
        });
    }

    const textStyles = { ...DEFAULT_VARIABLES.textStyles };
    if (raw.textStyles && typeof raw.textStyles === 'object') {
        Object.entries(raw.textStyles).forEach(([key, value]) => {
            if (value && typeof value === 'object') {
                textStyles[key] = {
                    ...textStyles[key] ?? DEFAULT_VARIABLES.textStyles.body,
                    ...value,
                };
            }
        });
    }

    const tokens = {
        radius: typeof raw.tokens?.radius === 'number' ? raw.tokens.radius : DEFAULT_VARIABLES.tokens.radius,
        shadow: {
            ...DEFAULT_VARIABLES.tokens.shadow,
            ...(raw.tokens?.shadow ?? {}),
        },
    };

    return { colors, textStyles, tokens };
}

function mergeVariables(prev, updates = {}) {
    const next = { ...prev };
    if (Array.isArray(updates.brandColors)) {
        updates.brandColors.forEach((color, index) => {
            if (typeof color === 'string') {
                next.colors[`brand${index + 1}`] = color;
            }
        });
    }
    if (updates.colors) {
        Object.entries(updates.colors).forEach(([key, value]) => {
            if (typeof value === 'string') {
                next.colors[key] = value;
            }
        });
    }
    if (updates.textStyles) {
        Object.entries(updates.textStyles).forEach(([key, value]) => {
            if (value && typeof value === 'object') {
                next.textStyles[key] = {
                    ...(next.textStyles[key] ?? DEFAULT_VARIABLES.textStyles.body),
                    ...value,
                };
            }
        });
    }
    if (updates.tokens) {
        if (typeof updates.tokens.radius === 'number') {
            next.tokens.radius = updates.tokens.radius;
        }
        if (updates.tokens.shadow) {
            next.tokens.shadow = {
                ...next.tokens.shadow,
                ...updates.tokens.shadow,
            };
        }
    }
    return normalizeVariables(next);
}

function toTitleCase(value = '') {
    return value
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resizeCanvas(canvas, size) {
    const { visibleWidth, visibleHeight } = getVisibleCanvasSize(size);
    canvas.setWidth(visibleWidth);
    canvas.setHeight(visibleHeight);
    canvas.renderAll();
}

async function loadLegacyTemplate(canvas, data, fabric) {
    if (!data || !fabric) return;
    canvas.clear();
    if (data.canvas) {
        resizeCanvas(canvas, data.canvas);
    }
    if (data.background) {
        canvas.backgroundColor = data.background;
        canvas.renderAll();
    }
    const loaders = (data.elements ?? []).map((el) => {
        switch (el.type) {
            case 'rect':
                canvas.add(
                    new fabric.Rect({
                        left: el.position.x,
                        top: el.position.y,
                        width: el.size.width,
                        height: el.size.height,
                        fill: el.fill?.color ?? '#000',
                        angle: el.rotation ?? 0,
                        opacity: el.opacity ?? 1,
                        rx: el.radius ?? 0,
                        ry: el.radius ?? 0,
                    })
                );
                return null;
            case 'text':
                canvas.add(
                    new fabric.IText(el.text ?? 'Text', {
                        left: el.position.x,
                        top: el.position.y,
                        fontFamily: el.fontFamily ?? 'Inter',
                        fontSize: el.fontSize ?? 48,
                        fontWeight: el.fontWeight,
                        textAlign: el.textAlign ?? 'left',
                        fill: el.color ?? el.fill?.color ?? '#111827',
                        angle: el.rotation ?? 0,
                        opacity: el.opacity ?? 1,
                    })
                );
                return null;
            case 'image':
                return new Promise((resolve) => {
                    fabric.Image.fromURL(
                        el.src,
                        (img) => {
                            if (!img) return resolve(null);
                            img.set({
                                left: el.position.x,
                                top: el.position.y,
                                angle: el.rotation ?? 0,
                                opacity: el.opacity ?? 1,
                            });
                            if (el.size) {
                                img.scaleToWidth(el.size.width);
                                img.scaleToHeight(el.size.height);
                            }
                            canvas.add(img);
                            resolve(null);
                        },
                        { crossOrigin: 'anonymous' }
                    );
                });
            default:
                return null;
        }
    });
    const waiters = loaders.filter(Boolean);
    if (waiters.length) {
        await Promise.all(waiters);
    }
    canvas.renderAll();
}

const TabButton = ({ tab, activeTab, onSelect }) => (
    <button
        type='button'
        onClick={() => onSelect(tab)}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === tab ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
        {tab}
    </button>
);

const ToolSidebarButton = ({ icon: Icon, label, active, onClick }) => (
    <button
        type='button'
        onClick={onClick}
        className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${active ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'}`}>
        <Icon className='h-5 w-5' />
        <span className='leading-none'>{label}</span>
    </button>
);

const Field = ({ label, value, onChange, type = 'number', min }) => (
    <label className='flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
        <span>{label}</span>
        <input
            type={type}
            value={value ?? ''}
            min={min}
            onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
            className='w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
        />
    </label>
);

const SliderField = ({ label, min, max, step, value, onChange }) => (
    <label className='flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
        <span>{label}</span>
        <input type='range' min={min} max={max} step={step} value={value ?? 0} onChange={(event) => onChange(Number(event.target.value))} className='w-full accent-indigo-500' />
    </label>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
    <label className='flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
        <span>{label}</span>
        <input
            type='text'
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className='w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
        />
    </label>
);

const cloneLayer = (layer) => {
    if (typeof structuredClone === 'function') {
        return structuredClone(layer);
    }
    return JSON.parse(JSON.stringify(layer));
};

export default function EditorPage({ params }) {
    const { designId: rawDesignId } = use(params);
    const designId = typeof rawDesignId === 'string' ? decodeURIComponent(rawDesignId) : '';
    // Convex document IDs are long base-62 strings; guard to avoid querying with friendly slugs like "canvas".
    const isValidDesignId = typeof designId === 'string' && /^[0-9A-Za-z_-]{20,}$/.test(designId);
    const shouldQueryDesign = isValidDesignId;

    const design = useQuery(api.designs.getById, shouldQueryDesign ? { id: designId } : 'skip');
    const templateLibrary = useQuery(api.templateBrowser.listPopular, { limit: 12 });
    const saveDesign = useMutation(api.designs.saveData);

    const canvasRef = useRef(null);
    const adapterRef = useRef(null);
    const elementRef = useRef(null);
    const currentArtboardIdRef = useRef(null);
    const isLoadingRef = useRef(false);
    const fabricRef = useRef(null);
    const drawBrushRef = useRef(null);
    const drawSettingsRef = useRef(null);

    const [artboards, setArtboards] = useState([]);
    const [defaultArtboardId, setDefaultArtboardId] = useState(null);
    const [variablesState, internalSetVariables] = useState(() => normalizeVariables());
    const variables = variablesState;
    const [selectedLayerIds, setSelectedLayerIds] = useState([]);
    const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [activeTool, setActiveTool] = useState('select');
    const [libraryPanel, setLibraryPanel] = useState(null);
    const [activeTab, setActiveTab] = useState('Properties');
    const [autoSaveStatus, setAutoSaveStatus] = useState('Saved');
    const [zoom, setZoom] = useState(1);
    const [selectedPresetId, setSelectedPresetId] = useState('custom');
    const [pages, setPages] = useState([{ id: 'page-1', label: 'Page 1' }]);
    const [activePageId, setActivePageId] = useState('page-1');
    const [showCanvasGrid, setShowCanvasGrid] = useState(false);
    const [canvasBackground, setCanvasBackground] = useState('#ffffff');
    const [drawSettings, setDrawSettings] = useState({
        mode: 'brush',
        color: '#111827',
        width: 8,
        opacity: 1,
        smoothing: 0.4,
    });
    const [hasEraser, setHasEraser] = useState(false);
    if (!drawSettingsRef.current) {
        drawSettingsRef.current = drawSettings;
    }
    const [aiJobs, setAiJobs] = useState([]);
    const [aiStatus, setAiStatus] = useState({ action: null, state: 'idle', message: '' });
    const updateVariables = useCallback(
        (valueOrUpdater) => {
            internalSetVariables((prev) => {
                const input = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
                const normalized = normalizeVariables(input);
                const prevString = JSON.stringify(prev);
                const nextString = JSON.stringify(normalized);
                if (prevString === nextString) {
                    return prev;
                }
                adapterRef.current?.setVariables(normalized);
                const artboardId = currentArtboardIdRef.current;
                if (artboardId) {
                    setArtboards((prevBoards) =>
                        prevBoards.map((board) => {
                            if (board.id !== artboardId) return board;
                            const existing = board.variables ? JSON.stringify(board.variables) : null;
                            if (existing === nextString) {
                                return board;
                            }
                            return { ...board, variables: normalized };
                        })
                    );
                }
                return normalized;
            });
        },
        [setArtboards]
    );

    const activeArtboard = useMemo(() => {
        if (!artboards.length) return null;
        const preferred = artboards.find((board) => board.id === defaultArtboardId);
        return preferred ?? artboards[0];
    }, [artboards, defaultArtboardId]);

    const activeLayer = useMemo(() => {
        if (!activeArtboard || !selectedLayerIds.length) return null;
        return activeArtboard.layers?.find((layer) => layer.id === selectedLayerIds[0]) ?? null;
    }, [activeArtboard, selectedLayerIds]);

    const selectionMeta = useMemo(() => {
        if (!activeLayer) return null;
        const transform = activeLayer.transform ?? {};
        return {
            id: activeLayer.id,
            type: activeLayer.type,
            width: Math.round(transform.width ?? 0),
            height: Math.round(transform.height ?? 0),
            left: Math.round(transform.x ?? 0),
            top: Math.round(transform.y ?? 0),
            angle: Math.round(transform.rotation ?? 0),
            opacity: transform.opacity ?? 1,
            fill:
                activeLayer.type === 'shape'
                    ? activeLayer.fill?.color ?? '#4338CA'
                    : activeLayer.type === 'text'
                    ? activeLayer.fill ?? '#4338CA'
                    : undefined,
            text: activeLayer.type === 'text' ? activeLayer.content ?? '' : undefined,
        };
    }, [activeLayer]);
    const activeImageFilters = useMemo(() => {
        if (activeLayer?.type !== 'image') return {};
        return activeLayer.filters ?? {};
    }, [activeLayer]);
    const activeShapeStroke = useMemo(() => {
        if (activeLayer?.type !== 'shape') return null;
        return activeLayer.stroke ?? null;
    }, [activeLayer]);
    const activeShapeShadow = useMemo(() => {
        if (activeLayer?.type !== 'shape') return null;
        return activeLayer.shadow ?? null;
    }, [activeLayer]);

    const imageHasAdjustments = useMemo(
        () =>
            Object.entries(activeImageFilters).some(
                ([key, value]) => typeof value === 'number' && Math.abs(value) > (key === 'blur' ? 0 : 0.001)
            ),
        [activeImageFilters]
    );

    const isDrawToolActive = activeTool === 'draw';

    const selectionIds = useMemo(() => {
        if (selectedLayerIds.length) return selectedLayerIds;
        return activeLayer ? [activeLayer.id] : [];
    }, [selectedLayerIds, activeLayer?.id]);

    const selectionSupportsColor = useMemo(() => {
        if (!activeArtboard) return false;
        return selectionIds.some((layerId) => {
            const layer = activeArtboard.layers?.find((item) => item.id === layerId);
            return layer && (layer.type === 'shape' || layer.type === 'text');
        });
    }, [activeArtboard, selectionIds]);

    const selectionHasTextLayer = useMemo(() => {
        if (!activeArtboard) return false;
        return selectionIds.some((layerId) => {
            const layer = activeArtboard.layers?.find((item) => item.id === layerId);
            return layer?.type === 'text';
        });
    }, [activeArtboard, selectionIds]);

    const selectionHasShapeLayer = useMemo(() => {
        if (!activeArtboard) return false;
        return selectionIds.some((layerId) => {
            const layer = activeArtboard.layers?.find((item) => item.id === layerId);
            return layer?.type === 'shape';
        });
    }, [activeArtboard, selectionIds]);

    const selectionHasImageLayer = useMemo(() => {
        if (!activeArtboard) return false;
        return selectionIds.some((layerId) => {
            const layer = activeArtboard.layers?.find((item) => item.id === layerId);
            return layer?.type === 'image';
        });
    }, [activeArtboard, selectionIds]);

    const extractLayerFillColor = useCallback((layer) => {
        if (!layer) return undefined;
        if (layer.type === 'shape') {
            if (layer.fill && layer.fill.kind === 'solid') {
                return layer.fill.color;
            }
        }
        if (layer.type === 'text') {
            return typeof layer.fill === 'string' ? layer.fill : undefined;
        }
        return undefined;
    }, []);

    const activeLayerColor = useMemo(() => extractLayerFillColor(activeLayer), [activeLayer, extractLayerFillColor]);

    const visibleCanvasSize = useMemo(() => getVisibleCanvasSize(canvasSize), [canvasSize.width, canvasSize.height]);

    const gridOverlayStyle = showCanvasGrid
        ? {
              backgroundImage:
                  'linear-gradient(0deg, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
          }
        : undefined;

    const ensureFabric = useCallback(async () => {
        if (fabricRef.current) {
            return fabricRef.current;
        }
        const module = await import('fabric');
        const fabric = module.fabric ?? module;
        fabricRef.current = fabric;
        setHasEraser((prev) => prev || typeof fabric.EraserBrush === 'function');
        return fabric;
    }, []);
    useEffect(() => {
        drawSettingsRef.current = drawSettings;
    }, [drawSettings]);
    const applyDrawBrush = useCallback(() => {
        const canvas = canvasRef.current;
        const fabric = fabricRef.current;
        if (!canvas || !fabric) return;
        if (activeTool !== 'draw') {
            canvas.isDrawingMode = false;
            return;
        }
        canvas.isDrawingMode = true;
        let brush;
        if (drawSettings.mode === 'eraser' && typeof fabric.EraserBrush === 'function') {
            brush = new fabric.EraserBrush(canvas);
        } else {
            brush = new fabric.PencilBrush(canvas);
            brush.color = drawSettings.color;
        }
        brush.width = Math.max(1, drawSettings.width);
        if ('opacity' in brush) {
            brush.opacity = drawSettings.opacity;
        }
        if ('decimate' in brush && typeof brush.decimate === 'number') {
            brush.decimate = Math.max(0.01, 1 - drawSettings.smoothing);
        }
        canvas.freeDrawingBrush = brush;
        drawBrushRef.current = brush;
    }, [
        activeTool,
        drawSettings.color,
        drawSettings.mode,
        drawSettings.opacity,
        drawSettings.smoothing,
        drawSettings.width,
    ]);
    useEffect(() => {
        if (!isCanvasReady) return;
        applyDrawBrush();
    }, [applyDrawBrush, isCanvasReady]);

    useEffect(() => {
        if (!elementRef.current || canvasRef.current) {
            return () => undefined;
        }

        let disposed = false;

        const setup = async () => {
            const fabric = await ensureFabric();
            if (disposed || !fabric || !elementRef.current || canvasRef.current) {
                return;
            }
            const canvas = new fabric.Canvas(elementRef.current, {
                preserveObjectStacking: true,
                selection: true,
            });
            canvasRef.current = canvas;
            adapterRef.current = new FabricCanvasAdapter(canvas);
            resizeCanvas(canvas, canvasSize);
            canvas.backgroundColor = canvasBackground;
            canvas.on('path:created', (event) => {
                const path = event?.path;
                if (!path) return;
                const settings = drawSettingsRef.current ?? {
                    mode: 'brush',
                    color: '#111827',
                    opacity: 1,
                };
                const id = createId();
                path.set({
                    opacity: settings.opacity ?? 1,
                    data: { ...(path.get('data') ?? {}), layerId: id, shapeKind: 'path' },
                    name: nextLayerName(settings.mode === 'eraser' ? 'Erase Stroke' : 'Brush Stroke'),
                });
                if (settings.mode === 'brush') {
                    path.set('stroke', settings.color);
                    path.set('fill', settings.color);
                } else {
                    path.set('fill', undefined);
                }
                path.selectable = true;
                canvas.requestRenderAll();
                setSelectedLayerIds([id]);
            });
            canvas.renderAll();
            setIsCanvasReady(true);
        };

        void setup();

        return () => {
            disposed = true;
            const canvasInstance = canvasRef.current;
            canvasInstance?.off('path:created');
            adapterRef.current?.dispose();
            adapterRef.current = null;
            canvasRef.current = null;
        };
    }, [canvasSize.height, canvasSize.width, canvasBackground, ensureFabric]);

    useEffect(() => {
        if (!design?.data) {
            return;
        }
        const data = design.data;
        if (Array.isArray(data.artboards) && data.artboards.length) {
            setArtboards(data.artboards);
            const preferredId = data.defaultArtboardId ?? data.artboards[0].id;
            setDefaultArtboardId(preferredId);
            updateVariables(data.variables ?? {});
            const firstBoard = data.artboards.find((board) => board.id === preferredId) ?? data.artboards[0];
            if (firstBoard?.size) {
                setCanvasSize(firstBoard.size);
            }
            if (firstBoard?.background?.kind === 'color') {
                setCanvasBackground(firstBoard.background.value ?? '#ffffff');
            }
            setPages(data.artboards.map((board, idx) => ({ id: board.id, label: board.name ?? `Page ${idx + 1}` })));
            setActivePageId(preferredId);
            const matchedPreset = CANVAS_PRESET_OPTIONS.find((preset) => preset.width === firstBoard?.size?.width && preset.height === firstBoard?.size?.height);
            setSelectedPresetId(matchedPreset ? matchedPreset.id : 'custom');
        } else {
            setArtboards([]);
            setSelectedLayerIds([]);
        }
    }, [design?.data?.updatedAt, design?._id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!adapterRef.current || !canvas || !isCanvasReady) {
            return;
        }

        const run = async () => {
            const fabric = await ensureFabric();
            if (!fabric) return;

            if (!activeArtboard) {
                if (design?.data) {
                    currentArtboardIdRef.current = 'legacy';
                    if (design.data.canvas) {
                        setCanvasSize(design.data.canvas);
                        resizeCanvas(canvas, design.data.canvas);
                    }
                    await loadLegacyTemplate(canvas, design.data, fabric);
                    setSelectedLayerIds([]);
                }
                return;
            }

            isLoadingRef.current = true;
            try {
                currentArtboardIdRef.current = activeArtboard.id;
                let artboardVars = variables;
                if (activeArtboard.variables) {
                    artboardVars = mergeVariables(variables, activeArtboard.variables);
                }
                await adapterRef.current.loadArtboard(activeArtboard, artboardVars);
                if (JSON.stringify(artboardVars) !== JSON.stringify(variables)) {
                    updateVariables(artboardVars);
                }
                setCanvasSize(activeArtboard.size);
                resizeCanvas(canvas, activeArtboard.size);
                canvas.backgroundColor = activeArtboard.background?.value ?? canvasBackground;
                canvas.renderAll();
                const initialSelection =
                    activeArtboard.defaultLayerOrder?.slice(-1)[0] ?? activeArtboard.layers?.[activeArtboard.layers.length - 1]?.id;
                setSelectedLayerIds(initialSelection ? [initialSelection] : []);
            } finally {
                isLoadingRef.current = false;
            }
        };

        void run();
    }, [activeArtboard, variables, design, ensureFabric, isCanvasReady, canvasBackground, updateVariables]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleSelectionChange = () => {
            const ids = canvas
                .getActiveObjects()
                .map((obj) => {
                    const data = obj.get('data');
                    return data?.layerId;
                })
                .filter(Boolean);
            setSelectedLayerIds(ids);
        };

        const handleSelectionCleared = () => {
            setSelectedLayerIds([]);
        };

        const syncFromCanvas = () => {
            if (isLoadingRef.current || !adapterRef.current) return;
            try {
                const snapshot = adapterRef.current.snapshot();
                setArtboards((prev) =>
                    prev.map((board) =>
                        board.id === snapshot.artboardId
                            ? {
                                  ...board,
                                  size: snapshot.size,
                                  background: snapshot.background ?? board.background,
                                  layers: snapshot.layers,
                                  variables: snapshot.variables ?? board.variables,
                                  defaultLayerOrder: snapshot.layers.map((layer) => layer.id),
                              }
                            : board
                    )
                );
                if (snapshot.variables) {
                    updateVariables((prev) => mergeVariables(prev, snapshot.variables));
                }
            } catch (error) {
                console.error('Failed to sync canvas state', error);
            }
        };

        canvas.on('selection:created', handleSelectionChange);
        canvas.on('selection:updated', handleSelectionChange);
        canvas.on('selection:cleared', handleSelectionCleared);
        canvas.on('object:modified', syncFromCanvas);
        canvas.on('object:added', syncFromCanvas);
        canvas.on('object:removed', syncFromCanvas);

        return () => {
            canvas.off('selection:created', handleSelectionChange);
            canvas.off('selection:updated', handleSelectionChange);
            canvas.off('selection:cleared', handleSelectionCleared);
            canvas.off('object:modified', syncFromCanvas);
            canvas.off('object:added', syncFromCanvas);
            canvas.off('object:removed', syncFromCanvas);
        };
    }, []);

    const updateArtboardLayers = (layerId, updater) => {
        if (!activeArtboard) return;
        const targetId = layerId ?? selectedLayerIds[0];
        if (!targetId) return;
        setArtboards((prev) =>
            prev.map((board) => {
                if (board.id !== activeArtboard.id) return board;
                const layers = board.layers ?? [];
                const updatedLayers = layers.map((layer) => (layer.id === targetId ? updater(layer) : layer));
                return {
                    ...board,
                    layers: updatedLayers,
                    defaultLayerOrder: board.defaultLayerOrder ?? updatedLayers.map((layer) => layer.id),
                };
            })
        );
    };

    const updateLayerAndCanvas = (layerId, updater) => {
        if (!activeArtboard) return;
        const targetLayer = activeArtboard.layers?.find((layer) => layer.id === layerId);
        if (!targetLayer) return;
        const updatedLayer = updater(cloneLayer(targetLayer));
        updateArtboardLayers(layerId, () => updatedLayer);
        const maybePromise = adapterRef.current?.updateLayer(updatedLayer);
        if (maybePromise && typeof maybePromise.then === 'function') {
            maybePromise.catch((error) => {
                console.error('Failed to update layer on canvas', error);
            });
        }
    };

    const handleSelectLayer = (layerId) => {
        setSelectedLayerIds([layerId]);
        adapterRef.current?.selectLayers([layerId]);
    };

    const nextLayerName = (prefix) => {
        if (!activeArtboard?.layers) return `${prefix} 1`;
        const count = activeArtboard.layers.filter((layer) => (layer.name ?? '').toLowerCase().startsWith(prefix.toLowerCase())).length + 1;
        return `${prefix} ${count}`;
    };

    const ensureLayerOrder = (board, layers, newLayerId) => {
        const existingOrder = board.defaultLayerOrder ?? layers.map((layer) => layer.id);
        return existingOrder.includes(newLayerId) ? existingOrder : [...existingOrder, newLayerId];
    };

    const appendLayer = (layer) => {
        if (!activeArtboard) return;
        setArtboards((prev) =>
            prev.map((board) => {
                if (board.id !== activeArtboard.id) return board;
                const layers = [...(board.layers ?? []), layer];
                return {
                    ...board,
                    layers,
                    defaultLayerOrder: ensureLayerOrder(board, layers, layer.id),
                };
            })
        );
        setSelectedLayerIds([layer.id]);
    };

    const createId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };

    const handleAddText = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const layer = {
            id,
            type: 'text',
            name: nextLayerName('Text'),
            transform: { x: 120, y: 120, width: 320, height: 80, rotation: 0, opacity: 1 },
            content: 'Edit me',
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: 600,
            fill: '#111827',
            align: 'left',
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddRectangle = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName('Rectangle'),
            transform: { x: 160, y: 160, width: 240, height: 160, rotation: 0, opacity: 1 },
            shape: 'rect',
            fill: { kind: 'solid', color: variables.colors.primary ?? DEFAULT_VARIABLES.colors.primary },
            cornerRadius: variables.tokens.radius ?? DEFAULT_VARIABLES.tokens.radius,
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddCircle = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName('Ellipse'),
            transform: { x: 200, y: 200, width: 200, height: 200, rotation: 0, opacity: 1 },
            shape: 'ellipse',
            fill: { kind: 'solid', color: variables.colors.accent ?? DEFAULT_VARIABLES.colors.accent },
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddLine = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName('Line'),
            transform: { x: 160, y: 200, width: 320, height: 0, rotation: 0, opacity: 1 },
            shape: 'line',
            stroke: { color: variables.colors.neutral ?? DEFAULT_VARIABLES.colors.neutral, width: 4 },
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const makeRegularPolygonPoints = (sides, radius) => {
        const points = [];
        for (let i = 0; i < sides; i += 1) {
            const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
            points.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            });
        }
        return points;
    };

    const makeStarPoints = (outer, inner, points) => {
        const starPoints = [];
        const count = points * 2;
        for (let i = 0; i < count; i += 1) {
            const radius = i % 2 === 0 ? outer : inner;
            const angle = (Math.PI * i) / points - Math.PI / 2;
            starPoints.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            });
        }
        return starPoints;
    };

    const handleAddPolygon = async (sides = 5) => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const radius = 120;
        const points = makeRegularPolygonPoints(sides, radius);
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName(`Polygon`),
            transform: { x: 220, y: 220, width: radius * 2, height: radius * 2, rotation: 0, opacity: 1 },
            shape: 'polygon',
            points,
            fill: { kind: 'solid', color: variables.colors.accent ?? '#38bdf8' },
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddStar = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const points = makeStarPoints(120, 55, 5);
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName(`Star`),
            transform: { x: 260, y: 260, width: 240, height: 240, rotation: 0, opacity: 1 },
            shape: 'polygon',
            points,
            fill: { kind: 'solid', color: variables.colors.highlight ?? DEFAULT_VARIABLES.colors.highlight },
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddFrame = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName('Frame'),
            transform: { x: 160, y: 160, width: 360, height: 260, rotation: 0, opacity: 1 },
            shape: 'rect',
            fill: { kind: 'solid', color: 'rgba(255,255,255,0)' },
            stroke: { color: variables.colors.primary ?? '#6366f1', width: 8 },
            cornerRadius: variables.tokens.radius ?? 32,
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const addImageLayerFromSource = async (src) => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const layer = {
            id,
            type: 'image',
            name: nextLayerName('Image'),
            transform: { x: 120, y: 120, width: 360, height: 280, rotation: 0, opacity: 1 },
            src,
            fit: 'cover',
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddImage = async () => {
        if (typeof window === 'undefined') return;
        const url = window.prompt('Image URL');
        if (!url) return;
        await addImageLayerFromSource(url);
        setLibraryPanel('images');
    };

    const handleAddArrow = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const points = [
            { x: -20, y: -20 },
            { x: 160, y: -20 },
            { x: 160, y: -60 },
            { x: 220, y: 0 },
            { x: 160, y: 60 },
            { x: 160, y: 20 },
            { x: -20, y: 20 },
        ];
        const layer = {
            id,
            type: 'shape',
            name: nextLayerName('Arrow'),
            transform: { x: 220, y: 320, width: 240, height: 120, rotation: 0, opacity: 1 },
            shape: 'polygon',
            points,
            fill: { kind: 'solid', color: variables.colors.accent ?? '#22c55e' },
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddSticker = async (preset) => {
        const stickerMap = {
            spark: 'https://cdn.prod.website-files.com/647adc74340eba0bb02124e7/65d6b30e20f7bc057b1edef4_sparkle.png',
            heart: 'https://cdn.prod.website-files.com/647adc74340eba0bb02124e7/65d6b352fe3c504f3546607c_heart.png',
            badge: 'https://cdn.prod.website-files.com/647adc74340eba0bb02124e7/65d6b3c6565fcc721d552662_badge.png',
        };
        const src = stickerMap[preset] ?? stickerMap.spark;
        await addImageLayerFromSource(src);
    };

    const handleAddIcon = async (preset) => {
        const iconMap = {
            check: 'https://cdn.prod.website-files.com/647adc74340eba0bb02124e7/65d6b45a1f24b3e34ba96543_checkmark-icon.png',
            star: 'https://cdn.prod.website-files.com/647adc74340eba0bb02124e7/65d6b46e67b2c8b554b88a32_star-icon.png',
            bolt: 'https://cdn.prod.website-files.com/647adc74340eba0bb02124e7/65d6b4829103c65a18228efd_lightning-icon.png',
        };
        const src = iconMap[preset] ?? iconMap.check;
        await addImageLayerFromSource(src);
    };

    const handleUploadImageFile = () => {
        if (!adapterRef.current || !activeArtboard) return;
        if (typeof window === 'undefined') return;
        setLibraryPanel('images');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async () => {
            const file = fileInput.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    await addImageLayerFromSource(result);
                }
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        };
        fileInput.click();
    };

    const handleReplaceImageWithSource = async (src) => {
        if (!adapterRef.current || !activeArtboard) return;
        const targetId = selectedLayerIds[0];
        if (!targetId) return;
        updateLayerAndCanvas(targetId, (layer) => {
            if (layer.type === 'image') {
                layer.src = src;
            }
            return layer;
        });
        adapterRef.current?.selectLayers([targetId]);
    };

    const handleReplaceImageFromUpload = () => {
        if (!adapterRef.current || !activeArtboard) return;
        if (typeof window === 'undefined') return;
        const targetId = selectedLayerIds[0];
        if (!targetId) return;
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async () => {
            const file = fileInput.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    void handleReplaceImageWithSource(result);
                }
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        };
        fileInput.click();
    };

    const handleReplaceImageFromUrl = () => {
        if (typeof window === 'undefined') return;
        const targetId = selectedLayerIds[0];
        if (!targetId) return;
        const url = window.prompt('Image URL');
        if (!url) return;
        void handleReplaceImageWithSource(url);
    };

    const handleBrowseTemplates = () => {
        if (typeof window === 'undefined') return;
        const targetHref = designId ? `/templates?from=editor&design=${encodeURIComponent(designId)}` : '/templates';
        window.open(targetHref, '_blank', 'noopener');
    };

    const handleToolSelect = (toolId) => {
        setActiveTool(toolId);
        const panelByTool = {
            add: 'elements',
            elements: 'elements',
            templates: 'templates',
            text: 'text',
            shapes: 'shapes',
            layers: 'layers',
            image: 'images',
            upload: 'images',
            'ai-tools': 'ai-tools',
        };
        const panelKey = panelByTool[toolId];
        if (panelKey) {
            setLibraryPanel((prev) => (prev === panelKey ? null : panelKey));
            if (toolId === 'upload') {
                handleUploadImageFile();
            }
            return;
        }
        setLibraryPanel(null);
        const actionMap = {
            text: handleAddText,
            rect: handleAddRectangle,
            circle: handleAddCircle,
            image: handleAddImage,
        };
        const tool = TOOLBAR_ITEMS.find((item) => item.id === toolId);
        if (tool?.action && actionMap[tool.action]) {
            actionMap[tool.action]();
        }
    };

    const handlePresetSelect = (presetId) => {
        setSelectedPresetId(presetId);
        const preset = CANVAS_PRESET_OPTIONS.find((option) => option.id === presetId);
        if (!preset) return;
        setCanvasSize({ width: preset.width, height: preset.height });
        if (canvasRef.current) {
            canvasRef.current.setWidth(preset.width);
            canvasRef.current.setHeight(preset.height);
            canvasRef.current.renderAll();
        }
        if (activeArtboard) {
            setArtboards((prev) =>
                prev.map((board) => (board.id === activeArtboard.id ? { ...board, size: { width: preset.width, height: preset.height } } : board))
            );
        }
    };

    const handleBackgroundInputChange = (value) => {
        setCanvasBackground(value);
        if (canvasRef.current) {
            canvasRef.current.backgroundColor = value;
            canvasRef.current.renderAll();
        }
        if (activeArtboard) {
            setArtboards((prev) =>
                prev.map((board) =>
                    board.id === activeArtboard.id
                        ? {
                              ...board,
                              background: { ...(board.background ?? {}), kind: 'color', value },
                          }
                        : board
                )
            );
        }
    };

    const handleZoomChange = (nextZoom) => {
        const clamped = clamp(nextZoom, 0.25, 4);
        setZoom(clamped);
        if (canvasRef.current) {
            canvasRef.current.setZoom(clamped);
            canvasRef.current.renderAll();
        }
    };

    const handleToggleGrid = () => {
        setShowCanvasGrid((prev) => !prev);
    };

    const handleAddPage = () => {
        const newId = createId();
        const newArtboard = {
            id: newId,
            name: `Page ${pages.length + 1}`,
            size: { width: canvasSize.width, height: canvasSize.height },
            background: { kind: 'color', value: canvasBackground },
            layers: [],
            defaultLayerOrder: [],
        };
        setArtboards((prev) => [...prev, newArtboard]);
        setPages((prev) => [...prev, { id: newId, label: newArtboard.name }]);
        setActivePageId(newId);
        setDefaultArtboardId(newId);
    };

    const handleDuplicatePage = () => {
        if (!activeArtboard) return;
        const newId = createId();
        const duplicated = {
            ...activeArtboard,
            id: newId,
            name: `${activeArtboard.name ?? 'Page'} Copy`,
            layers: [],
            defaultLayerOrder: [],
        };
        setArtboards((prev) => [...prev, duplicated]);
        setPages((prev) => [...prev, { id: newId, label: duplicated.name ?? 'Page Copy' }]);
        setActivePageId(newId);
        setDefaultArtboardId(newId);
    };

    const handleRemovePage = () => {
        if (artboards.length <= 1 || !activeArtboard) return;
        setArtboards((prev) => prev.filter((board) => board.id !== activeArtboard.id));
        setPages((prev) => prev.filter((page) => page.id !== activeArtboard.id));
        setActivePageId((prev) => {
            if (prev === activeArtboard.id) {
                const fallback = artboards.find((board) => board.id !== activeArtboard.id);
                if (fallback) {
                    setDefaultArtboardId(fallback.id);
                    return fallback.id;
                }
            }
            return prev;
        });
    };

    const handleSelectPage = (pageId) => {
        setActivePageId(pageId);
        setDefaultArtboardId(pageId);
    };

    const handleShareDesign = () => {
        if (typeof window !== 'undefined') {
            window.alert('Share functionality coming soon.');
        }
    };

    const handleExportDesign = () => {
        if (typeof window !== 'undefined') {
            window.alert('Export functionality coming soon.');
        }
    };

    const handleSave = async () => {
        if (!designId) return;
        setAutoSaveStatus('Saving…');
        const now = Date.now();
        let nextArtboards = artboards;

        if (adapterRef.current && currentArtboardIdRef.current) {
            try {
                const snapshot = adapterRef.current.snapshot();
                nextArtboards = artboards.map((board) =>
                    board.id === snapshot.artboardId
                        ? {
                              ...board,
                              size: snapshot.size,
                              background: snapshot.background ?? board.background,
                              layers: snapshot.layers,
                              variables: snapshot.variables ?? board.variables,
                              defaultLayerOrder: snapshot.layers.map((layer) => layer.id),
                          }
                        : board
                );
                if (snapshot.variables) {
                    updateVariables((prev) => mergeVariables(prev, snapshot.variables));
                }
                setArtboards(nextArtboards);
            } catch (error) {
                console.error('Failed to capture snapshot before saving', error);
            }
        }

        const payload = {
            ...(design?.data ?? {}),
            artboards: nextArtboards,
            defaultArtboardId: defaultArtboardId ?? currentArtboardIdRef.current ?? nextArtboards[0]?.id,
            variables,
            canvas: canvasSize,
            fabric: canvasRef.current?.toJSON(),
            designId,
            updatedAt: now,
        };

        await saveDesign({ id: designId, data: payload });
        setAutoSaveStatus('Saved');
    };

    const handleDrawColorChange = (color) => {
        setDrawSettings((prev) => ({ ...prev, color }));
    };

    const handleDrawWidthChange = (value) => {
        setDrawSettings((prev) => ({ ...prev, width: Math.max(1, value) }));
    };

    const handleDrawOpacityChange = (value) => {
        setDrawSettings((prev) => ({ ...prev, opacity: clamp(value, 0.05, 1) }));
    };

    const handleDrawSmoothingChange = (value) => {
        setDrawSettings((prev) => ({ ...prev, smoothing: clamp(value, 0, 0.95) }));
    };

    const handleDrawModeChange = (mode) => {
        if (mode === 'eraser' && !hasEraser) {
            setDrawSettings((prev) => ({ ...prev, mode: 'brush' }));
            return;
        }
        setDrawSettings((prev) => ({ ...prev, mode }));
    };

    const simulateAiProcessing = useCallback((action, payload) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                switch (action) {
                    case 'remove-bg': {
                        const src = typeof payload?.src === 'string' ? payload.src : '';
                        const suffix = src.includes('?') ? '&' : '?';
                        resolve({ src: `${src}${suffix}bgRemoved=${Date.now()}` });
                        break;
                    }
                    case 'enhance': {
                        const src = typeof payload?.src === 'string' ? payload.src : '';
                        const suffix = src.includes('?') ? '&' : '?';
                        resolve({ src: `${src}${suffix}enhanced=${Date.now()}` });
                        break;
                    }
                    default:
                        resolve({});
                }
            }, 1400 + Math.random() * 600);
        });
    }, []);

    const appendAiJob = (job) => {
        setAiJobs((prev) => [job, ...prev].slice(0, 10));
    };

    const updateAiJob = (jobId, updates) => {
        setAiJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job)));
    };

    const handleAiBackgroundRemove = async () => {
        if (!activeLayer || activeLayer.type !== 'image') {
            setAiStatus({ action: 'remove-bg', state: 'error', message: 'Select an image layer before running background remover.' });
            return;
        }

        const layerId = activeLayer.id;
        const jobId = createId();
        setAiStatus({ action: 'remove-bg', state: 'processing', message: 'Removing background…' });
        appendAiJob({
            id: jobId,
            action: 'remove-bg',
            layerId,
            status: 'processing',
            startedAt: Date.now(),
        });

        try {
            const result = await simulateAiProcessing('remove-bg', { src: activeLayer.src });
            if (result?.src) {
                await handleReplaceImageWithSource(result.src);
            }
            updateAiJob(jobId, { status: 'completed', completedAt: Date.now(), resultSrc: result?.src ?? null });
            setAiStatus({ action: 'remove-bg', state: 'success', message: 'Background removed (preview).' });
        } catch (error) {
            updateAiJob(jobId, { status: 'failed', error: error?.message ?? 'Unknown error' });
            setAiStatus({ action: 'remove-bg', state: 'error', message: error?.message ?? 'Background removal failed.' });
        }
    };

    const handleAiEnhance = async () => {
        if (!activeLayer || activeLayer.type !== 'image') {
            setAiStatus({ action: 'enhance', state: 'error', message: 'Select an image layer before enhancing.' });
            return;
        }

        const layerId = activeLayer.id;
        const jobId = createId();
        setAiStatus({ action: 'enhance', state: 'processing', message: 'Enhancing image…' });
        appendAiJob({
            id: jobId,
            action: 'enhance',
            layerId,
            status: 'processing',
            startedAt: Date.now(),
        });

        try {
            const result = await simulateAiProcessing('enhance', { src: activeLayer.src });
            if (result?.src) {
                await handleReplaceImageWithSource(result.src);
            } else {
                const enhancements = {
                    brightness: Math.min(0.2, (activeLayer.filters?.brightness ?? 0) + 0.1),
                    contrast: Math.min(0.2, (activeLayer.filters?.contrast ?? 0) + 0.1),
                    saturation: Math.min(0.2, (activeLayer.filters?.saturation ?? 0) + 0.05),
                };
                updateLayerAndCanvas(layerId, (layer) => {
                    if (layer.type === 'image') {
                        layer.filters = { ...(layer.filters ?? {}), ...enhancements };
                    }
                    return layer;
                });
            }
            updateAiJob(jobId, { status: 'completed', completedAt: Date.now(), resultSrc: result?.src ?? null });
            setAiStatus({ action: 'enhance', state: 'success', message: 'Image enhanced (preview).' });
        } catch (error) {
            updateAiJob(jobId, { status: 'failed', error: error?.message ?? 'Unknown error' });
            setAiStatus({ action: 'enhance', state: 'error', message: error?.message ?? 'Enhancement failed.' });
        }
    };

    const handleAiMagicFill = () => {
        setAiStatus({ action: 'magic-fill', state: 'info', message: 'Magic Fill is in progress.' });
    };

    const handleAiGenerateImage = () => {
        setAiStatus({ action: 'generate', state: 'info', message: 'Image generation coming soon.' });
    };

    const handleLayerPositionChange = (axis, value) => {
        if (!activeLayer) return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            if (axis === 'align') {
                layer.align = value;
            } else {
                layer.transform = { ...layer.transform, [axis]: value };
            }
            return layer;
        });
    };

    const handleLayerSizeChange = (dimension, value) => {
        if (!activeLayer) return;
        const nextValue = Math.max(1, value);
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.transform = { ...layer.transform, [dimension]: nextValue };
            return layer;
        });
    };

    const handleLayerNameChange = (value) => {
        if (!activeLayer) return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.name = value;
            return layer;
        });
    };

    const handleFillChange = (color) => {
        if (!activeLayer) return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            if (layer.type === 'shape') {
                layer.fill = { kind: 'solid', color };
            } else if (layer.type === 'text') {
                layer.fill = color;
            }
            return layer;
        });
    };

    const handleTextChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'text') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.content = value;
            return layer;
        });
    };

    const handleFontSizeChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'text') return;
        const nextValue = Math.max(6, value);
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.fontSize = nextValue;
            layer.transform = { ...layer.transform, height: Math.max(layer.transform.height, nextValue * 1.2) };
            return layer;
        });
    };

    const handleLayerRotationChange = (value) => {
        if (!activeLayer) return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.transform = { ...layer.transform, rotation: value };
            return layer;
        });
    };

    const handleOpacityChange = (value) => {
        if (!activeLayer) return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.transform = { ...layer.transform, opacity: value };
            return layer;
        });
    };

    const handleLetterSpacingChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'text') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.letterSpacing = value;
            return layer;
        });
    };

    const handleLineHeightChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'text') return;
        const nextValue = Math.max(0.5, value);
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.lineHeight = nextValue;
            return layer;
        });
    };

    const handleImageUrlChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'image') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.src = value;
            return layer;
        });
    };

    const handleImageAdjustmentChange = (key, rawValue) => {
        if (!activeLayer || activeLayer.type !== 'image') return;
        const value = key === 'blur' ? Math.max(0, rawValue) : rawValue;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            const nextFilters = { ...(layer.filters ?? {}) };
            if (Math.abs(value) < 0.0001) {
                delete nextFilters[key];
            } else {
                nextFilters[key] = value;
            }
            layer.filters = nextFilters;
            return layer;
        });
    };

    const handleImageResetAdjustments = () => {
        if (!activeLayer || activeLayer.type !== 'image') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.filters = {};
            return layer;
        });
    };

    const handleCornerRadiusChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'shape') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.cornerRadius = Math.max(0, value);
            layer.transform = {
                ...layer.transform,
                rx: Math.max(0, value),
                ry: Math.max(0, value),
            };
            return layer;
        });
    };

    const getCanvasObjectByLayerId = (layerId) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas
            .getObjects()
            .find((object) => {
                const data = object.get?.('data');
                return data?.layerId === layerId;
            }) ?? null;
    };

    const applyToSelection = (mutator) => {
        if (!selectionIds.length) return;
        selectionIds.forEach((layerId) => {
            updateLayerAndCanvas(layerId, (layer) => {
                mutator(layer);
                return layer;
            });
        });
    };

    const handleColorVariableChange = (key, value) => {
        updateVariables((prev) => ({
            ...prev,
            colors: { ...prev.colors, [key]: value },
        }));
    };

    const handleApplyColorVariable = (key) => {
        const color = variables.colors[key];
        if (!color || !selectionSupportsColor) return;
        applyToSelection((layer) => {
            if (layer.type === 'shape') {
                layer.fill = { kind: 'solid', color };
            } else if (layer.type === 'text') {
                layer.fill = color;
            }
        });
    };

    const handleUpdateColorVariable = (key) => {
        if (!activeLayerColor) return;
        updateVariables((prev) => ({
            ...prev,
            colors: { ...prev.colors, [key]: activeLayerColor },
        }));
    };

    const handleApplyTextStyle = (key) => {
        const style = variables.textStyles[key];
        if (!style || !selectionHasTextLayer) return;
        applyToSelection((layer) => {
            if (layer.type !== 'text') return;
            layer.fontFamily = style.fontFamily ?? layer.fontFamily;
            layer.fontSize = style.fontSize ?? layer.fontSize;
            layer.fontWeight = style.fontWeight ?? layer.fontWeight;
            layer.lineHeight = style.lineHeight ?? layer.lineHeight;
            layer.letterSpacing = style.letterSpacing ?? layer.letterSpacing;
            layer.transform = {
                ...layer.transform,
                height: Math.max(layer.transform.height, (style.fontSize ?? layer.fontSize ?? 24) * 1.8),
            };
        });
    };

    const handleUpdateTextStyle = (key) => {
        if (!activeLayer || activeLayer.type !== 'text') return;
        updateVariables((prev) => ({
            ...prev,
            textStyles: {
                ...prev.textStyles,
                [key]: {
                    fontFamily: activeLayer.fontFamily ?? prev.textStyles[key]?.fontFamily ?? DEFAULT_VARIABLES.textStyles.body.fontFamily,
                    fontSize: activeLayer.fontSize ?? prev.textStyles[key]?.fontSize ?? DEFAULT_VARIABLES.textStyles.body.fontSize,
                    fontWeight: activeLayer.fontWeight ?? prev.textStyles[key]?.fontWeight ?? DEFAULT_VARIABLES.textStyles.body.fontWeight,
                    lineHeight: activeLayer.lineHeight ?? prev.textStyles[key]?.lineHeight ?? DEFAULT_VARIABLES.textStyles.body.lineHeight,
                    letterSpacing: activeLayer.letterSpacing ?? prev.textStyles[key]?.letterSpacing ?? DEFAULT_VARIABLES.textStyles.body.letterSpacing,
                },
            },
        }));
    };

    const handleApplyRadiusToken = () => {
        if (!selectionHasShapeLayer) return;
        const radius = variables.tokens.radius ?? DEFAULT_VARIABLES.tokens.radius;
        applyToSelection((layer) => {
            if (layer.type !== 'shape') return;
            layer.cornerRadius = radius;
            layer.transform = { ...layer.transform, rx: radius, ry: radius };
        });
    };

    const handleUpdateRadiusToken = () => {
        if (!activeLayer || activeLayer.type !== 'shape') return;
        let radiusValue = 0;
        if (typeof activeLayer.cornerRadius === 'number') {
            radiusValue = activeLayer.cornerRadius;
        } else if (activeLayer.cornerRadius && typeof activeLayer.cornerRadius === 'object') {
            radiusValue =
                activeLayer.cornerRadius.tl ??
                activeLayer.cornerRadius.tr ??
                activeLayer.cornerRadius.br ??
                activeLayer.cornerRadius.bl ??
                0;
        }
        updateVariables((prev) => ({
            ...prev,
            tokens: { ...prev.tokens, radius: Math.max(0, radiusValue) },
        }));
    };

    const handleApplyShadowToken = () => {
        if (!selectionHasShapeLayer) return;
        const shadow = variables.tokens.shadow ?? DEFAULT_VARIABLES.tokens.shadow;
        applyToSelection((layer) => {
            if (layer.type !== 'shape') return;
            layer.shadow = { ...shadow };
        });
    };

    const handleUpdateShadowToken = () => {
        if (!activeLayer || activeLayer.type !== 'shape' || !activeLayer.shadow) return;
        updateVariables((prev) => ({
            ...prev,
            tokens: {
                ...prev.tokens,
                shadow: { ...prev.tokens.shadow, ...activeLayer.shadow },
            },
        }));
    };

    const handleTokenRadiusValueChange = (value) => {
        updateVariables((prev) => ({
            ...prev,
            tokens: { ...prev.tokens, radius: Math.max(0, value ?? 0) },
        }));
    };

    const handleTokenShadowValueChange = (key, value) => {
        updateVariables((prev) => ({
            ...prev,
            tokens: {
                ...prev.tokens,
                shadow: { ...prev.tokens.shadow, [key]: value },
            },
        }));
    };

    const handleShapeStrokeWidthChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'shape') return;
        const width = Math.max(0, value);
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            const nextStroke = { ...(layer.stroke ?? { color: '#0f172a', width: 0 }) };
            nextStroke.width = width;
            layer.stroke = width > 0 ? nextStroke : undefined;
            return layer;
        });
    };

    const handleShapeStrokeColorChange = (color) => {
        if (!activeLayer || activeLayer.type !== 'shape') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            const nextStroke = { ...(layer.stroke ?? { width: 2 }) };
            nextStroke.color = color;
            nextStroke.width = nextStroke.width ?? 2;
            layer.stroke = nextStroke;
            return layer;
        });
    };

    const handleShapeShadowToggle = () => {
        if (!activeLayer || activeLayer.type !== 'shape') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            if (layer.shadow) {
                layer.shadow = undefined;
            } else {
                layer.shadow = { ...variables.tokens.shadow };
            }
            return layer;
        });
    };

    const handleShapeShadowChange = (key, value) => {
        if (!activeLayer || activeLayer.type !== 'shape') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            const baseShadow = layer.shadow ?? { ...variables.tokens.shadow };
            layer.shadow = { ...baseShadow, [key]: value };
            return layer;
        });
    };

    const handleToggleLayerVisibility = (layerId) => {
        updateLayerAndCanvas(layerId, (layer) => {
            layer.visible = !(layer.visible ?? true);
            return layer;
        });
        const object = getCanvasObjectByLayerId(layerId);
        if (object) {
            object.visible = !(object.visible ?? true);
            canvasRef.current?.requestRenderAll();
        }
    };

    const handleToggleLayerLock = (layerId) => {
        updateLayerAndCanvas(layerId, (layer) => {
            layer.locked = !(layer.locked ?? false);
            return layer;
        });
        const object = getCanvasObjectByLayerId(layerId);
        if (object) {
            const currentSelectable = object.selectable ?? true;
            const nextLocked = currentSelectable;
            object.selectable = !nextLocked;
            object.evented = !nextLocked;
            object.lockMovementX = nextLocked;
            object.lockMovementY = nextLocked;
            object.lockScalingX = nextLocked;
            object.lockScalingY = nextLocked;
            object.lockRotation = nextLocked;
            canvasRef.current?.requestRenderAll();
        }
    };

    const handleLayerReorder = (layerId, direction) => {
        if (!activeArtboard) return;
        let nextIndex = null;
        setArtboards((prev) =>
            prev.map((board) => {
                if (board.id !== activeArtboard.id) return board;
                const layers = [...(board.layers ?? [])];
                const currentIndex = layers.findIndex((layer) => layer.id === layerId);
                if (currentIndex === -1) return board;
                const targetIndex = clamp(
                    currentIndex + (direction === 'up' ? 1 : -1),
                    0,
                    Math.max(0, layers.length - 1)
                );
                if (targetIndex === currentIndex) return board;
                const [item] = layers.splice(currentIndex, 1);
                layers.splice(targetIndex, 0, item);
                nextIndex = targetIndex;
                return {
                    ...board,
                    layers,
                    defaultLayerOrder: layers.map((layer) => layer.id),
                };
            })
        );
        if (nextIndex !== null) {
            adapterRef.current?.reorderLayer(layerId, nextIndex);
            canvasRef.current?.requestRenderAll();
        }
    };

    if (!shouldQueryDesign) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-500'>
                <div className='max-w-md space-y-4 text-center'>
                    <p className='text-lg font-semibold text-slate-700'>Design not found</p>
                    <p className='text-sm'>Pick a design from the editor dashboard or create a new one to open the canvas.</p>
                    <Link
                        href='/editor'
                        className='inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'>
                        Return to Editor Home
                    </Link>
                </div>
            </div>
        );
    }

    const designTitle = design?.data?.title ?? design?.title ?? 'Untitled Design';
    const inspectorLayers = activeArtboard?.layers ?? [];
    const imageAssets = useMemo(() => {
        const assets = [];
        const seen = new Set();
        for (const board of artboards) {
            for (const layer of board.layers ?? []) {
                if (layer.type === 'image' && layer.src && !seen.has(layer.src)) {
                    seen.add(layer.src);
                    assets.push({ id: `${board.id}-${layer.id}`, src: layer.src });
                }
            }
        }
        return assets;
    }, [artboards]);
    const hasImageSelection = selectedLayerIds.some((id) => {
        return inspectorLayers.some((layer) => layer.id === id && layer.type === 'image');
    });
const panelTitleMap = {
    templates: 'Templates',
    elements: 'Elements',
    text: 'Text Styles',
    shapes: 'Shapes',
    layers: 'Layers',
    images: 'Images',
    'ai-tools': 'AI Tools',
};

    const closeLibraryPanel = () => setLibraryPanel(null);

    const handleAddTextPreset = async (preset) => {
        if (!adapterRef.current || !activeArtboard) return;
        const id = createId();
        const styleKey = variables.textStyles[preset] ? preset : 'body';
        const style = variables.textStyles[styleKey] ?? DEFAULT_VARIABLES.textStyles.body;
        const contentMap = {
            heading: 'Headline',
            subheading: 'Subheading',
            body: 'Start typing...',
        };
        const layer = {
            id,
            type: 'text',
            name: nextLayerName('Text'),
            transform: { x: 140, y: 160, width: 360, height: Math.max(120, style.fontSize * 2), rotation: 0, opacity: 1 },
            content: contentMap[styleKey] ?? contentMap.body,
            fontFamily: style.fontFamily ?? 'Inter',
            fontSize: style.fontSize ?? DEFAULT_VARIABLES.textStyles.body.fontSize,
            fontWeight: style.fontWeight ?? DEFAULT_VARIABLES.textStyles.body.fontWeight,
            lineHeight: style.lineHeight ?? DEFAULT_VARIABLES.textStyles.body.lineHeight,
            letterSpacing: style.letterSpacing ?? DEFAULT_VARIABLES.textStyles.body.letterSpacing,
            fill: variables.colors.neutral ?? DEFAULT_VARIABLES.colors.neutral,
            align: 'left',
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const isLibraryPanelOpen = Boolean(libraryPanel);

    const renderLibraryPanel = () => {
        if (!libraryPanel) return null;

        const commonGridClasses = 'grid grid-cols-2 gap-3';

        const templates = (templateLibrary ?? []).slice(0, 12);

        switch (libraryPanel) {
            case 'templates':
                return (
                    <div className='space-y-4'>
                        <div className={commonGridClasses}>
                            {templates.map((template) => (
                                <button
                                    key={template._id}
                                    type='button'
                                    onClick={() => handleBrowseTemplates()}
                                    className='flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md'>
                                    {template.thumbnailUrl ? (
                                        <img src={template.thumbnailUrl} alt={template.title} className='h-28 w-full bg-slate-100 object-cover' />
                                    ) : (
                                        <div className='flex h-28 w-full items-center justify-center bg-slate-100 text-xs text-slate-500'>No preview</div>
                                    )}
                                    <div className='space-y-1 p-3'>
                                        <p className='text-sm font-semibold text-slate-800'>{template.title}</p>
                                        <p className='text-[11px] uppercase tracking-wide text-slate-400'>{template.category ?? 'Template'}</p>
                                    </div>
                                </button>
                            ))}
                            {!templates.length && (
                                <div className='col-span-2 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500'>
                                    Templates will appear here when available.
                                </div>
                            )}
                        </div>
                        <button
                            type='button'
                            onClick={() => handleBrowseTemplates()}
                            className='inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600'>
                            View all templates
                        </button>
                    </div>
                );
            case 'elements': {
                const elementGroups = [
                    {
                        id: 'lines',
                        title: 'Lines & Arrows',
                        items: [
                            { id: 'line', label: 'Straight Line', description: 'Add a line divider', onSelect: handleAddLine },
                            { id: 'arrow', label: 'Arrow', description: 'Directional pointer', onSelect: handleAddArrow },
                        ],
                    },
                    {
                        id: 'shapes',
                        title: 'Basic Blocks',
                        items: [
                            { id: 'rect', label: 'Rounded Card', description: 'Add rectangular block', onSelect: handleAddRectangle },
                            { id: 'ellipse', label: 'Circle', description: 'Add ellipse accent', onSelect: handleAddCircle },
                            { id: 'polygon', label: 'Pentagon', description: 'Five-sided shape', onSelect: () => handleAddPolygon(5) },
                            { id: 'star', label: 'Star', description: 'Five point badge', onSelect: handleAddStar },
                        ],
                    },
                    {
                        id: 'frames',
                        title: 'Frames',
                        items: [
                            { id: 'frame', label: 'Rounded Frame', description: 'Hollow rounded border', onSelect: handleAddFrame },
                        ],
                    },
                    {
                        id: 'stickers',
                        title: 'Stickers',
                        items: [
                            { id: 'spark', label: 'Sparkle', description: 'Highlight sticker', onSelect: () => handleAddSticker('spark') },
                            { id: 'heart', label: 'Heart', description: 'Love reaction', onSelect: () => handleAddSticker('heart') },
                            { id: 'badge', label: 'Badge', description: 'Promo badge', onSelect: () => handleAddSticker('badge') },
                        ],
                    },
                    {
                        id: 'icons',
                        title: 'Icons',
                        items: [
                            { id: 'check', label: 'Checkmark', description: 'Success icon', onSelect: () => handleAddIcon('check') },
                            { id: 'star-icon', label: 'Star Icon', description: 'Featured icon', onSelect: () => handleAddIcon('star') },
                            { id: 'bolt', label: 'Lightning', description: 'Fast/energy icon', onSelect: () => handleAddIcon('bolt') },
                        ],
                    },
                ];
                return (
                    <div className='space-y-5'>
                        {elementGroups.map((group) => (
                            <div key={group.id} className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{group.title}</span>
                                </div>
                                <div className={commonGridClasses}>
                                    {group.items.map((item) => (
                                        <button
                                            key={item.id}
                                            type='button'
                                            onClick={() => item.onSelect?.()}
                                            className='flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:shadow-md'>
                                            <span className='text-sm font-semibold text-slate-800'>{item.label}</span>
                                            <span className='text-xs text-slate-500'>{item.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            case 'text': {
                const textStyles = [
                    { id: 'heading', title: 'Headline', subtitle: 'Bold statement text', action: () => void handleAddTextPreset('heading') },
                    { id: 'subheading', title: 'Subheading', subtitle: 'Medium weight body', action: () => void handleAddTextPreset('subheading') },
                    { id: 'body', title: 'Body Copy', subtitle: 'Paragraph styling', action: () => void handleAddTextPreset('body') },
                    { id: 'quote', title: 'Quote', subtitle: 'Stylised quote text', action: () => void handleAddTextPreset('body') },
                ];
                return (
                    <div className={commonGridClasses}>
                        {textStyles.map((style) => (
                            <button
                                key={style.id}
                                type='button'
                                onClick={() => style.action?.()}
                                className='flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:shadow-md'>
                                <span className='text-sm font-semibold text-slate-800'>{style.title}</span>
                                <span className='text-xs text-slate-500'>{style.subtitle}</span>
                            </button>
                        ))}
                    </div>
                );
            }
            case 'shapes': {
                const shapeOptions = [
                    { id: 'rect', label: 'Rectangle', action: () => void handleAddRectangle() },
                    { id: 'ellipse', label: 'Ellipse', action: () => void handleAddCircle() },
                    { id: 'line', label: 'Line', action: () => void handleAddLine() },
                    { id: 'polygon', label: 'Pentagon', action: () => void handleAddPolygon(5) },
                    { id: 'star', label: 'Star', action: () => void handleAddStar() },
                ];
                return (
                    <div className={commonGridClasses}>
                        {shapeOptions.map((shape) => (
                            <button
                                key={shape.id}
                                type='button'
                                onClick={() => shape.action?.()}
                                className='flex h-28 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:shadow-md'>
                                {shape.label}
                            </button>
                        ))}
                    </div>
                );
            }
            case 'ai-tools': {
                const removeProcessing = aiStatus.action === 'remove-bg' && aiStatus.state === 'processing';
                const enhanceProcessing = aiStatus.action === 'enhance' && aiStatus.state === 'processing';
                const recentJobs = aiJobs.slice(0, 6);
                const studioHref = designId
                    ? `/ai?from=editor&designId=${encodeURIComponent(designId)}`
                    : '/ai?from=editor';
                const renderStatusMessage = (action) =>
                    aiStatus.action === action ? (
                        <div
                            className={`rounded-lg border px-3 py-2 text-xs ${
                                aiStatus.state === 'error'
                                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                                    : aiStatus.state === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                    : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}>
                            {aiStatus.message}
                        </div>
                    ) : null;
                const jobLabel = (action) => {
                    switch (action) {
                        case 'remove-bg':
                            return 'Removed background';
                        case 'enhance':
                            return 'Enhanced image';
                        default:
                            return action;
                    }
                };
                return (
                    <div className='space-y-4'>
                        <Link
                            href={studioHref}
                            className='flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:border-indigo-400'
                        >
                            <span>Open AI Studio</span>
                            <Sparkles className='h-4 w-4' />
                        </Link>

                        <div className='space-y-3 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Background remover</span>
                                <span className={`text-[10px] uppercase ${selectionHasImageLayer ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {selectionHasImageLayer ? 'Image selected' : 'Select an image layer'}
                                </span>
                            </div>
                            <p className='text-xs text-slate-500'>Detects the subject and removes the background. Placeholder demo response.</p>
                            <button
                                type='button'
                                onClick={handleAiBackgroundRemove}
                                disabled={!selectionHasImageLayer || removeProcessing}
                                className='inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'
                            >
                                {removeProcessing ? 'Processing…' : 'Remove background'}
                            </button>
                            {renderStatusMessage('remove-bg')}
                        </div>

                        <div className='space-y-3 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Enhance & upscale</span>
                            <p className='text-xs text-slate-500'>Sharpen details and upscale resolution (preview only).</p>
                            <button
                                type='button'
                                onClick={handleAiEnhance}
                                disabled={!selectionHasImageLayer || enhanceProcessing}
                                className='inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'
                            >
                                {enhanceProcessing ? 'Enhancing…' : 'Enhance image'}
                            </button>
                            {renderStatusMessage('enhance')}
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                type='button'
                                onClick={handleAiMagicFill}
                                className='flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600'
                            >
                                Magic fill
                                <span className='text-[10px] uppercase text-slate-400'>In progress</span>
                            </button>
                            <button
                                type='button'
                                onClick={handleAiGenerateImage}
                                className='flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600'
                            >
                                Generate image
                                <span className='text-[10px] uppercase text-slate-400'>Coming soon</span>
                            </button>
                        </div>

                        {recentJobs.length ? (
                            <div className='space-y-2 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Recent AI jobs</span>
                                <div className='space-y-2 text-xs text-slate-500'>
                                    {recentJobs.map((job) => (
                                        <div key={job.id} className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
                                            <span className='font-semibold'>{jobLabel(job.action)}</span>
                                            <span className={`text-[10px] uppercase ${job.status === 'completed' ? 'text-emerald-500' : job.status === 'failed' ? 'text-rose-500' : 'text-slate-400'}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            }
            case 'layers':
                return inspectorLayers.length ? (
                    <div className={commonGridClasses}>
                        {inspectorLayers.map((layer) => (
                            <button
                                key={layer.id}
                                type='button'
                                onClick={() => handleSelectLayer(layer.id)}
                                className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition ${
                                    selectedLayerIds.includes(layer.id) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                                }`}>
                                <span className='text-xs uppercase tracking-wide text-slate-400'>{layer.type}</span>
                                <span className='text-sm font-semibold text-slate-800'>{layer.name ?? 'Layer'}</span>
                                <span className='text-[11px] text-slate-400'>
                                    {Math.round(layer.transform?.x ?? 0)} × {Math.round(layer.transform?.y ?? 0)}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className='rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500'>No layers yet. Add elements to see them listed here.</div>
                );
            case 'images':
                return (
                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                type='button'
                                onClick={() => handleUploadImageFile()}
                                className='flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600'>
                                <Upload className='h-5 w-5' />
                                Upload image
                            </button>
                            <button
                                type='button'
                                onClick={() => handleAddImage()}
                                className='flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600'>
                                <ImageIcon className='h-5 w-5' />
                                Add via URL
                            </button>
                        </div>
                        <div className='space-y-2 rounded-xl border border-slate-200 bg-white p-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Selected image</span>
                                <span className={`text-[11px] font-semibold uppercase ${hasImageSelection ? 'text-emerald-500' : 'text-slate-300'}`}>{hasImageSelection ? 'Active' : 'None'}</span>
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                                <button
                                    type='button'
                                    onClick={handleReplaceImageFromUpload}
                                    disabled={!hasImageSelection}
                                    className='flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                    <Upload className='h-3.5 w-3.5' />
                                    Replace upload
                                </button>
                                <button
                                    type='button'
                                    onClick={handleReplaceImageFromUrl}
                                    disabled={!hasImageSelection}
                                    className='flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                    <ImageIcon className='h-3.5 w-3.5' />
                                    Replace URL
                                </button>
                            </div>
                        </div>
                        {imageAssets.length ? (
                            <div className={commonGridClasses}>
                                {imageAssets.map((asset) => (
                                    <button
                                        key={asset.id}
                                        type='button'
                                        onClick={() => addImageLayerFromSource(asset.src)}
                                        className='group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-300 hover:shadow-md'>
                                        <img src={asset.src} alt='Uploaded asset' className='h-32 w-full object-cover transition group-hover:scale-105' />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className='rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500'>Uploaded images will appear here for quick reuse.</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className='flex h-screen flex-col bg-slate-50 text-slate-900'>
            <header className='flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-semibold'>d</div>
                    <div className='flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1'>
                        <span className='text-sm font-semibold'>{designTitle}</span>
                        <ChevronDown className='h-4 w-4 text-slate-400' />
                    </div>
                    <button className='hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:border-indigo-400 hover:text-indigo-500 md:inline-flex'>
                        <Sparkles className='h-4 w-4 text-indigo-500' /> Magic layout
                    </button>
                </div>
                <div className='flex items-center gap-2'>
                    <button onClick={handleShareDesign} className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-500'>
                        <Upload className='h-4 w-4' /> Upload
                    </button>
                    <button onClick={handleExportDesign} className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-500'>
                        <Download className='h-4 w-4' /> Export
                    </button>
                    <button onClick={handleSave} className='inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700'>
                        <Save className='h-4 w-4' /> Save
                    </button>
                </div>
            </header>

            <div className='flex flex-1 overflow-hidden relative'>
                {isLibraryPanelOpen ? (
                    <aside className='absolute left-0 top-0 bottom-0 z-20 w-80 translate-x-0 transform bg-white p-4 shadow-xl transition-transform duration-300 md:left-24'>
                        <div className='flex items-center justify-between border-b border-slate-200 pb-3'>
                            <div className='space-y-1'>
                                <p className='text-xs font-semibold uppercase tracking-wide text-slate-400'>Browse</p>
                                <h3 className='text-sm font-semibold text-slate-800'>{panelTitleMap[libraryPanel]}</h3>
                            </div>
                            <button type='button' onClick={closeLibraryPanel} className='rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-indigo-300 hover:text-indigo-600'>
                                Close
                            </button>
                        </div>
                        <div className='mt-4 overflow-y-auto pb-6'>{renderLibraryPanel()}</div>
                    </aside>
                ) : null}
                <aside className='hidden w-24 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex'>
                    <div className='flex flex-col items-center gap-2 border-b border-slate-100 px-3 py-5'>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500'>
                            <span className='text-lg font-semibold'>d</span>
                        </div>
                        <span className='text-xs font-semibold text-slate-600'>Dropple</span>
                    </div>
                    <div className='flex flex-1 flex-col items-center gap-2 overflow-y-auto py-4'>
                        {TOOLBAR_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return <ToolSidebarButton key={item.id} icon={Icon} label={item.label} active={activeTool === item.id} onClick={() => handleToolSelect(item.id)} />;
                        })}
                    </div>
                </aside>

                <main className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${isLibraryPanelOpen ? 'md:ml-80' : ''}`}>
                    <div className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <button className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-500'>
                                <LayersIcon className='h-4 w-4' /> Arrange
                            </button>
                            <button className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-500'>
                                <Copy className='h-4 w-4' /> Duplicate
                            </button>
                            <button onClick={handleRemovePage} className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-rose-200 hover:text-rose-500'>
                                <Trash2 className='h-4 w-4' /> Delete
                            </button>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button onClick={() => handleZoomChange(zoom - 0.1)} className='flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'>
                                <ZoomOut className='h-4 w-4' />
                            </button>
                            <span className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600'>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => handleZoomChange(zoom + 0.1)} className='flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'>
                                <ZoomIn className='h-4 w-4' />
                            </button>
                        </div>
                    </div>

                    <div className='flex flex-1 gap-4 overflow-hidden p-4'>
                        <div className='flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-100/60'>
                            <div className='flex items-center justify-between border-b border-slate-200 px-5 py-3 text-xs uppercase tracking-wide text-slate-400'>
                                <span>Canvas</span>
                                <span className='inline-flex items-center gap-1 text-[11px] text-slate-500'>
                                    <Box className='h-3.5 w-3.5' />
                                    {visibleCanvasSize.visibleWidth} × {visibleCanvasSize.visibleHeight} px
                                </span>
                            </div>
                            <div className='relative flex flex-1 items-center justify-center overflow-auto bg-slate-50/40 p-6' style={gridOverlayStyle}>
                                <div className='relative my-6 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0px_18px_40px_rgba(15,23,42,0.06)]'>
                                    <div className='pointer-events-none absolute inset-3 rounded-2xl border border-dashed border-slate-200' />
                                    <canvas ref={elementRef} className='relative z-10 block rounded-[18px]' />
                                </div>
                            </div>
                        </div>

                        <aside className='w-80 flex-shrink-0 rounded-3xl border border-slate-200 bg-white p-4'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-sm font-semibold text-slate-800'>Inspector</h2>
                                <button className='rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-indigo-400 hover:text-indigo-500'>
                                    <RefreshCw className='h-3.5 w-3.5' />
                                </button>
                            </div>
                            <div className='mt-3 flex items-center gap-2'>
                                {PROPERTY_TABS.map((tab) => (
                                    <TabButton key={tab} tab={tab} activeTab={activeTab} onSelect={setActiveTab} />
                                ))}
                            </div>

                            {activeTab === 'Properties' && (
                                <div className='mt-5 space-y-5'>
                                    <div className='space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3'>
                                        <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Canvas Presets</span>
                                        <div className='grid gap-2'>
                                            {CANVAS_PRESET_OPTIONS.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => handlePresetSelect(preset.id)}
                                                    className={`flex w-full flex-col rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                                                        selectedPresetId === preset.id ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-transparent hover:border-slate-200 hover:bg-white'
                                                    }`}>
                                                    {preset.label}
                                                    <span className='text-[10px] uppercase text-slate-400'>
                                                        {preset.width} × {preset.height}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {isDrawToolActive && (
                                        <div className='space-y-3 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Brush</span>
                                                <div className='flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500'>
                                                    <span>{drawSettings.mode === 'eraser' ? 'Eraser' : 'Brush'}</span>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <button
                                                    type='button'
                                                    onClick={() => handleDrawModeChange('brush')}
                                                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-semibold ${
                                                        drawSettings.mode === 'brush'
                                                            ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                                            : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                                                    }`}>
                                                    Brush
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={() => handleDrawModeChange('eraser')}
                                                    disabled={!hasEraser}
                                                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-semibold ${
                                                        drawSettings.mode === 'eraser'
                                                            ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                                            : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                                                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                                                    Eraser
                                                </button>
                                            </div>
                                            <div className='space-y-2'>
                                                <span className='text-[11px] uppercase text-slate-500'>Brush colour</span>
                                                <input
                                                    type='color'
                                                    value={drawSettings.color}
                                                    onChange={(event) => handleDrawColorChange(event.target.value)}
                                                    className='h-10 w-full rounded-lg border border-slate-200'
                                                    disabled={drawSettings.mode === 'eraser'}
                                                />
                                            </div>
                                            <SliderField label='Size' min={1} max={80} step={1} value={drawSettings.width} onChange={handleDrawWidthChange} />
                                            <SliderField
                                                label='Opacity'
                                                min={0.05}
                                                max={1}
                                                step={0.05}
                                                value={drawSettings.opacity}
                                                onChange={handleDrawOpacityChange}
                                            />
                                            <SliderField
                                                label='Smoothing'
                                                min={0}
                                                max={0.95}
                                                step={0.05}
                                                value={drawSettings.smoothing}
                                                onChange={handleDrawSmoothingChange}
                                            />
                                        </div>
                                    )}

                                    {selectionMeta ? (
                                        <div className='space-y-4 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex flex-col'>
                                                    <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Selection</span>
                                                    <span className='text-sm font-semibold text-slate-800 capitalize'>{selectionMeta.type}</span>
                                                </div>
                                                <span className='rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-600'>{activeTool}</span>
                                            </div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <Field label='Width' value={selectionMeta.width} onChange={(value) => handleLayerSizeChange('width', value)} />
                                                <Field label='Height' value={selectionMeta.height} onChange={(value) => handleLayerSizeChange('height', value)} />
                                                <Field label='X' value={selectionMeta.left} onChange={(value) => handleLayerPositionChange('x', value)} />
                                                <Field label='Y' value={selectionMeta.top} onChange={(value) => handleLayerPositionChange('y', value)} />
                                            </div>
                                            <Field label='Rotation' value={selectionMeta.angle} onChange={handleLayerRotationChange} />
                                            <SliderField label='Opacity' min={0} max={1} step={0.05} value={selectionMeta.opacity ?? 1} onChange={handleOpacityChange} />

                                            {activeLayer?.type === 'text' && (
                                                <div className='space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3'>
                                                    <Field label='Font size' value={activeLayer.fontSize ?? 48} onChange={handleFontSizeChange} />
                                                    <div className='flex items-center gap-2'>
                                                        {['left', 'center', 'right'].map((align) => (
                                                            <button
                                                                key={align}
                                                                onClick={() => handleLayerPositionChange('align', align)}
                                                                className={`flex-1 rounded-md border px-2 py-1 text-xs capitalize ${activeLayer.align === align ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>
                                                                {align}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <SliderField label='Letter spacing' min={-10} max={10} step={1} value={activeLayer.letterSpacing ?? 0} onChange={handleLetterSpacingChange} />
                                                    <SliderField label='Line height' min={0.5} max={3} step={0.05} value={activeLayer.lineHeight ?? 1.2} onChange={handleLineHeightChange} />
                                                    <TextInput label='Content' value={selectionMeta.text ?? ''} onChange={handleTextChange} placeholder='Enter text' />
                                                </div>
                                            )}

                                            {activeLayer?.type === 'shape' && (
                                                <div className='space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3'>
                                                    <div className='space-y-2'>
                                                        <span className='text-[11px] uppercase text-slate-500'>Fill</span>
                                                        <input
                                                            type='color'
                                                            value={selectionMeta.fill ?? '#4338CA'}
                                                            onChange={(event) => handleFillChange(event.target.value)}
                                                            className='h-10 w-full rounded-lg border border-slate-200'
                                                        />
                                                    </div>
                                                    <div className='space-y-2'>
                                                        <span className='text-[11px] uppercase text-slate-500'>Stroke colour</span>
                                                        <input
                                                            type='color'
                                                            value={activeShapeStroke?.color ?? '#0f172a'}
                                                            onChange={(event) => handleShapeStrokeColorChange(event.target.value)}
                                                            className='h-10 w-full rounded-lg border border-slate-200'
                                                        />
                                                    </div>
                                                    <SliderField
                                                        label='Stroke width'
                                                        min={0}
                                                        max={40}
                                                        step={1}
                                                        value={activeShapeStroke?.width ?? 0}
                                                        onChange={handleShapeStrokeWidthChange}
                                                    />
                                                    <Field label='Corner radius' value={activeLayer.cornerRadius ?? 0} onChange={handleCornerRadiusChange} />
                                                    <div className='space-y-2'>
                                                        <button
                                                            type='button'
                                                            onClick={handleShapeShadowToggle}
                                                            className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold ${
                                                                activeShapeShadow
                                                                    ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                                                    : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                                                            }`}>
                                                            {activeShapeShadow ? 'Remove shadow' : 'Add shadow'}
                                                        </button>
                                                        {activeShapeShadow ? (
                                                            <div className='grid grid-cols-2 gap-3 text-[11px] uppercase tracking-wide text-slate-500'>
                                                                <Field
                                                                    label='Offset X'
                                                                    value={activeShapeShadow.offsetX ?? 0}
                                                                    onChange={(value) => handleShapeShadowChange('offsetX', value)}
                                                                />
                                                                <Field
                                                                    label='Offset Y'
                                                                    value={activeShapeShadow.offsetY ?? 0}
                                                                    onChange={(value) => handleShapeShadowChange('offsetY', value)}
                                                                />
                                                                <Field
                                                                    label='Blur'
                                                                    value={activeShapeShadow.blur ?? 0}
                                                                    onChange={(value) => handleShapeShadowChange('blur', value)}
                                                                />
                                                                <Field
                                                                    label='Opacity'
                                                                    value={activeShapeShadow.opacity ?? 0.25}
                                                                    onChange={(value) => handleShapeShadowChange('opacity', clamp(value, 0, 1))}
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            )}

                                            {activeLayer?.type === 'image' && (
                                                <div className='space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3'>
                                                    <TextInput label='Source' value={activeLayer.src ?? ''} onChange={handleImageUrlChange} placeholder='https://…' />
                                                    <SliderField
                                                        label='Brightness'
                                                        min={-1}
                                                        max={1}
                                                        step={0.05}
                                                        value={activeImageFilters.brightness ?? 0}
                                                        onChange={(value) => handleImageAdjustmentChange('brightness', value)}
                                                    />
                                                    <SliderField
                                                        label='Contrast'
                                                        min={-1}
                                                        max={1}
                                                        step={0.05}
                                                        value={activeImageFilters.contrast ?? 0}
                                                        onChange={(value) => handleImageAdjustmentChange('contrast', value)}
                                                    />
                                                    <SliderField
                                                        label='Saturation'
                                                        min={-1}
                                                        max={1}
                                                        step={0.05}
                                                        value={activeImageFilters.saturation ?? 0}
                                                        onChange={(value) => handleImageAdjustmentChange('saturation', value)}
                                                    />
                                                    <SliderField
                                                        label='Blur'
                                                        min={0}
                                                        max={1}
                                                        step={0.05}
                                                        value={activeImageFilters.blur ?? 0}
                                                        onChange={(value) => handleImageAdjustmentChange('blur', value)}
                                                    />
                                                    <label className='flex items-center justify-between text-[11px] uppercase text-slate-500'>
                                                        <span>Grayscale</span>
                                                        <input
                                                            type='checkbox'
                                                            className='h-4 w-4 accent-indigo-500'
                                                            checked={Boolean(activeImageFilters.grayscale)}
                                                            onChange={(event) =>
                                                                handleImageAdjustmentChange('grayscale', event.target.checked ? 1 : 0)
                                                            }
                                                        />
                                                    </label>
                                                    <button
                                                        type='button'
                                                        onClick={handleImageResetAdjustments}
                                                        disabled={!imageHasAdjustments}
                                                        className='w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        Reset adjustments
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='space-y-4 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Canvas</span>
                                                <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-slate-500'>No selection</span>
                                            </div>
                                            <div className='grid grid-cols-2 gap-3'>
                                                <Field label='Width' value={canvasSize.width} onChange={(value) => setCanvasSize((prev) => ({ ...prev, width: Math.max(1, value) }))} />
                                                <Field label='Height' value={canvasSize.height} onChange={(value) => setCanvasSize((prev) => ({ ...prev, height: Math.max(1, value) }))} />
                                            </div>
                                            <TextInput label='Background' value={canvasBackground} onChange={handleBackgroundInputChange} />
                                            <label className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
                                                <input type='checkbox' checked={showCanvasGrid} onChange={handleToggleGrid} className='h-4 w-4 rounded border border-slate-300 accent-indigo-500' />
                                                Show grid
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Layers' && (
                                <div className='mt-5 space-y-2'>
                                    <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500'>
                                        <span>Layers</span>
                                    </div>
                                    <div className='space-y-2'>
                                        {inspectorLayers.map((layer, index) => {
                                            const isSelected = selectedLayerIds.includes(layer.id);
                                            const isHidden = layer.visible === false;
                                            const isLocked = layer.locked ?? false;
                                            return (
                                                <div
                                                    key={layer.id}
                                                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                                                        isSelected ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                                                    }`}>
                                                    <button onClick={() => handleSelectLayer(layer.id)} className='flex flex-1 items-center gap-2 text-left'>
                                                        <span className='text-[10px] uppercase tracking-wide text-slate-400'>{layer.type}</span>
                                                        <span className={`font-semibold ${isHidden ? 'line-through opacity-60' : ''}`}>{layer.name ?? 'Layer'}</span>
                                                    </button>
                                                    <div className='flex items-center gap-1 text-slate-400'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleLayerReorder(layer.id, 'down')}
                                                            disabled={index === 0}
                                                            className='rounded-full border border-slate-200 p-1 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                            <ArrowDown className='h-3 w-3' />
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleLayerReorder(layer.id, 'up')}
                                                            disabled={index === inspectorLayers.length - 1}
                                                            className='rounded-full border border-slate-200 p-1 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                            <ArrowUp className='h-3 w-3' />
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleToggleLayerVisibility(layer.id)}
                                                            className={`rounded-full border border-slate-200 p-1 hover:border-indigo-200 hover:text-indigo-600 ${isHidden ? 'text-rose-500' : ''}`}>
                                                            {isHidden ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleToggleLayerLock(layer.id)}
                                                            className={`rounded-full border border-slate-200 p-1 hover:border-indigo-200 hover:text-indigo-600 ${isLocked ? 'text-slate-700' : ''}`}>
                                                            {isLocked ? <Lock className='h-3 w-3' /> : <Unlock className='h-3 w-3' />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Variables' && (
                                <div className='mt-5 space-y-4'>
                                    <div className='space-y-3 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Brand colours</span>
                                            <span className={`text-[10px] uppercase ${selectionSupportsColor ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {selectionSupportsColor ? 'Selection ready' : 'Select a shape or text'}
                                            </span>
                                        </div>
                                        <div className='space-y-2'>
                                            {Object.entries(variables.colors).map(([key, value]) => (
                                                <div key={key} className='flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3'>
                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex items-center gap-3'>
                                                            <input
                                                                type='color'
                                                                value={value}
                                                                onChange={(event) => handleColorVariableChange(key, event.target.value)}
                                                                className='h-9 w-9 cursor-pointer rounded-full border border-white shadow'
                                                            />
                                                            <div className='flex flex-col'>
                                                                <span className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>{toTitleCase(key)}</span>
                                                                <input
                                                                    value={value}
                                                                    onChange={(event) => handleColorVariableChange(key, event.target.value)}
                                                                    className='w-28 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className='text-[11px] uppercase text-slate-400'>{value}</span>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleApplyColorVariable(key)}
                                                            disabled={!selectionSupportsColor}
                                                            className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                            Apply to selection
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleUpdateColorVariable(key)}
                                                            disabled={!activeLayerColor}
                                                            className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                            Capture from selection
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-3 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Text styles</span>
                                            <span className={`text-[10px] uppercase ${selectionHasTextLayer ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {selectionHasTextLayer ? 'Text selected' : 'Select a text layer'}
                                            </span>
                                        </div>
                                        <div className='space-y-2'>
                                            {Object.entries(variables.textStyles).map(([key, style]) => (
                                                <div key={key} className='space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3'>
                                                    <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                                                        <span>{toTitleCase(key)}</span>
                                                        <span className='text-[10px] uppercase text-slate-400'>
                                                            {style.fontFamily} · {style.fontSize}px · {style.fontWeight ?? '400'}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-xs text-slate-500'>
                                                        <span>Line height {style.lineHeight ?? 'auto'}</span>
                                                        <span>Letter spacing {style.letterSpacing ?? 0}</span>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleApplyTextStyle(key)}
                                                            disabled={!selectionHasTextLayer}
                                                            className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                            Apply to text
                                                        </button>
                                                        <button
                                                            type='button'
                                                            onClick={() => handleUpdateTextStyle(key)}
                                                            disabled={activeLayer?.type !== 'text'}
                                                            className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                            Capture from selection
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='space-y-3 rounded-2xl border border-slate-100 bg-white px-3 py-3'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Component tokens</span>
                                            <span className={`text-[10px] uppercase ${selectionHasShapeLayer ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {selectionHasShapeLayer ? 'Shape selected' : 'Select a shape'}
                                            </span>
                                        </div>
                                        <div className='space-y-3'>
                                            <div className='space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3'>
                                                <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                                                    <span>Corner radius</span>
                                                    <span className='text-[10px] uppercase text-slate-400'>{variables.tokens.radius}px</span>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <input
                                                        type='number'
                                                        min={0}
                                                        value={variables.tokens.radius}
                                                        onChange={(event) => handleTokenRadiusValueChange(Number(event.target.value))}
                                                        className='w-20 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={handleApplyRadiusToken}
                                                        disabled={!selectionHasShapeLayer}
                                                        className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        Apply to shapes
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={handleUpdateRadiusToken}
                                                        disabled={activeLayer?.type !== 'shape'}
                                                        className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        Capture selection
                                                    </button>
                                                </div>
                                            </div>

                                            <div className='space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3'>
                                                <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                                                    <span>Elevation shadow</span>
                                                    <span className={`text-[10px] uppercase ${selectionHasShapeLayer ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                        {selectionHasShapeLayer ? 'Shape selected' : 'Select a shape'}
                                                    </span>
                                                </div>
                                                <div className='grid grid-cols-2 gap-3'>
                                                    <label className='flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                                                        <span>Colour</span>
                                                        <input
                                                            type='color'
                                                            value={variables.tokens.shadow.color}
                                                            onChange={(event) => handleTokenShadowValueChange('color', event.target.value)}
                                                            className='h-9 w-full cursor-pointer rounded-md border border-slate-200'
                                                        />
                                                    </label>
                                                    <Field
                                                        label='Blur'
                                                        value={variables.tokens.shadow.blur ?? 0}
                                                        onChange={(value) => handleTokenShadowValueChange('blur', value)}
                                                    />
                                                    <Field
                                                        label='Offset X'
                                                        value={variables.tokens.shadow.offsetX ?? 0}
                                                        onChange={(value) => handleTokenShadowValueChange('offsetX', value)}
                                                    />
                                                    <Field
                                                        label='Offset Y'
                                                        value={variables.tokens.shadow.offsetY ?? 0}
                                                        onChange={(value) => handleTokenShadowValueChange('offsetY', value)}
                                                    />
                                                    <Field
                                                        label='Opacity'
                                                        value={variables.tokens.shadow.opacity ?? 0.25}
                                                        onChange={(value) => handleTokenShadowValueChange('opacity', clamp(value, 0, 1))}
                                                    />
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <button
                                                        type='button'
                                                        onClick={handleApplyShadowToken}
                                                        disabled={!selectionHasShapeLayer}
                                                        className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        Apply to shapes
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={handleUpdateShadowToken}
                                                        disabled={activeLayer?.type !== 'shape' || !activeLayer?.shadow}
                                                        className='flex-1 rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50'>
                                                        Capture selection
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>

                    <div className='flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-600'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <button onClick={() => handleZoomChange(zoom - 0.1)} className='flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'>
                                <ZoomOut className='h-4 w-4' />
                            </button>
                            <input type='range' min={0.25} max={4} step={0.05} value={zoom} onChange={(event) => handleZoomChange(Number(event.target.value))} className='w-32 accent-indigo-500' />
                            <button onClick={() => handleZoomChange(zoom + 0.1)} className='flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'>
                                <ZoomIn className='h-4 w-4' />
                            </button>
                            <span className='rounded-full border border-slate-200 px-2 py-1 font-semibold'>{Math.round(zoom * 100)}%</span>
                        </div>

                        <div className='flex flex-1 items-center gap-3 overflow-x-auto'>
                            <select value={selectedPresetId} onChange={(event) => handlePresetSelect(event.target.value)} className='rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200'>
                                <option value='custom'>Custom size</option>
                                {CANVAS_PRESET_OPTIONS.map((preset) => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            <div className='flex items-center gap-2'>
                                {pages.map((page) => {
                                    const isActive = page.id === activePageId;
                                    return (
                                        <button
                                            key={page.id}
                                            onClick={() => handleSelectPage(page.id)}
                                            className={`flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${isActive ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}>
                                            {page.label}
                                        </button>
                                    );
                                })}
                                <button onClick={handleAddPage} className='flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600'>
                                    <PlusCircle className='h-3.5 w-3.5' /> Add page
                                </button>
                            </div>
                        </div>

            <div className='flex flex-wrap items-center gap-3'>
                <button onClick={handleDuplicatePage} className='flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold hover:border-indigo-300 hover:text-indigo-600'>
                    <Copy className='h-3.5 w-3.5' /> Duplicate
                </button>
                <button onClick={handleRemovePage} disabled={artboards.length <= 1} className='flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold hover:border-rose-200 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60'>
                                <Trash2 className='h-3.5 w-3.5' /> Delete
                            </button>
                            <button className='flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold hover:border-indigo-300 hover:text-indigo-600'>
                                <MessageCircle className='h-3.5 w-3.5' /> Comments
                            </button>
                <div className='flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold'>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${autoSaveStatus === 'Saved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                    {autoSaveStatus}
                </div>
                <div className='flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold'>
                    <Info className='h-3.5 w-3.5 text-slate-400' />
                    {visibleCanvasSize.visibleWidth} × {visibleCanvasSize.visibleHeight} px
                </div>
            </div>
        </div>
                </main>
            </div>
        </div>
    );
}
