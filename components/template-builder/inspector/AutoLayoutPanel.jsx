'use client';

import NumericScrubber from '@/components/properties/NumericScrubber';
import { useNodeTreeStore } from '@/zustand/nodeTreeStore';

const JUSTIFY_OPTIONS = [
    { label: 'Start', value: 'start' },
    { label: 'Center', value: 'center' },
    { label: 'End', value: 'end' },
    { label: 'Space Between', value: 'space-between' },
];

const ALIGN_OPTIONS = [
    { label: 'Start', value: 'start' },
    { label: 'Center', value: 'center' },
    { label: 'End', value: 'end' },
    { label: 'Stretch', value: 'stretch' },
];

export default function AutoLayoutPanel({ node }) {
    const toggleAutoLayout = useNodeTreeStore((s) => s.toggleAutoLayout);
    const setDirection = useNodeTreeStore((s) => s.setAutoLayoutDirection);
    const setPadding = useNodeTreeStore((s) => s.setAutoLayoutPadding);
    const setGap = useNodeTreeStore((s) => s.setAutoLayoutGap);
    const setFlexGrow = useNodeTreeStore((s) => s.setFlexGrow);
    const setJustify = useNodeTreeStore((s) => s.setAutoLayoutJustify);
    const setAlign = useNodeTreeStore((s) => s.setAutoLayoutAlign);

    if (!node) return null;

    const isAutoLayout = node.layout === 'flex';
    const autoLayout = node.autoLayout;

    return (
        <div className='space-y-4 border rounded-md p-3'>
            {/* ---------- HEADER ---------- */}
            <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Auto Layout</span>
                <button
                    onClick={() => toggleAutoLayout(node.id)}
                    className={`px-2 py-1 rounded text-xs border
                        ${isAutoLayout ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}>
                    {isAutoLayout ? 'On' : 'Off'}
                </button>
            </div>

            {/* ---------- DIRECTION ---------- */}
            {isAutoLayout && (
                <>
                    <div className='space-y-1'>
                        <label className='text-xs font-medium text-muted-foreground'>Direction</label>
                        <div className='grid grid-cols-2 gap-1'>
                            <button
                                onClick={() => setDirection(node.id, 'row')}
                                className={`px-2 py-1 rounded text-xs border
                                    ${autoLayout.direction === 'row' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}>
                                Horizontal
                            </button>

                            <button
                                onClick={() => setDirection(node.id, 'column')}
                                className={`px-2 py-1 rounded text-xs border
                                    ${autoLayout.direction === 'column' ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}>
                                Vertical
                            </button>
                        </div>
                    </div>

                    {/* ---------- JUSTIFY ---------- */}
                    <div className='space-y-1'>
                        <label className='text-xs font-medium text-muted-foreground'>Justify</label>
                        <div className='grid grid-cols-2 gap-1'>
                            {JUSTIFY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setJustify(node.id, opt.value)}
                                    className={`px-2 py-1 rounded text-xs border
                                        ${autoLayout.justify === opt.value ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ---------- ALIGN ---------- */}
                    <div className='space-y-1'>
                        <label className='text-xs font-medium text-muted-foreground'>Align</label>
                        <div className='grid grid-cols-2 gap-1'>
                            {ALIGN_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAlign(node.id, opt.value)}
                                    className={`px-2 py-1 rounded text-xs border
                                        ${autoLayout.align === opt.value ? 'bg-primary text-white' : 'bg-background hover:bg-muted'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ---------- SPACING ---------- */}
                    <NumericScrubber label='Padding' value={autoLayout.padding} min={0} onChange={(v) => setPadding(node.id, v)} />

                    <NumericScrubber label='Gap' value={autoLayout.gap} min={0} onChange={(v) => setGap(node.id, v)} />

                    {/* ---------- CHILD GROW ---------- */}
                    <NumericScrubber label='Grow' value={node.flexGrow} min={0} step={0.1} onChange={(v) => setFlexGrow(node.id, v)} />
                </>
            )}
        </div>
    );
}
