'use client';

import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

function SliderRow({ label, min = 0, max = 100, step = 1, value = 0, onChange }) {
    const safeValue = Number.isFinite(value) ? value : min;
    const progress = ((safeValue - min) / (max - min)) * 100;
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className='space-y-1'>
            <div className='flex items-center justify-between text-xs text-[rgba(226,232,240,0.65)]'>
                <span>{label}</span>
                <input
                    type='number'
                    className='w-16 rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.7)] px-1 py-0.5 text-right text-[rgba(236,233,254,0.9)]'
                    value={Number.isFinite(value) ? Number(value).toFixed(step < 1 ? 2 : 0) : ''}
                    onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isNaN(next) && onChange) onChange(next);
                    }}
                />
            </div>
            <div className='relative h-2 w-full overflow-hidden rounded-full bg-[rgba(148,163,184,0.15)]'>
                <div
                    className='absolute left-0 top-0 h-full rounded-full bg-[rgba(139,92,246,0.75)]'
                    style={{ width: `${clampedProgress}%` }}
                />
                <input
                    type='range'
                    min={min}
                    max={max}
                    step={step}
                    value={safeValue}
                    onChange={(event) => onChange?.(Number(event.target.value))}
                    className='absolute inset-0 h-2 w-full cursor-pointer opacity-0'
                />
            </div>
        </div>
    );
}

export default function InspectorPanel() {
    const mode = useCanvasStore((state) => state.mode);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const frames = useCanvasStore((state) => state.frames);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const inspectorSections = modeConfig.inspectorSections ?? [];

    const activeFrame = frames.find((frame) => frame.id === selectedFrameId);
    const activeElement = activeFrame?.elements?.find((el) => el.id === selectedElementId);

    const handleFramePropChange = (prop, next) => {
        if (!activeFrame) return;
        updateFrame(activeFrame.id, { [prop]: next });
    };

    const handleElementPropChange = (prop, next) => {
        if (!activeFrame || !activeElement) return;
        updateElementProps(activeFrame.id, activeElement.id, { [prop]: next });
    };

    const renderTransformControls = () => {
        if (!activeFrame) return null;

        if (activeElement) {
            const { props = {} } = activeElement;
            return (
                <section className='space-y-4'>
                    <SliderRow label='X Position' min={-4000} max={4000} value={props.x ?? 0} onChange={(next) => handleElementPropChange('x', next)} />
                    <SliderRow label='Y Position' min={-4000} max={4000} value={props.y ?? 0} onChange={(next) => handleElementPropChange('y', next)} />
                    {Number.isFinite(props.width) && (
                        <SliderRow label='Width' min={0} max={4000} value={props.width} onChange={(next) => handleElementPropChange('width', next)} />
                    )}
                    {Number.isFinite(props.height) && (
                        <SliderRow label='Height' min={0} max={4000} value={props.height} onChange={(next) => handleElementPropChange('height', next)} />
                    )}
                    <SliderRow label='Rotation' min={-180} max={180} value={props.rotation ?? 0} onChange={(next) => handleElementPropChange('rotation', next)} />
                    <SliderRow label='Opacity' min={0} max={1} step={0.01} value={props.opacity ?? 1} onChange={(next) => handleElementPropChange('opacity', next)} />
                </section>
            );
        }

        return (
            <section className='space-y-4'>
                <SliderRow label='Frame X' min={-4000} max={4000} value={activeFrame.x} onChange={(next) => handleFramePropChange('x', next)} />
                <SliderRow label='Frame Y' min={-4000} max={4000} value={activeFrame.y} onChange={(next) => handleFramePropChange('y', next)} />
                <SliderRow label='Frame Width' min={0} max={8000} value={activeFrame.width} onChange={(next) => handleFramePropChange('width', next)} />
                <SliderRow label='Frame Height' min={0} max={8000} value={activeFrame.height} onChange={(next) => handleFramePropChange('height', next)} />
            </section>
        );
    };

    return (
        <aside className='pointer-events-auto hidden h-full w-80 flex-col border-l border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.78)] px-5 py-6 text-sm text-[rgba(226,232,240,0.8)] backdrop-blur lg:flex'>
            <header className='mb-6 space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>Inspector</p>
                <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.6)] px-3 py-2'>
                    <p className='text-sm font-medium text-white'>{activeElement ? 'Element Selected' : 'Frame Selected'}</p>
                    <p className='text-xs text-[rgba(226,232,240,0.55)]'>
                        {activeElement?.id || activeFrame?.name || 'Nothing selected'}
                    </p>
                </div>
            </header>

            <div className='flex-1 space-y-4 overflow-y-auto pr-2'>
                <section className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                    <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>
                        Transform
                    </h3>
                    <div className='mt-3 space-y-4'>{renderTransformControls()}</div>
                </section>

                {inspectorSections.map((section) => (
                    <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                        <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                        <ul className='mt-3 space-y-2'>
                            {section.items.map((item) => (
                                <li
                                    key={item}
                                    className='flex items-center justify-between rounded-lg border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] px-3 py-2 text-xs text-[rgba(226,232,240,0.75)]'
                                >
                                    <span>{item}</span>
                                    <span className='text-[rgba(139,92,246,0.65)]'>Edit</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </aside>
    );
}
