'use client';

import { useToolStore } from '@/zustand/toolStore';
import { useRef } from 'react';
import { useSelectionStore } from '@/zustand/selectionStore';
import { useAssetBrowserStore } from '@/zustand/assetBrowserStore';
import { usePageStore } from '@/zustand/pageStore';
import ComponentsLibraryPanel from '@/components/workspace/ComponentsLibraryPanel';
import { dispatchEvent } from '@/lib/dispatch/dispatchEvent';

export default function UIUXTools() {
    const { tool, setTool } = useToolStore();

    const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
    const deselectAll = useSelectionStore((s) => s.deselectAll);
    const selectedIds = useSelectionStore((s) => s.selectedIds);

    const fileRef = useRef(null);

    const openBrowser = useAssetBrowserStore((s) => s.openBrowser);

    const pages = usePageStore((s) => s.pages);
    const currentPageId = usePageStore((s) => s.currentPageId);
    const addPage = usePageStore((s) => s.addPage);
    const setCurrentPage = usePageStore((s) => s.setCurrentPage);

    const buttonClass = (id) => `w-full px-3 py-2 text-left rounded-md text-sm font-medium transition border ${tool === id ? 'bg-violet-500/10 border-violet-500/70 text-violet-700 shadow-sm' : 'bg-white border-neutral-200 text-neutral-700 hover:border-violet-300 hover:bg-violet-50'}`;

    const sectionLabel = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500';

    const framePresets = [
        { id: 'desktop', label: 'Desktop · 1440×900', width: 1440, height: 900 },
        { id: 'tablet', label: 'Tablet · 1024×1366', width: 1024, height: 1366 },
        { id: 'mobile', label: 'Mobile · 390×844', width: 390, height: 844 },
        { id: 'square', label: 'Square · 800×800', width: 800, height: 800 },
    ];

    /* ---------------------------------------------
     EVENT-BASED ACTIONS ONLY
  --------------------------------------------- */

    const addFrameFromPreset = (preset) => {
        const id = crypto.randomUUID();

        dispatchEvent({
            type: 'NODE_CREATE',
            payload: {
                node: {
                    id,
                    type: 'frame',
                    name: preset.label,
                    x: 120,
                    y: 120,
                    width: preset.width,
                    height: preset.height,
                    rotation: 0,
                    background: {
                        type: 'color',
                        value: '#d1d5db',
                        size: 'cover',
                        position: 'center',
                    },
                    stroke: '#94a3b8',
                    strokeWidth: 1,
                    parentId: null,
                    children: [],
                    pageId: currentPageId,
                },
            },
        });

        setSelectedManual([id]);
        setTool('select');
    };

    const handleDeleteSelection = () => {
        selectedIds.forEach((id) => {
            dispatchEvent({
                type: 'NODE_DELETE',
                payload: { id },
            });
        });
        deselectAll();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const id = crypto.randomUUID();

            dispatchEvent({
                type: 'NODE_CREATE',
                payload: {
                    node: {
                        id,
                        type: 'image',
                        name: file.name,
                        x: 120,
                        y: 120,
                        width: img.width / 2,
                        height: img.height / 2,
                        src: url,
                        rotation: 0,
                        parentId: null,
                        children: [],
                    },
                },
            });

            setSelectedManual([id]);
            setTool('select');
        };

        img.src = url;
    };

    /* ---------------------------------------------
     RENDER
  --------------------------------------------- */

    return (
        <div className='p-4 space-y-4'>
            <div className='text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500'>UI/UX Tools</div>

            {/* Pages */}
            <div className='space-y-2'>
                <div className={sectionLabel}>Pages</div>
                <div className='rounded-lg border border-neutral-200 bg-white shadow-sm divide-y divide-neutral-100'>
                    {pages.map((page) => (
                        <div key={page.id} className={`flex items-center justify-between px-3 py-2 cursor-pointer ${currentPageId === page.id ? 'bg-violet-50 border-l-2 border-l-violet-500' : 'hover:bg-neutral-50'}`} onClick={() => setCurrentPage(page.id)}>
                            <div className='flex flex-col'>
                                <span className='text-sm font-semibold text-neutral-800 truncate'>{page.name}</span>
                                <span className='text-[11px] text-neutral-500'>{page.path || '/'}</span>
                            </div>
                        </div>
                    ))}
                    <button className='w-full px-3 py-2 text-left text-xs font-semibold text-violet-700 hover:bg-violet-50' onClick={() => addPage()}>
                        + Add Page
                    </button>
                </div>
            </div>

            {/* Insert */}
            <div className='space-y-2'>
                <div className={sectionLabel}>Insert</div>
                <div className='grid grid-cols-2 gap-2'>
                    <button className={buttonClass('text')} onClick={() => setTool('text')}>
                        Text
                    </button>
                    <button className={buttonClass('image')} onClick={() => fileRef.current?.click()}>
                        Image
                    </button>
                    <button className={buttonClass('frame')} onClick={() => setTool('frame')}>
                        Frame
                    </button>
                </div>
            </div>

            {/* Frame Presets */}
            <div className='space-y-2'>
                <div className={sectionLabel}>Frame Presets</div>
                <div className='grid grid-cols-2 gap-2'>
                    {framePresets.map((preset) => (
                        <button key={preset.id} className='w-full rounded-md border border-neutral-200 bg-white px-2 py-2 text-left text-xs font-semibold hover:bg-violet-50' onClick={() => addFrameFromPreset(preset)}>
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handleImageUpload} />
        </div>
    );
}
