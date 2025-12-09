'use client';

import { useRef } from 'react';
import { useTemplateBuilderStore } from '@/store/useTemplateBuilderStore';
import CanvasLayer from './CanvasLayer';
import SmartGuides from './SmartGuides';
import MarqueeSelect from './MarqueeSelect';
import ComponentEditorCanvas from './ComponentEditorCanvas';
import KeyboardShortcuts from './KeyboardShortcuts';
import ExportCodeModal from './ExportCodeModal';
import PageSwitcher from './PageSwitcher';
import PrototypeConnections from './PrototypeConnections';
import DevicePreviewBar from './DevicePreviewBar';
import MultiplayerCursors from './MultiplayerCursors';
import { useTimelinePlayer } from '@/zustand/useTimelinePlayer';

export default function BuilderCanvas() {
    const { currentTemplate, isEditingComponent, addLayer, canvas, setCanvasZoom, setCanvasPan } = useTemplateBuilderStore();
    const containerRef = useRef(null);
    const panStateRef = useRef({ panning: false, start: { x: 0, y: 0 }, origin: { x: 0, y: 0 } });
    useTimelinePlayer();

    if (isEditingComponent) {
        return (
            <>
                <KeyboardShortcuts />
                <ExportCodeModal />
                <ComponentEditorCanvas />
            </>
        );
    }

    return (
        <>
            <div
                ref={containerRef}
                className='flex-1 bg-slate-100 flex items-center justify-center overflow-auto relative'
                data-builder-canvas
                onWheel={(e) => {
                    // Mouse wheel/trackpad zoom (no preventDefault to avoid passive listener warning).
                    const rect = containerRef.current?.getBoundingClientRect();
                    const mouse = rect ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : { x: 0, y: 0 };
                    const oldZ = canvas?.zoom || 1;
                    const delta = -e.deltaY * 0.0015;
                    const next = Math.min(3, Math.max(0.2, oldZ + delta));
                    const pan = canvas?.pan || { x: 0, y: 0 };
                    const panX = mouse.x - ((mouse.x - pan.x) / oldZ) * next;
                    const panY = mouse.y - ((mouse.y - pan.y) / oldZ) * next;
                    setCanvasZoom(next);
                    setCanvasPan({ x: panX, y: panY });
                }}
                onMouseDown={(e) => {
                    // Middle button or space-drag to pan.
                    if (e.button === 1 || (e.button === 0 && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.getModifierState(' ')))) {
                        e.preventDefault();
                        const pan = canvas?.pan || { x: 0, y: 0 };
                        panStateRef.current = {
                            panning: true,
                            start: { x: e.clientX, y: e.clientY },
                            origin: { x: pan.x, y: pan.y },
                        };
                    }
                }}
                onMouseMove={(e) => {
                    if (!panStateRef.current.panning) return;
                    e.preventDefault();
                    const { start, origin } = panStateRef.current;
                    const dx = e.clientX - start.x;
                    const dy = e.clientY - start.y;
                    setCanvasPan({ x: origin.x + dx, y: origin.y + dy });
                }}
                onMouseUp={() => {
                    panStateRef.current.panning = false;
                }}
                onMouseLeave={() => {
                    panStateRef.current.panning = false;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                    e.preventDefault();
                    const assetUrl = e.dataTransfer.getData('asset-url');
                    if (assetUrl) {
                        const width = Number(e.dataTransfer.getData('asset-width')) || 300;
                        const height = Number(e.dataTransfer.getData('asset-height')) || 200;
                        addLayer({
                            id: 'img_' + crypto.randomUUID(),
                            type: 'image',
                            url: assetUrl,
                            x: e.clientX - 150,
                            y: e.clientY - 100,
                            width,
                            height,
                            props: {},
                        });
                        return;
                    }
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch('/api/assets/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await res.json();
                    if (data?.url) {
                        useTemplateBuilderStore.getState().addImageLayer(data.url);
                    }
                }}>
                <KeyboardShortcuts />
                <ExportCodeModal />
                <div className='flex fixed  bottom-6 z-50 space-y-2'>
                    <DevicePreviewBar />
                    <button
                        className='rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50'
                        onClick={() => {
                            const viewport = containerRef.current?.getBoundingClientRect();
                            const vw = viewport?.width || 1200;
                            const vh = viewport?.height || 800;
                            const roots = (currentTemplate.layers || []).filter((l) => !l.parentId);
                            if (!roots.length) {
                                setCanvasZoom(1);
                                setCanvasPan({ x: vw / 2 - 400, y: vh / 2 - 300 });
                                return;
                            }
                            const minX = Math.min(...roots.map((l) => l.x));
                            const minY = Math.min(...roots.map((l) => l.y));
                            const maxX = Math.max(...roots.map((l) => l.x + l.width));
                            const maxY = Math.max(...roots.map((l) => l.y + l.height));
                            const boxW = maxX - minX;
                            const boxH = maxY - minY;
                            const margin = 160;
                            const fitZoom = Math.min(1.5, Math.max(0.2, Math.min((vw - margin * 2) / boxW, (vh - margin * 2) / boxH)));
                            const centerX = minX + boxW / 2;
                            const centerY = minY + boxH / 2;
                            const panX = vw / 2 - centerX * fitZoom;
                            const panY = vh / 2 - centerY * fitZoom;
                            setCanvasZoom(fitZoom);
                            setCanvasPan({ x: panX, y: panY });
                        }}>
                        Reset View
                    </button>
                    <PageSwitcher />
                </div>
                {/*
          Use a large virtual workspace to allow panning/scrolling beyond template bounds.
          We keep template dimensions but ensure the canvas is expansive.
        */}
                {(() => {
                    const pad = 4000;
                    const roots = currentTemplate.layers?.filter((l) => !l.parentId) || [];
                    const contentWidth = roots.length ? Math.max(...roots.map((l) => l.x + l.width)) + pad : currentTemplate.width + pad;
                    const contentHeight = roots.length ? Math.max(...roots.map((l) => l.y + l.height)) + pad : currentTemplate.height + pad;
                    const workspaceWidth = Math.max(contentWidth, 20000);
                    const workspaceHeight = Math.max(contentHeight, 20000);
                    return (
                        <div
                            id='dropple-canvas'
                            className='relative rounded-md border border-slate-200 shadow-lg origin-top-left'
                            style={{
                                width: workspaceWidth,
                                height: workspaceHeight,
                                transform: `translate(${canvas?.pan?.x || 0}px, ${canvas?.pan?.y || 0}px) scale(${canvas?.zoom || 1})`,
                                backgroundImage: 'linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(180deg, rgba(148,163,184,0.12) 1px, transparent 1px)',
                                backgroundSize: '24px 24px',
                                backgroundColor: '#f8fafc',
                            }}>
                            <MultiplayerCursors />
                            {currentTemplate.layers
                                .filter((layer) => !layer.parentId)
                                .map((layer) => (
                                    <CanvasLayer key={layer.id} layer={layer} offset={{ x: 0, y: 0 }} />
                                ))}
                            <SmartGuides />
                            <PrototypeConnections layers={currentTemplate.layers} />
                        </div>
                    );
                })()}
                <MarqueeSelect containerRef={containerRef} layers={currentTemplate.layers} />
            </div>
        </>
    );
}
