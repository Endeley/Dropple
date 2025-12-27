'use client';

import { useEffect } from 'react';
import CanvasHost from '@/ui/canvas/CanvasHost';
import NodeRenderer from '@/ui/canvas/NodeRenderer';
import DevicePreviewBar from '@/components/template-builder/DevicePreviewBar';

import { useNodeTreeStore } from '@/runtime/stores/nodeTreeStore';
import { useSelectionStore } from '@/runtime/stores/selectionStore';
import { usePageStore } from '@/runtime/stores/pageStore';

import { dispatchEvent } from '@/lib/dispatch/dispatchEvent';

export default function UIUXCanvas() {
    /* -----------------------------
     READ-ONLY CANVAS STATE
  ----------------------------- */
    const nodes = useNodeTreeStore((s) => s.nodes);
    const rootIds = useNodeTreeStore((s) => s.rootIds);

    const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);

    /* -----------------------------
     PAGE / WORKSPACE STATE
  ----------------------------- */
    const currentPageId = usePageStore((s) => s.currentPageId);
    const viewportWidth = usePageStore((s) => s.viewportWidth);
    const currentBreakpointId = usePageStore((s) => s.currentBreakpointId);
    const workspaceMode = usePageStore((s) => s.workspaceMode);
    const pages = usePageStore((s) => s.pages);

    const setCurrentBreakpoint = usePageStore((s) => s.setCurrentBreakpoint);
    const setWorkspaceMode = usePageStore((s) => s.setWorkspaceMode);
    const attachFrameToPage = usePageStore((s) => s.attachFrameToPage);

    const currentPage = pages.find((p) => p.id === currentPageId);

    /* -----------------------------
     HELPERS
  ----------------------------- */

    const findNextFramePosition = (width, height) => {
        const framesOnPage = rootIds.map((id) => nodes[id]).filter((n) => n?.type === 'frame' && (!currentPageId || n.pageId === currentPageId));

        const margin = 120;
        const startX = 120;
        const startY = 120;

        const maxWidth = Math.max(width, ...framesOnPage.map((f) => f.width));
        const maxHeight = Math.max(height, ...framesOnPage.map((f) => f.height));

        const stepX = maxWidth + margin;
        const stepY = maxHeight + margin;

        const overlaps = (candidate) =>
            framesOnPage.some((f) => {
                const expanded = {
                    x1: f.x - margin / 2,
                    y1: f.y - margin / 2,
                    x2: f.x + f.width + margin / 2,
                    y2: f.y + f.height + margin / 2,
                };
                return !(candidate.x + candidate.width <= expanded.x1 || candidate.x >= expanded.x2 || candidate.y + candidate.height <= expanded.y1 || candidate.y >= expanded.y2);
            });

        for (let row = 0; row < 50; row++) {
            for (let col = 0; col < 50; col++) {
                const candidate = {
                    x: startX + col * stepX,
                    y: startY + row * stepY,
                    width,
                    height,
                };
                if (!overlaps(candidate)) return { x: candidate.x, y: candidate.y };
            }
        }

        return { x: startX, y: startY };
    };

    /* -----------------------------
     INTENT: ADD FRAME PRESET
  ----------------------------- */
    const addFramePreset = (presetId) => {
        const presets = {
            mobile: { width: 390, height: 844 },
            tablet: { width: 1024, height: 1366 },
            desktop: { width: 1440, height: 900 },
            large: { width: 1680, height: 1050 },
        };

        const preset = presets[presetId];
        if (!preset) return;

        const id = crypto.randomUUID();
        const { x, y } = findNextFramePosition(preset.width, preset.height);

        dispatchEvent({
            type: 'NODE_CREATE',
            payload: {
                node: {
                    id,
                    type: 'frame',
                    name: `${presetId} frame`,
                    x,
                    y,
                    width: preset.width,
                    height: preset.height,
                    background: { type: 'color', value: '#d1d5db' },
                    stroke: '#94a3b8',
                    strokeWidth: 1,
                    children: [],
                    pageId: currentPageId,
                },
            },
        });

        attachFrameToPage(currentPageId, id);
        setSelectedManual([id]);
    };

    /* -----------------------------
     RESPONSIVE INTENT (PLACEHOLDER)
  ----------------------------- */
    useEffect(() => {
        if (!viewportWidth) return;

        dispatchEvent({
            type: 'CANVAS_VIEWPORT_CHANGE',
            payload: {
                viewportWidth,
                breakpointId: currentBreakpointId,
            },
        });
    }, [viewportWidth, currentBreakpointId]);

    const frames = rootIds.map((id) => nodes[id]).filter((n) => n?.type === 'frame' && (!currentPageId || n.pageId === currentPageId));

    /* -----------------------------
     RENDER
  ----------------------------- */
    return (
        <CanvasHost enablePanZoom nodeMap={nodes}>
            <div className='w-full h-full relative'>
                <div className='fixed left-4 top-28 z-50'>
                    <DevicePreviewBar onSelect={(bp) => setCurrentBreakpoint(bp)} addArtboard={(preset) => addFramePreset(preset)} />

                    <div className='mt-3 rounded-lg border border-neutral-200 bg-white/90 px-3 py-2 shadow-sm'>
                        <div className='text-[11px] font-semibold uppercase text-neutral-500'>Workspace</div>
                        <select className='mt-1 w-full rounded-md border border-neutral-200 px-2 py-1 text-sm' value={workspaceMode} onChange={(e) => setWorkspaceMode(e.target.value)}>
                            <option value='design'>Design</option>
                            <option value='layout'>Layout</option>
                            <option value='template'>Template</option>
                        </select>
                    </div>
                </div>

                {frames.length === 0 && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='pointer-events-none rounded-full border bg-white/90 px-4 py-2 text-sm shadow-sm'>No artboards yet. Use Frame tool or presets.</div>
                    </div>
                )}

                <div className='absolute inset-0'>
                    {rootIds.map((id) => (
                        <NodeRenderer key={id} nodeId={id} />
                    ))}
                </div>
            </div>
        </CanvasHost>
    );
}
