'use client';

import { useMemo, useState } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const TAB_OPTIONS = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
];

function copyToClipboard(value) {
    if (!value) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(value);
        return;
    }
    if (typeof window === 'undefined') return;
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

export default function CodeExportOverlay() {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const exportFrameCode = useCanvasStore((state) => state.exportFrameCode);
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);

    const [activeTab, setActiveTab] = useState('html');

    const frame = useMemo(
        () => frames.find((item) => item.id === selectedFrameId) ?? frames[0] ?? null,
        [frames, selectedFrameId],
    );

    const exportResult = useMemo(() => {
        if (!frame) return null;
        try {
            return exportFrameCode(frame.id, { format: 'object' });
        } catch (error) {
            console.error('Failed to generate export code', error);
            return null;
        }
    }, [frame, exportFrameCode]);

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-[rgba(226,232,240,0.85)] shadow-xl shadow-[rgba(15,23,42,0.55)] backdrop-blur'>
            <header className='mb-3 flex items-center justify-between gap-2'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Code Export</p>
                    <h2 className='text-sm font-semibold text-white'>
                        {frame ? frame.name ?? 'Untitled Frame' : 'No Frame Selected'}
                    </h2>
                </div>
                <select
                    value={frame?.id ?? ''}
                    onChange={(event) => {
                        const nextId = event.target.value;
                        if (!nextId) return;
                        setSelectedFrame(nextId);
                    }}
                    className='rounded-lg border border-[rgba(148,163,184,0.3)] bg-[rgba(15,23,42,0.65)] px-2 py-1 text-xs text-[rgba(236,233,254,0.85)] outline-none'
                >
                    {frames.length === 0 ? <option value=''>No frames</option> : null}
                    {frames.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name ?? 'Untitled Frame'}
                        </option>
                    ))}
                </select>
            </header>
            {!frame || !exportResult ? (
                <p className='rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(30,41,59,0.6)] px-3 py-4 text-xs text-[rgba(148,163,184,0.8)]'>
                    Add or select a frame to view exportable HTML and CSS.
                </p>
            ) : (
                <div className='space-y-3'>
                    <nav className='flex items-center gap-2'>
                        {TAB_OPTIONS.map((tab) => (
                            <button
                                key={tab.id}
                                type='button'
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-[rgba(236,233,254,0.85)] bg-[rgba(139,92,246,0.25)] text-white'
                                        : 'border-[rgba(148,163,184,0.3)] text-[rgba(226,232,240,0.75)] hover:border-[rgba(236,233,254,0.65)]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                    <div className='rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(10,16,28,0.85)]'>
                        <div className='flex items-center justify-between border-b border-[rgba(148,163,184,0.2)] px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-[rgba(148,163,184,0.7)]'>
                            <span>{activeTab.toUpperCase()}</span>
                            <button
                                type='button'
                                onClick={() => copyToClipboard(exportResult?.[activeTab] ?? '')}
                                className='rounded-md border border-[rgba(139,92,246,0.4)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(236,233,254,0.9)] hover:border-[rgba(236,233,254,0.75)]'
                            >
                                Copy
                            </button>
                        </div>
                        <pre className='max-h-64 overflow-auto p-3 text-[11px] leading-relaxed text-[rgba(191,219,254,0.9)]'>
                            <code>{exportResult?.[activeTab] ?? ''}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
