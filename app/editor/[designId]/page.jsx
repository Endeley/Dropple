'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ChevronDown, Circle, Image as ImageIcon, Move, Plus, Save, Square, Type } from 'lucide-react';

import { FabricCanvasAdapter } from '../../../lib/editor/fabricAdapter';
import { api } from '../../../convex/_generated/api';

function resizeCanvas(canvas, size) {
    canvas.setWidth(size.width);
    canvas.setHeight(size.height);
    canvas.renderAll();
}

async function loadLegacyTemplate(canvas, data, fabric) {
    if (!data || !fabric) return;
    canvas.clear();
    if (data.canvas) {
        canvas.setWidth(data.canvas.width);
        canvas.setHeight(data.canvas.height);
    }
    if (data.background) {
        canvas.setBackgroundColor(data.background, () => canvas.renderAll());
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

function ToolbarButton({ icon: Icon, label, onClick, active }) {
    return (
        <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white shadow-sm' : 'border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500'}`}>
            <Icon className='h-4 w-4' />
            {label}
        </button>
    );
}

function LayerList({ layers, selected, onSelect }) {
    return (
        <div className='flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]'>
            <div className='border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--muted-foreground)]'>Layers</div>
            <div className='flex-1 overflow-y-auto px-2 py-2 text-sm'>
                {layers.length === 0 ? (
                    <div className='rounded-md border border-dashed border-[var(--border)] px-3 py-6 text-center text-xs text-[var(--muted-foreground)]'>No layers yet. Add something to get started.</div>
                ) : (
                    layers.map((layer) => {
                        const isSelected = selected.includes(layer.id);
                        const icon = layer.type === 'text' ? 'Aa' : layer.type === 'image' ? '🖼️' : layer.type === 'shape' ? '⬚' : '🧩';
                        return (
                            <button key={layer.id} onClick={() => onSelect(layer.id)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-[var(--surface-strong)]'}`}>
                                <span className='flex items-center gap-2'>
                                    <span className='text-base leading-none'>{icon}</span>
                                    <span>{layer.name ?? layer.type}</span>
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function PropertyGroup({ title, children }) {
    return (
        <div className='space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]'>{title}</p>
            <div className='space-y-3'>{children}</div>
        </div>
    );
}

function NumberField({ label, value, onChange, min }) {
    return (
        <label className='flex flex-col gap-1 text-xs font-medium text-[var(--muted-foreground)]'>
            <span>{label}</span>
            <input
                type='number'
                value={value ?? ''}
                onChange={(event) => onChange(Number.parseFloat(event.target.value) || 0)}
                min={min}
                className='w-full rounded-md border border-[var(--border)] bg-white px-2 py-1 text-sm text-[var(--foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
            />
        </label>
    );
}

function ColorField({ label, value, onChange }) {
    return (
        <label className='flex flex-col gap-1 text-xs font-medium text-[var(--muted-foreground)]'>
            <span>{label}</span>
            <input type='color' value={value ?? '#000000'} onChange={(event) => onChange(event.target.value)} className='h-10 w-full cursor-pointer rounded-md border border-[var(--border)] bg-white' />
        </label>
    );
}

function TextField({ label, value, onChange, placeholder }) {
    return (
        <label className='flex flex-col gap-1 text-xs font-medium text-[var(--muted-foreground)]'>
            <span>{label}</span>
            <input
                type='text'
                value={value ?? ''}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className='w-full rounded-md border border-[var(--border)] bg-white px-2 py-1 text-sm text-[var(--foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
            />
        </label>
    );
}

const cloneLayer = (layer) => {
    if (typeof structuredClone === 'function') {
        return structuredClone(layer);
    }
    return JSON.parse(JSON.stringify(layer));
};

export default function EditorPage({ params }) {
    const { designId: rawDesignId } = use(params);
    const designId = typeof rawDesignId === 'string' ? rawDesignId : '';
    const isConvexDesignId = designId.startsWith('designs|');

    const design = useQuery(api.designs.getById, isConvexDesignId ? { id: designId } : 'skip');
    const saveDesign = useMutation(api.designs.saveData);

    const canvasRef = useRef(null);
    const adapterRef = useRef(null);
    const elementRef = useRef(null);
    const currentArtboardIdRef = useRef(null);
    const isLoadingRef = useRef(false);
    const fabricRef = useRef(null);

    const [artboards, setArtboards] = useState([]);
    const [defaultArtboardId, setDefaultArtboardId] = useState(null);
    const [variables, setVariables] = useState({});
    const [selectedLayerIds, setSelectedLayerIds] = useState([]);
    const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    const activeArtboard = useMemo(() => {
        if (!artboards.length) return null;
        const preferred = artboards.find((board) => board.id === defaultArtboardId);
        return preferred ?? artboards[0];
    }, [artboards, defaultArtboardId]);

    useEffect(() => {
        if (!isConvexDesignId) {
            setArtboards([]);
        }
    }, [isConvexDesignId]);

    const ensureFabric = useCallback(async () => {
        if (fabricRef.current) {
            return fabricRef.current;
        }
        const module = await import('fabric');
        const fabric = module.fabric ?? module;
        fabricRef.current = fabric;
        return fabric;
    }, []);

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
            setIsCanvasReady(true);
        };

        void setup();

        return () => {
            disposed = true;
            adapterRef.current?.dispose();
            adapterRef.current = null;
            canvasRef.current = null;
        };
    }, [canvasSize.height, canvasSize.width, ensureFabric]);

    useEffect(() => {
        if (!design?.data) {
            return;
        }
        const data = design.data;
        if (Array.isArray(data.artboards) && data.artboards.length) {
            setArtboards(data.artboards);
            setDefaultArtboardId(data.defaultArtboardId ?? data.artboards[0].id);
            setVariables(data.variables ?? {});
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
                await adapterRef.current.loadArtboard(activeArtboard, variables ?? activeArtboard.variables ?? {});
                currentArtboardIdRef.current = activeArtboard.id;
                setCanvasSize(activeArtboard.size);
                resizeCanvas(canvas, activeArtboard.size);
                const initialSelection =
                    activeArtboard.defaultLayerOrder?.slice(-1)[0] ?? activeArtboard.layers?.[activeArtboard.layers.length - 1]?.id;
                setSelectedLayerIds(initialSelection ? [initialSelection] : []);
            } finally {
                isLoadingRef.current = false;
            }
        };

        void run();
    }, [activeArtboard, variables, design, ensureFabric, isCanvasReady]);

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
                    setVariables((prev) => ({ ...prev, ...snapshot.variables }));
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

    const activeLayer = useMemo(() => {
        if (!activeArtboard || !selectedLayerIds.length) return null;
        return activeArtboard.layers?.find((layer) => layer.id === selectedLayerIds[0]) ?? null;
    }, [activeArtboard, selectedLayerIds]);

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
            fill: { kind: 'solid', color: '#6366F1' },
            cornerRadius: 16,
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
            fill: { kind: 'solid', color: '#F59E0B' },
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleAddImage = async () => {
        if (!adapterRef.current || !activeArtboard) return;
        const url = typeof window !== 'undefined' ? window.prompt('Image URL') : null;
        if (!url) return;
        const id = createId();
        const layer = {
            id,
            type: 'image',
            name: nextLayerName('Image'),
            transform: { x: 120, y: 120, width: 360, height: 280, rotation: 0, opacity: 1 },
            src: url,
            fit: 'cover',
        };
        appendLayer(layer);
        await adapterRef.current.addLayer(layer);
        adapterRef.current.selectLayers([id]);
    };

    const handleSave = async () => {
        if (!designId) return;
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
                    setVariables((prev) => ({ ...prev, ...snapshot.variables }));
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
    };

    const handleLayerPositionChange = (axis, value) => {
        if (!activeLayer) return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.transform = { ...layer.transform, [axis]: value };
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

    const handleImageUrlChange = (value) => {
        if (!activeLayer || activeLayer.type !== 'image') return;
        updateLayerAndCanvas(activeLayer.id, (layer) => {
            layer.src = value;
            return layer;
        });
    };

    if (!isConvexDesignId) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-500'>
                <div className='max-w-md space-y-4 text-center'>
                    <p className='text-lg font-semibold text-slate-700'>Design not found</p>
                    <p className='text-sm'>Pick a design from the editor dashboard or create a new one to open the canvas.</p>
                    <Link
                        href='/editor'
                        className='inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
                    >
                        Return to Editor Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-[calc(100vh-64px)] flex-col bg-[var(--app-background,#f8fafc)] text-[var(--foreground)]'>
            <header className='flex items-center justify-between border-b border-[var(--border)] bg-white px-6 py-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <span className='text-lg font-semibold tracking-tight'>Dropple</span>
                    <button className='inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted-foreground)] hover:border-indigo-500'>
                        Variables
                        <ChevronDown className='h-4 w-4' />
                    </button>
                    <div className='hidden items-center gap-2 md:flex'>
                        <span className='text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]'>Dimensions</span>
                        <div className='flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm'>
                            <span>{canvasSize.width}</span>
                            <span className='text-[var(--muted-foreground)]'>×</span>
                            <span>{canvasSize.height}</span>
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button className='inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:border-indigo-500'>Share</button>
                    <button onClick={handleSave} className='inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700'>
                        <Save className='h-4 w-4' /> Save
                    </button>
                </div>
            </header>

            <div className='flex flex-1 overflow-hidden'>
                <aside className='hidden w-64 flex-shrink-0 flex-col gap-3 overflow-hidden border-r border-[var(--border)] bg-white p-4 md:flex'>
                    <LayerList layers={activeArtboard?.layers ?? []} selected={selectedLayerIds} onSelect={handleSelectLayer} />
                </aside>

                <main className='flex flex-1 flex-col gap-4 overflow-hidden p-4'>
                    <div className='flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 shadow-sm'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <ToolbarButton icon={Move} label='Select' active />
                            <ToolbarButton icon={Type} label='Text' onClick={handleAddText} />
                            <ToolbarButton icon={Square} label='Rectangle' onClick={handleAddRectangle} />
                            <ToolbarButton icon={Circle} label='Circle' onClick={handleAddCircle} />
                            <ToolbarButton icon={ImageIcon} label='Image' onClick={handleAddImage} />
                        </div>
                        <div className='flex items-center gap-2'>
                            <select
                                value={activeArtboard?.id ?? ''}
                                onChange={(event) => setDefaultArtboardId(event.target.value)}
                                className='rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'>
                                {(artboards ?? []).map((board) => (
                                    <option key={board.id} value={board.id}>
                                        {board.name ?? 'Artboard'}
                                    </option>
                                ))}
                            </select>
                            <button className='inline-flex items-center gap-1 rounded-md border border-dashed border-[var(--border)] px-2 py-2 text-sm text-[var(--muted-foreground)] hover:border-indigo-500'>
                                <Plus className='h-4 w-4' />
                            </button>
                        </div>
                    </div>

                    <div className='flex flex-1 items-center justify-center overflow-auto rounded-xl border border-[var(--border)] bg-white shadow-sm'>
                        <canvas ref={elementRef} className='mx-auto block' />
                    </div>
                </main>

                <aside className='hidden w-80 flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-[var(--border)] bg-white p-4 xl:flex'>
                    <h2 className='text-sm font-semibold text-[var(--muted-foreground)]'>Properties</h2>
                    {activeLayer ? (
                        <div className='space-y-4'>
                            <PropertyGroup title='Layer'>
                                <TextField label='Name' value={activeLayer.name ?? ''} onChange={handleLayerNameChange} placeholder='Layer name' />
                            </PropertyGroup>
                            <PropertyGroup title='Position'>
                                <div className='grid grid-cols-2 gap-3'>
                                    <NumberField label='X' value={Math.round(activeLayer.transform?.x ?? 0)} onChange={(value) => handleLayerPositionChange('x', value)} />
                                    <NumberField label='Y' value={Math.round(activeLayer.transform?.y ?? 0)} onChange={(value) => handleLayerPositionChange('y', value)} />
                                </div>
                            </PropertyGroup>
                            <PropertyGroup title='Size'>
                                <div className='grid grid-cols-2 gap-3'>
                                    <NumberField label='Width' value={Math.round(activeLayer.transform?.width ?? 0)} onChange={(value) => handleLayerSizeChange('width', value)} min={1} />
                                    <NumberField label='Height' value={Math.round(activeLayer.transform?.height ?? 0)} onChange={(value) => handleLayerSizeChange('height', value)} min={1} />
                                </div>
                            </PropertyGroup>
                            {(activeLayer.type === 'shape' || activeLayer.type === 'text') && (
                                <PropertyGroup title='Appearance'>
                                    <ColorField label='Fill' value={activeLayer.type === 'shape' ? (activeLayer.fill?.color ?? '#000000') : (activeLayer.fill ?? '#000000')} onChange={handleFillChange} />
                                </PropertyGroup>
                            )}
                            {activeLayer.type === 'text' && (
                                <div>
                                    <PropertyGroup title='Text'>
                                        <TextField label='Content' value={activeLayer.content ?? ''} onChange={handleTextChange} placeholder='Enter text' />
                                        <NumberField label='Font size' value={activeLayer.fontSize ?? 16} onChange={handleFontSizeChange} min={6} />
                                    </PropertyGroup>
                                </div>
                            )}
                            {activeLayer.type === 'image' && (
                                <PropertyGroup title='Image'>
                                    <TextField label='Source URL' value={activeLayer.src ?? ''} onChange={handleImageUrlChange} placeholder='https://...' />
                                </PropertyGroup>
                            )}
                        </div>
                    ) : (
                        <div className='rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]'>Select a layer to edit its properties.</div>
                    )}
                </aside>
            </div>
        </div>
    );
}
