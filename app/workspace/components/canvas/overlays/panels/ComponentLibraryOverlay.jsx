'use client';

import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

const COMPONENT_TEMPLATES = [
    {
        id: 'cta-card',
        name: 'CTA Card',
        description: 'Hero call-to-action card with headline, subtitle, and button.',
        width: 360,
        height: 220,
        children: [
            {
                type: 'rect',
                props: {
                    x: 0,
                    y: 0,
                    width: 360,
                    height: 220,
                    cornerRadius: 24,
                    fill: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                    opacity: 0.95,
                },
            },
            {
                type: 'text',
                props: {
                    x: 24,
                    y: 32,
                    width: 312,
                    height: 64,
                    text: 'Design smarter with Dropple Studio',
                    fontSize: 24,
                    lineHeight: 1.3,
                    fill: '#F9FAFB',
                },
            },
            {
                type: 'text',
                props: {
                    x: 24,
                    y: 108,
                    width: 312,
                    height: 48,
                    text: 'Bring layouts, copy, and motion together in one infinite canvas.',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fill: 'rgba(241,245,249,0.85)',
                },
            },
            {
                type: 'rect',
                props: {
                    x: 24,
                    y: 164,
                    width: 152,
                    height: 44,
                    cornerRadius: 14,
                    fill: '#F9FAFB',
                },
            },
            {
                type: 'text',
                props: {
                    x: 24,
                    y: 174,
                    width: 152,
                    height: 24,
                    text: 'Start Creating →',
                    fontSize: 16,
                    lineHeight: 1.2,
                    align: 'center',
                    fill: '#1E293B',
                },
            },
        ],
    },
    {
        id: 'testimonial',
        name: 'Testimonial',
        description: 'Testimonial block with avatar, quote, and attribution.',
        width: 340,
        height: 200,
        children: [
            {
                type: 'rect',
                props: {
                    x: 0,
                    y: 0,
                    width: 340,
                    height: 200,
                    cornerRadius: 20,
                    fill: '#0F172A',
                    stroke: 'rgba(148,163,184,0.35)',
                    strokeWidth: 1,
                    opacity: 0.95,
                },
            },
            {
                type: 'rect',
                props: {
                    x: 24,
                    y: 32,
                    width: 56,
                    height: 56,
                    cornerRadius: 999,
                    fill: 'linear-gradient(135deg, #38BDF8 0%, #3B82F6 100%)',
                },
            },
            {
                type: 'text',
                props: {
                    x: 96,
                    y: 40,
                    width: 220,
                    height: 44,
                    text: '“Dropple collapsed our design and copy workflow into one magical space.”',
                    fontSize: 15,
                    lineHeight: 1.4,
                    fill: '#E2E8F0',
                },
            },
            {
                type: 'text',
                props: {
                    x: 24,
                    y: 112,
                    width: 292,
                    height: 24,
                    text: 'Zara Adebayo',
                    fontSize: 15,
                    fontWeight: 600,
                    fill: '#F9FAFB',
                },
            },
            {
                type: 'text',
                props: {
                    x: 24,
                    y: 136,
                    width: 292,
                    height: 24,
                    text: 'Head of Product • Rayva Labs',
                    fontSize: 13,
                    fill: 'rgba(148,163,184,0.7)',
                },
            },
        ],
    },
];

export default function ComponentLibraryOverlay() {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const addElementToFrame = useCanvasStore((state) => state.addElementToFrame);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );

    const handleInsertTemplate = (template) => {
        if (!activeFrame) return;

        const groupId = `component-${nanoid(6)}`;
        const groupX = Math.max(32, (activeFrame.width - template.width) / 2);
        const groupY = Math.max(24, (activeFrame.height - template.height) / 2);

        addElementToFrame(activeFrame.id, {
            id: groupId,
            type: 'group',
            props: {
                x: groupX,
                y: groupY,
                width: template.width,
                height: template.height,
                opacity: 1,
            },
        });

        template.children.forEach((child) => {
            addElementToFrame(
                activeFrame.id,
                {
                    id: `${template.id}-${nanoid(4)}`,
                    type: child.type,
                    props: {
                        ...child.props,
                    },
                },
                groupId,
            );
        });

        setSelectedElement(activeFrame.id, groupId);
        setActiveToolOverlay(null);
    };

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold text-white'>Component Library</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>
                        Drop pre-built UI blocks into the selected frame.
                    </p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>

            {!activeFrame ? (
                <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame to insert components.</p>
            ) : (
                <ul className='space-y-3'>
                    {COMPONENT_TEMPLATES.map((template) => (
                        <li key={template.id} className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                            <div className='flex items-start justify-between gap-3'>
                                <div>
                                    <p className='text-sm font-semibold text-white'>{template.name}</p>
                                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>{template.description}</p>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => handleInsertTemplate(template)}
                                    className='rounded-lg border border-[rgba(139,92,246,0.45)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[rgba(236,233,254,0.9)] transition-colors hover:border-[rgba(236,233,254,0.85)] hover:text-white'
                                >
                                    Insert
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
