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

function ColorRow({ label, value = '#ffffff', onChange }) {
    const safeValue = typeof value === 'string' && value.startsWith('#') ? value : '#ffffff';

    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs text-[rgba(226,232,240,0.65)]'>
                <span>{label}</span>
                <span className='rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-2 py-0.5 text-[rgba(236,233,254,0.9)]'>
                    {safeValue.toUpperCase()}
                </span>
            </div>
            <input
                type='color'
                value={safeValue}
                onChange={(event) => onChange?.(event.target.value)}
                className='h-10 w-full cursor-pointer rounded-lg border border-[rgba(148,163,184,0.2)] bg-transparent'
            />
        </div>
    );
}

function ImageInputRow({ label, value, onChange }) {
    const handleFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                onChange?.(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs text-[rgba(226,232,240,0.65)]'>
                <span>{label}</span>
                {value ? (
                    <button
                        type='button'
                        onClick={() => onChange?.(null)}
                        className='rounded-md border border-[rgba(139,92,246,0.35)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgba(236,233,254,0.85)] transition-colors hover:border-[rgba(236,233,254,0.7)]'
                    >
                        Clear
                    </button>
                ) : null}
            </div>
            <input
                type='text'
                value={value ?? ''}
                onChange={(event) => onChange?.(event.target.value || null)}
                placeholder='https://... or drop a file'
                className='w-full rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)]'
            />
            <label className='flex cursor-pointer items-center justify-center rounded-md border border-dashed border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.35)] px-3 py-2 text-xs font-medium text-[rgba(148,163,184,0.8)] hover:border-[rgba(139,92,246,0.45)] hover:text-[rgba(236,233,254,0.85)]'>
                Upload image
                <input type='file' accept='image/*' className='hidden' onChange={handleFile} />
            </label>
        </div>
    );
}

export default function InspectorPanel() {
    const mode = useCanvasStore((state) => state.mode);
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
    const updateFrame = useCanvasStore((state) => state.updateFrame);
    const updateElementProps = useCanvasStore((state) => state.updateElementProps);
    const groupSelectedElements = useCanvasStore((state) => state.groupSelectedElements);
    const ungroupElement = useCanvasStore((state) => state.ungroupElement);
    const liftElementOutOfGroup = useCanvasStore((state) => state.liftElementOutOfGroup);
    const setElementLink = useCanvasStore((state) => state.setElementLink);
    const setFrameBackground = useCanvasStore((state) => state.setFrameBackground);

    const modeConfig = MODE_CONFIG[mode] ?? MODE_CONFIG.design;
    const inspectorSections = modeConfig.inspectorSections ?? [];

    const activeFrame = frames.find((frame) => frame.id === selectedFrameId) ?? null;
    const selectedElements = activeFrame
        ? activeFrame.elements.filter((element) => selectedElementIds.includes(element.id))
        : [];
    const activeElement = selectedElements[0] ?? null;
    const activeElementProps = activeElement?.props ?? {};
    const selectionCount = selectedElementIds.length;
    const isGroup = activeElement?.type === 'group';
    const handleFramePropChange = (prop, next) => {
        if (!activeFrame) return;
        updateFrame(activeFrame.id, { [prop]: next });
    };

    const handleElementPropChange = (prop, next) => {
        if (!activeFrame || !activeElement) return;
        updateElementProps(activeFrame.id, activeElement.id, { [prop]: next });
    };

    const handleFrameBackgroundColor = (next) => {
        if (!activeFrame) return;
        setFrameBackground(activeFrame.id, { backgroundColor: next });
    };

    const handleFrameBackgroundImage = (next) => {
        if (!activeFrame) return;
        setFrameBackground(activeFrame.id, { backgroundImage: next });
    };

    const handleElementImage = (next) => {
        if (!activeFrame || !activeElement) return;
        updateElementProps(activeFrame.id, activeElement.id, { imageUrl: next });
    };

    const renderTransformControls = () => {
        if (!activeFrame) {
            return <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame to edit transform values.</p>;
        }

        if (activeElement) {
            return (
                <div className='space-y-4'>
                    {selectionCount > 1 ? (
                        <p className='rounded-md border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.12)] px-3 py-2 text-xs text-[rgba(236,233,254,0.75)]'>
                            Editing applies to the first selected element. Use group mode to move items together.
                        </p>
                    ) : null}
                    <SliderRow label='X Position' min={-4000} max={4000} value={activeElementProps.x ?? 0} onChange={(next) => handleElementPropChange('x', next)} />
                    <SliderRow label='Y Position' min={-4000} max={4000} value={activeElementProps.y ?? 0} onChange={(next) => handleElementPropChange('y', next)} />
                    {Number.isFinite(activeElementProps.width) ? (
                        <SliderRow label='Width' min={0} max={4000} value={activeElementProps.width ?? 0} onChange={(next) => handleElementPropChange('width', next)} />
                    ) : null}
                    {Number.isFinite(activeElementProps.height) ? (
                        <SliderRow label='Height' min={0} max={4000} value={activeElementProps.height ?? 0} onChange={(next) => handleElementPropChange('height', next)} />
                    ) : null}
                    <SliderRow label='Rotation' min={-180} max={180} value={activeElementProps.rotation ?? 0} onChange={(next) => handleElementPropChange('rotation', next)} />
                    <SliderRow label='Opacity' min={0} max={1} step={0.01} value={activeElementProps.opacity ?? 1} onChange={(next) => handleElementPropChange('opacity', next)} />
                </div>
            );
        }

        return (
            <div className='space-y-4'>
                <SliderRow label='Frame X' min={-4000} max={4000} value={activeFrame.x} onChange={(next) => handleFramePropChange('x', next)} />
                <SliderRow label='Frame Y' min={-4000} max={4000} value={activeFrame.y} onChange={(next) => handleFramePropChange('y', next)} />
                <SliderRow label='Frame Width' min={0} max={8000} value={activeFrame.width} onChange={(next) => handleFramePropChange('width', next)} />
                <SliderRow label='Frame Height' min={0} max={8000} value={activeFrame.height} onChange={(next) => handleFramePropChange('height', next)} />
            </div>
        );
    };

    const renderStyleControls = () => {
        if (activeElement) {
            return (
                <div className='space-y-4'>
                    {activeElementProps.fill ? (
                        <ColorRow label={activeElement.type === 'text' ? 'Text Color' : 'Fill Color'} value={activeElementProps.fill} onChange={(next) => handleElementPropChange('fill', next)} />
                    ) : null}
                    {activeElementProps.stroke ? (
                        <ColorRow label='Stroke Color' value={activeElementProps.stroke} onChange={(next) => handleElementPropChange('stroke', next)} />
                    ) : null}
                    {['rect', 'image', 'group'].includes(activeElement.type) ? (
                        <SliderRow
                            label='Corner Radius'
                            min={0}
                            max={200}
                            step={1}
                            value={activeElementProps.cornerRadius ?? 0}
                            onChange={(next) => handleElementPropChange('cornerRadius', next)}
                        />
                    ) : null}
                    {activeElementProps.stroke || activeElementProps.strokeWidth ? (
                        <SliderRow
                            label='Stroke Width'
                            min={0}
                            max={20}
                            step={1}
                            value={activeElementProps.strokeWidth ?? 0}
                            onChange={(next) => handleElementPropChange('strokeWidth', next)}
                        />
                    ) : null}
                    {['image'].includes(activeElement.type) || activeElementProps.imageUrl ? (
                        <ImageInputRow label='Image Source' value={activeElementProps.imageUrl ?? null} onChange={handleElementImage} />
                    ) : null}
                    <SliderRow
                        label='Element Opacity'
                        min={0}
                        max={1}
                        step={0.01}
                        value={activeElementProps.opacity ?? 1}
                        onChange={(next) => handleElementPropChange('opacity', next)}
                    />
                </div>
            );
        }

        if (!activeFrame) return null;

        return (
            <div className='space-y-4'>
                <ColorRow label='Background Color' value={activeFrame.backgroundColor ?? '#0F172A'} onChange={handleFrameBackgroundColor} />
                <ImageInputRow label='Background Image' value={activeFrame.backgroundImage ?? null} onChange={handleFrameBackgroundImage} />
                <SliderRow
                    label='Frame Opacity'
                    min={0}
                    max={1}
                    step={0.01}
                    value={activeFrame.opacity ?? 1}
                    onChange={(next) => handleFramePropChange('opacity', next)}
                />
            </div>
        );
    };

    const renderTypographyControls = () => {
        if (!activeElement || activeElement.type !== 'text') {
            return (
                <p className='text-xs text-[rgba(148,163,184,0.7)]'>
                    Select a text element to edit typography settings.
                </p>
            );
        }

        return (
            <div className='space-y-4'>
                <SliderRow label='Font Size' min={8} max={128} value={activeElementProps.fontSize ?? 16} onChange={(next) => handleElementPropChange('fontSize', next)} />
                <SliderRow
                    label='Font Weight'
                    min={100}
                    max={900}
                    step={100}
                    value={activeElementProps.fontWeight ?? (activeElementProps.fontStyle?.includes('bold') ? 600 : 400)}
                    onChange={(next) => handleElementPropChange('fontWeight', next)}
                />
                <SliderRow
                    label='Line Height'
                    min={0.5}
                    max={3}
                    step={0.05}
                    value={activeElementProps.lineHeight ?? 1.2}
                    onChange={(next) => handleElementPropChange('lineHeight', next)}
                />
                <SliderRow
                    label='Letter Spacing'
                    min={-10}
                    max={20}
                    step={0.25}
                    value={activeElementProps.letterSpacing ?? 0}
                    onChange={(next) => handleElementPropChange('letterSpacing', next)}
                />
            </div>
        );
    };

    const renderInteractionControls = () => {
        if (!activeFrame || !activeElement) return null;

        const options = frames.filter((frame) => frame.id !== activeFrame.id);

        return (
            <div className='space-y-3'>
                <label className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
                    <span className='uppercase tracking-[0.2em] text-[rgba(148,163,184,0.75)]'>Prototype link</span>
                    <select
                        value={activeElementProps.linkTarget ?? ''}
                        onChange={(event) => setElementLink(activeFrame.id, activeElement.id, event.target.value || null)}
                        className='rounded-lg border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)]'
                    >
                        <option value=''>No link</option>
                        {options.map((frame) => (
                            <option key={frame.id} value={frame.id}>
                                {frame.name}
                            </option>
                        ))}
                    </select>
                </label>
                <p className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                    Linked elements navigate in prototype preview.
                </p>
            </div>
        );
    };

    const renderGroupingActions = () => {
        if (!activeFrame) return null;

        const actions = [];
        if (selectionCount > 1) {
            actions.push(
                <button
                    key='group'
                    type='button'
                    onClick={() => groupSelectedElements()}
                    className='rounded-lg border border-[rgba(139,92,246,0.35)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.85)] transition-colors hover:border-[rgba(236,233,254,0.7)]'
                >
                    Group {selectionCount}
                </button>,
            );
        }
        if (isGroup && activeElement) {
            actions.push(
                <button
                    key='ungroup'
                    type='button'
                    onClick={() => ungroupElement(activeFrame.id, activeElement.id)}
                    className='rounded-lg border border-[rgba(59,130,246,0.35)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(191,219,254,0.9)] transition-colors hover:border-[rgba(191,219,254,0.75)]'
                >
                    Ungroup
                </button>,
            );
        }
        if (activeElement && activeElement.parentId) {
            actions.push(
                <button
                    key='lift'
                    type='button'
                    onClick={() => liftElementOutOfGroup(activeFrame.id, activeElement.id)}
                    className='rounded-lg border border-[rgba(148,163,184,0.3)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.8)] transition-colors hover:border-[rgba(226,232,240,0.7)]'
                >
                    Lift from group
                </button>,
            );
        }

        if (actions.length === 0) return null;

        return <div className='flex flex-wrap gap-2'>{actions.map((node) => node)}</div>;
    };

    const inspectorTitle = activeElement
        ? `${activeElement.type.charAt(0).toUpperCase()}${activeElement.type.slice(1)}${
              selectionCount > 1 ? ` (+${selectionCount - 1})` : ''
          }`
        : activeFrame?.name ?? 'Nothing selected';

    return (
        <aside className='pointer-events-auto hidden h-full w-80 flex-col border-l border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.78)] px-5 py-6 text-sm text-[rgba(226,232,240,0.8)] backdrop-blur lg:flex'>
            <header className='mb-6 space-y-2'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>Inspector</p>
                </div>
                <div className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.6)] px-3 py-2'>
                    <p className='text-sm font-medium text-white'>{inspectorTitle}</p>
                    <p className='text-xs text-[rgba(226,232,240,0.55)]'>
                        {selectionCount > 1 ? `${selectionCount} elements selected` : activeElement?.id || activeFrame?.id || 'Choose a frame or element'}
                    </p>
                </div>
                {renderGroupingActions()}
            </header>

            <div className='flex-1 space-y-4 overflow-y-auto pr-2'>
                <section className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                    <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>Transform</h3>
                    <div className='mt-3 space-y-4'>{renderTransformControls()}</div>
                </section>

                {inspectorSections.map((section) => {
                    if (['style', 'appearance', 'effects'].includes(section.id)) {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-4'>{renderStyleControls()}</div>
                            </section>
                        );
                    }

                    if (section.id === 'typography') {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-4'>{renderTypographyControls()}</div>
                            </section>
                        );
                    }

                    if (section.id === 'interaction') {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-4'>{renderInteractionControls()}</div>
                            </section>
                        );
                    }

                    return (
                        <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                            <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                            <ul className='mt-3 space-y-2'>
                                {section.items?.map((item) => (
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
                    );
                })}
            </div>
        </aside>
    );
}
