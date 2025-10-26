'use client';

import clsx from 'clsx';
import { useState } from 'react';
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

function NumberInputRow({ label, value = 0, min, max, step = 1, suffix, onChange, disabled = false }) {
    const handleChange = (event) => {
        if (disabled) return;
        const next = Number(event.target.value);
        if (Number.isNaN(next)) return;
        if (Number.isFinite(min) && next < min) {
            onChange?.(min);
            return;
        }
        if (Number.isFinite(max) && next > max) {
            onChange?.(max);
            return;
        }
        onChange?.(next);
    };

    return (
        <label
            className={clsx(
                'flex items-center justify-between gap-3 text-xs text-[rgba(226,232,240,0.7)]',
                disabled && 'opacity-60',
            )}
        >
            <span className='uppercase tracking-[0.2em]'>{label}</span>
            <div className='flex items-center gap-2'>
                <input
                    type='number'
                    value={Number.isFinite(value) ? value : ''}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleChange}
                    disabled={disabled}
                    className={clsx(
                        'w-20 rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-2 py-1 text-right text-[rgba(236,233,254,0.9)]',
                        disabled && 'cursor-not-allowed',
                    )}
                />
                {suffix ? <span className='text-[rgba(148,163,184,0.8)]'>{suffix}</span> : null}
            </div>
        </label>
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

function SelectRow({ label, value = '', options = [], onChange }) {
    return (
        <label className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
            <span>{label}</span>
            <select
                value={value ?? ''}
                onChange={(event) => onChange?.(event.target.value)}
                className='rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)]'
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function SegmentedControl({ label, value, options = [], onChange }) {
    return (
        <div className='space-y-2'>
            {label ? (
                <div className='text-xs font-medium uppercase tracking-[0.15em] text-[rgba(148,163,184,0.7)]'>
                    {label}
                </div>
            ) : null}
            <div className='flex flex-wrap gap-1'>
                {options.map((option) => {
                    const isActive = option.value === value;
                    return (
                        <button
                            key={option.value}
                            type='button'
                            onClick={() => onChange?.(option.value)}
                            className={clsx(
                                'flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
                                isActive
                                    ? 'border-[rgba(236,233,254,0.85)] bg-[rgba(139,92,246,0.25)] text-white shadow-[0_0_0_1px_rgba(236,233,254,0.35)]'
                                    : 'border-[rgba(148,163,184,0.25)] text-[rgba(226,232,240,0.75)] hover:border-[rgba(236,233,254,0.6)]',
                            )}
                        >
                            {option.icon ? <span>{option.icon}</span> : null}
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const DEFAULT_GRID_COLUMNS = 3;
const DEFAULT_GRID_AUTO_ROWS = 240;
const DEFAULT_GRID_MIN_COLUMN_WIDTH = 240;

const FILL_TYPE_OPTIONS = [
    { value: 'solid', label: 'Solid' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'image', label: 'Image' },
    { value: 'pattern', label: 'Pattern' },
];

const GRADIENT_TYPE_OPTIONS = [
    { value: 'linear', label: 'Linear' },
    { value: 'radial', label: 'Radial' },
    { value: 'conic', label: 'Conic' },
];

const PATTERN_REPEAT_OPTIONS = [
    { value: 'repeat', label: 'Repeat' },
    { value: 'repeat-x', label: 'Repeat X' },
    { value: 'repeat-y', label: 'Repeat Y' },
    { value: 'no-repeat', label: 'No Repeat' },
];

const IMAGE_FIT_OPTIONS = [
    { value: 'cover', label: 'Cover' },
    { value: 'contain', label: 'Contain' },
    { value: 'fill', label: 'Fill' },
    { value: 'auto', label: 'Auto' },
];

const BLEND_MODE_OPTIONS = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'darken', label: 'Darken' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
    { value: 'luminosity', label: 'Luminosity' },
];

const BACKGROUND_BLEND_OPTIONS = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'darken', label: 'Darken' },
];

const TEXT_FILL_TYPE_OPTIONS = [
    { value: 'solid', label: 'Solid' },
    { value: 'gradient', label: 'Gradient' },
];

const TEXT_TRANSFORM_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'Uppercase' },
    { value: 'lowercase', label: 'Lowercase' },
    { value: 'capitalize', label: 'Title Case' },
];

const TEXT_ALIGN_OPTIONS = [
    { value: 'left', label: 'Left', icon: '⬅️' },
    { value: 'center', label: 'Center', icon: '⬇️' },
    { value: 'right', label: 'Right', icon: '➡️' },
    { value: 'justify', label: 'Justify', icon: '☰' },
];

const GRID_AUTO_FIT_OPTIONS = [
    { value: 'none', label: 'Fixed Columns' },
    { value: 'auto-fit', label: 'Auto Fit' },
    { value: 'auto-fill', label: 'Auto Fill' },
];
const GRID_AUTO_FIT_VALUES = GRID_AUTO_FIT_OPTIONS.map((option) => option.value);

const FLEX_WRAP_OPTIONS = [
    { value: 'nowrap', label: 'No Wrap' },
    { value: 'wrap', label: 'Wrap' },
    { value: 'wrap-reverse', label: 'Wrap Reverse' },
];

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
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);
    const bringElementForward = useCanvasStore((state) => state.bringElementForward);
    const sendElementBackward = useCanvasStore((state) => state.sendElementBackward);
    const bringElementToFront = useCanvasStore((state) => state.bringElementToFront);
    const sendElementToBack = useCanvasStore((state) => state.sendElementToBack);
    const alignElements = useCanvasStore((state) => state.alignSelectedElements);
    const distributeElements = useCanvasStore((state) => state.distributeSelectedElements);
    const setFrameLayout = useCanvasStore((state) => state.setFrameLayout);
    const setElementLayout = useCanvasStore((state) => state.setElementLayout);
    const setGroupLayout = useCanvasStore((state) => state.setGroupLayout);

    const [showCornerDetails, setShowCornerDetails] = useState(false);
    const [showShadowDetails, setShowShadowDetails] = useState(false);
    const [showFilterDetails, setShowFilterDetails] = useState(false);
    const [showTypographyAdvanced, setShowTypographyAdvanced] = useState(false);

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

    const handleLayerAction = (action) => {
        if (!activeFrame || !activeElement) return;
        action(activeFrame.id, activeElement.id);
    };

    const handleFlip = (axis) => {
        if (!activeFrame || !activeElement) return;
        const key = axis === 'horizontal' ? 'scaleX' : 'scaleY';
        const current = Number.isFinite(activeElementProps[key]) ? activeElementProps[key] : 1;
        const next = current === 0 ? -1 : -current;
        handleElementPropChange(key, next);
    };

    const handleVisibilityToggle = () => {
        if (!activeFrame || !activeElement) return;
        const isVisible = activeElementProps.visible !== false;
        handleElementPropChange('visible', !isVisible);
    };

    const handleCornerRadiusChange = (cornerKey, next) => {
        if (!activeFrame || !activeElement) return;
        const current = activeElementProps.cornerRadius;
        const base =
            typeof current === 'object' && current !== null
                ? current
                : {
                      topLeft: Number.isFinite(current) ? current : 0,
                      topRight: Number.isFinite(current) ? current : 0,
                      bottomRight: Number.isFinite(current) ? current : 0,
                      bottomLeft: Number.isFinite(current) ? current : 0,
                  };
        handleElementPropChange('cornerRadius', {
            ...base,
            [cornerKey]: Math.max(0, next),
        });
    };

    const getCornerValue = (cornerKey) => {
        const value = activeElementProps.cornerRadius;
        if (typeof value === 'object' && value !== null) {
            const corner = value[cornerKey];
            return Number.isFinite(corner) ? corner : 0;
        }
        if (Number.isFinite(value)) return value;
        return 0;
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
                    <div className='grid grid-cols-2 gap-3'>
                        <SliderRow label='Scale X' min={-4} max={4} step={0.05} value={activeElementProps.scaleX ?? 1} onChange={(next) => handleElementPropChange('scaleX', next)} />
                        <SliderRow label='Scale Y' min={-4} max={4} step={0.05} value={activeElementProps.scaleY ?? 1} onChange={(next) => handleElementPropChange('scaleY', next)} />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                        <SliderRow label='Skew X' min={-75} max={75} step={1} value={activeElementProps.skewX ?? 0} onChange={(next) => handleElementPropChange('skewX', next)} />
                        <SliderRow label='Skew Y' min={-75} max={75} step={1} value={activeElementProps.skewY ?? 0} onChange={(next) => handleElementPropChange('skewY', next)} />
                    </div>
                    <SliderRow label='Opacity' min={0} max={1} step={0.01} value={activeElementProps.opacity ?? 1} onChange={(next) => handleElementPropChange('opacity', next)} />
                    <div className='flex flex-wrap gap-2'>
                        <button
                            type='button'
                            onClick={() => handleFlip('horizontal')}
                            className='flex-1 rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                        >
                            Flip H
                        </button>
                        <button
                            type='button'
                            onClick={() => handleFlip('vertical')}
                            className='flex-1 rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                        >
                            Flip V
                        </button>
                        <button
                            type='button'
                            onClick={handleVisibilityToggle}
                            className='flex-1 rounded-lg border border-[rgba(59,130,246,0.35)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(191,219,254,0.92)] transition-colors hover:border-[rgba(191,219,254,0.75)]'
                        >
                            {activeElementProps.visible === false ? 'Show Element' : 'Hide Element'}
                        </button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        <button
                            type='button'
                            onClick={() => handleLayerAction(sendElementBackward)}
                            className='rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                        >
                            Send Backward
                        </button>
                        <button
                            type='button'
                            onClick={() => handleLayerAction(bringElementForward)}
                            className='rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                        >
                            Bring Forward
                        </button>
                        <button
                            type='button'
                            onClick={() => handleLayerAction(sendElementToBack)}
                            className='rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                        >
                            Send to Back
                        </button>
                        <button
                            type='button'
                            onClick={() => handleLayerAction(bringElementToFront)}
                            className='rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                        >
                            Bring to Front
                        </button>
                    </div>
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
            if (activeElement.type === 'text') {
                return (
                    <div className='rounded-lg border border-dashed border-[rgba(148,163,184,0.25)] bg-[rgba(30,41,59,0.45)] px-3 py-2 text-[11px] text-[rgba(148,163,184,0.7)]'>
                        Typography controls below manage text color, gradients, and effects.
                    </div>
                );
            }

            const fillType = activeElementProps.fillType ?? (activeElementProps.imageUrl ? 'image' : 'solid');
            const gradientType = activeElementProps.gradientType ?? 'linear';

            return (
                <div className='space-y-4'>
                    <SegmentedControl label='Fill Type' value={fillType} options={FILL_TYPE_OPTIONS} onChange={(next) => handleElementPropChange('fillType', next)} />
                    <ColorRow label='Base Color' value={activeElementProps.fill ?? '#8B5CF6'} onChange={(next) => handleElementPropChange('fill', next)} />
                    {fillType === 'gradient' ? (
                        <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                            <SelectRow label='Gradient Type' value={gradientType} options={GRADIENT_TYPE_OPTIONS} onChange={(next) => handleElementPropChange('gradientType', next)} />
                            <ColorRow label='Start Color' value={activeElementProps.gradientStart ?? '#8B5CF6'} onChange={(next) => handleElementPropChange('gradientStart', next)} />
                            <ColorRow label='End Color' value={activeElementProps.gradientEnd ?? '#3B82F6'} onChange={(next) => handleElementPropChange('gradientEnd', next)} />
                            <SliderRow label='Angle' min={0} max={360} step={1} value={activeElementProps.gradientAngle ?? 45} onChange={(next) => handleElementPropChange('gradientAngle', next)} />
                        </div>
                    ) : null}
                    {['image', 'pattern'].includes(fillType) ? (
                        <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                            <ImageInputRow label='Image Source' value={activeElementProps.imageUrl ?? null} onChange={handleElementImage} />
                            {fillType === 'pattern' ? (
                                <>
                                    <SliderRow label='Pattern Scale' min={0.1} max={4} step={0.05} value={activeElementProps.patternScale ?? 1} onChange={(next) => handleElementPropChange('patternScale', next)} />
                                    <div className='grid grid-cols-2 gap-3'>
                                        <SliderRow label='Offset X' min={-500} max={500} step={1} value={activeElementProps.patternOffsetX ?? 0} onChange={(next) => handleElementPropChange('patternOffsetX', next)} />
                                        <SliderRow label='Offset Y' min={-500} max={500} step={1} value={activeElementProps.patternOffsetY ?? 0} onChange={(next) => handleElementPropChange('patternOffsetY', next)} />
                                    </div>
                                    <SelectRow label='Repeat' value={activeElementProps.patternRepeat ?? 'repeat'} options={PATTERN_REPEAT_OPTIONS} onChange={(next) => handleElementPropChange('patternRepeat', next)} />
                                </>
                            ) : (
                                <SelectRow label='Object Fit' value={activeElementProps.backgroundFit ?? 'cover'} options={IMAGE_FIT_OPTIONS} onChange={(next) => handleElementPropChange('backgroundFit', next)} />
                            )}
                        </div>
                    ) : null}
                    {['rect', 'image', 'group'].includes(activeElement.type) ? (
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>
                                <span>Corner Radius</span>
                                <button
                                    type='button'
                                    onClick={() => setShowCornerDetails((value) => !value)}
                                    className='rounded-md border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.75)] hover:border-[rgba(236,233,254,0.65)]'
                                >
                                    {showCornerDetails ? 'Uniform' : 'Per Corner'}
                                </button>
                            </div>
                            {showCornerDetails ? (
                                <div className='grid grid-cols-2 gap-3'>
                                    <SliderRow label='Top Left' min={0} max={320} step={1} value={getCornerValue('topLeft')} onChange={(next) => handleCornerRadiusChange('topLeft', next)} />
                                    <SliderRow label='Top Right' min={0} max={320} step={1} value={getCornerValue('topRight')} onChange={(next) => handleCornerRadiusChange('topRight', next)} />
                                    <SliderRow label='Bottom Left' min={0} max={320} step={1} value={getCornerValue('bottomLeft')} onChange={(next) => handleCornerRadiusChange('bottomLeft', next)} />
                                    <SliderRow label='Bottom Right' min={0} max={320} step={1} value={getCornerValue('bottomRight')} onChange={(next) => handleCornerRadiusChange('bottomRight', next)} />
                                </div>
                            ) : (
                                <SliderRow
                                    label='Radius'
                                    min={0}
                                    max={320}
                                    step={1}
                                    value={
                                        Number.isFinite(activeElementProps.cornerRadius)
                                            ? activeElementProps.cornerRadius
                                            : getCornerValue('topLeft')
                                    }
                                    onChange={(next) => handleElementPropChange('cornerRadius', Math.max(0, next))}
                                />
                            )}
                        </div>
                    ) : null}
                    <div className='grid grid-cols-2 gap-3'>
                        <ColorRow label='Stroke Color' value={activeElementProps.stroke ?? '#FFFFFF'} onChange={(next) => handleElementPropChange('stroke', next)} />
                        <SliderRow label='Stroke Width' min={0} max={24} step={0.5} value={activeElementProps.strokeWidth ?? 0} onChange={(next) => handleElementPropChange('strokeWidth', next)} />
                    </div>
                    <SelectRow label='Blend Mode' value={activeElementProps.blendMode ?? 'normal'} options={BLEND_MODE_OPTIONS} onChange={(next) => handleElementPropChange('blendMode', next)} />
                    <SelectRow label='Background Blend' value={activeElementProps.backgroundBlendMode ?? 'normal'} options={BACKGROUND_BLEND_OPTIONS} onChange={(next) => handleElementPropChange('backgroundBlendMode', next)} />
                    <button
                        type='button'
                        onClick={() => setActiveToolOverlay('ai-style')}
                        className='w-full rounded-lg border border-[rgba(139,92,246,0.45)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.9)] transition-colors hover:border-[rgba(236,233,254,0.85)]'
                    >
                        AI Match Brand Theme
                    </button>
                </div>
            );
        }

        if (!activeFrame) return null;

        const frameFillType = activeFrame.backgroundFillType ?? (activeFrame.backgroundImage ? 'image' : 'solid');

        return (
            <div className='space-y-4'>
                <SegmentedControl
                    label='Frame Fill'
                    value={frameFillType}
                    options={FILL_TYPE_OPTIONS}
                    onChange={(next) =>
                        setFrameBackground(activeFrame.id, {
                            backgroundFillType: next,
                        })
                    }
                />
                <ColorRow label='Background Color' value={activeFrame.backgroundColor ?? '#0F172A'} onChange={handleFrameBackgroundColor} />
                {frameFillType === 'gradient' ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <SelectRow
                            label='Gradient Type'
                            value={activeFrame.backgroundGradientType ?? 'linear'}
                            options={GRADIENT_TYPE_OPTIONS}
                            onChange={(next) =>
                                setFrameBackground(activeFrame.id, {
                                    backgroundGradientType: next,
                                })
                            }
                        />
                        <ColorRow
                            label='Gradient Start'
                            value={activeFrame.backgroundGradientStart ?? '#8B5CF6'}
                            onChange={(next) =>
                                setFrameBackground(activeFrame.id, {
                                    backgroundGradientStart: next,
                                })
                            }
                        />
                        <ColorRow
                            label='Gradient End'
                            value={activeFrame.backgroundGradientEnd ?? '#3B82F6'}
                            onChange={(next) =>
                                setFrameBackground(activeFrame.id, {
                                    backgroundGradientEnd: next,
                                })
                            }
                        />
                        <SliderRow
                            label='Angle'
                            min={0}
                            max={360}
                            step={1}
                            value={activeFrame.backgroundGradientAngle ?? 45}
                            onChange={(next) =>
                                setFrameBackground(activeFrame.id, {
                                    backgroundGradientAngle: next,
                                })
                            }
                        />
                    </div>
                ) : null}
                {['image', 'pattern'].includes(frameFillType) ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ImageInputRow
                            label='Background Image'
                            value={activeFrame.backgroundImage ?? null}
                            onChange={(next) => setFrameBackground(activeFrame.id, { backgroundImage: next })}
                        />
                        {frameFillType === 'pattern' ? (
                            <>
                                <SliderRow
                                    label='Pattern Scale'
                                    min={0.1}
                                    max={4}
                                    step={0.05}
                                    value={activeFrame.backgroundPatternScale ?? 1}
                                    onChange={(next) =>
                                        setFrameBackground(activeFrame.id, {
                                            backgroundPatternScale: next,
                                        })
                                    }
                                />
                                <div className='grid grid-cols-2 gap-3'>
                                    <SliderRow
                                        label='Offset X'
                                        min={-500}
                                        max={500}
                                        step={1}
                                        value={activeFrame.backgroundPatternOffsetX ?? 0}
                                        onChange={(next) =>
                                            setFrameBackground(activeFrame.id, {
                                                backgroundPatternOffsetX: next,
                                            })
                                        }
                                    />
                                    <SliderRow
                                        label='Offset Y'
                                        min={-500}
                                        max={500}
                                        step={1}
                                        value={activeFrame.backgroundPatternOffsetY ?? 0}
                                        onChange={(next) =>
                                            setFrameBackground(activeFrame.id, {
                                                backgroundPatternOffsetY: next,
                                            })
                                        }
                                    />
                                </div>
                                <SelectRow
                                    label='Repeat'
                                    value={activeFrame.backgroundPatternRepeat ?? 'repeat'}
                                    options={PATTERN_REPEAT_OPTIONS}
                                    onChange={(next) =>
                                        setFrameBackground(activeFrame.id, {
                                            backgroundPatternRepeat: next,
                                        })
                                    }
                                />
                            </>
                        ) : (
                            <SelectRow
                                label='Object Fit'
                                value={activeFrame.backgroundFit ?? 'cover'}
                                options={IMAGE_FIT_OPTIONS}
                                onChange={(next) => setFrameBackground(activeFrame.id, { backgroundFit: next })}
                            />
                        )}
                    </div>
                ) : null}
                <SelectRow
                    label='Background Blend'
                    value={activeFrame.backgroundBlendMode ?? 'normal'}
                    options={BACKGROUND_BLEND_OPTIONS}
                    onChange={(next) => setFrameBackground(activeFrame.id, { backgroundBlendMode: next })}
                />
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay('ai-style')}
                    className='w-full rounded-lg border border-[rgba(139,92,246,0.45)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.9)] transition-colors hover:border-[rgba(236,233,254,0.85)]'
                >
                    AI Tune Background
                </button>
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

    const renderEffectsControls = () => {
        if (!activeElement) {
            return <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select an element to configure shadows, blur, and filters.</p>;
        }

        return (
            <div className='space-y-4'>
                <ColorRow label='Shadow Color' value={activeElementProps.shadowColor ?? '#000000'} onChange={(next) => handleElementPropChange('shadowColor', next)} />
                <div className='grid grid-cols-2 gap-3'>
                    <SliderRow label='Offset X' min={-200} max={200} step={1} value={activeElementProps.shadowOffsetX ?? 0} onChange={(next) => handleElementPropChange('shadowOffsetX', next)} />
                    <SliderRow label='Offset Y' min={-200} max={200} step={1} value={activeElementProps.shadowOffsetY ?? 0} onChange={(next) => handleElementPropChange('shadowOffsetY', next)} />
                </div>
                <SliderRow label='Shadow Blur' min={0} max={200} step={1} value={activeElementProps.shadowBlur ?? 0} onChange={(next) => handleElementPropChange('shadowBlur', next)} />
                <SliderRow label='Shadow Spread' min={-50} max={50} step={1} value={activeElementProps.shadowSpread ?? 0} onChange={(next) => handleElementPropChange('shadowSpread', next)} />
                <button
                    type='button'
                    onClick={() => setShowShadowDetails((value) => !value)}
                    className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                >
                    {showShadowDetails ? 'Hide Glow Controls' : 'Show Glow Controls'}
                </button>
                {showShadowDetails ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ColorRow label='Glow Color' value={activeElementProps.glowColor ?? '#8B5CF6'} onChange={(next) => handleElementPropChange('glowColor', next)} />
                        <SliderRow label='Glow Blur' min={0} max={200} step={1} value={activeElementProps.glowBlur ?? 24} onChange={(next) => handleElementPropChange('glowBlur', next)} />
                    </div>
                ) : null}
                <SliderRow label='Gaussian Blur' min={0} max={100} step={1} value={activeElementProps.blur ?? 0} onChange={(next) => handleElementPropChange('blur', next)} />
                <button
                    type='button'
                    onClick={() => setShowFilterDetails((value) => !value)}
                    className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                >
                    {showFilterDetails ? 'Hide Color Adjustments' : 'Show Color Adjustments'}
                </button>
                {showFilterDetails ? (
                    <div className='grid grid-cols-2 gap-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <SliderRow label='Brightness' min={0} max={200} step={1} value={activeElementProps.brightness ?? 100} onChange={(next) => handleElementPropChange('brightness', next)} />
                        <SliderRow label='Contrast' min={0} max={200} step={1} value={activeElementProps.contrast ?? 100} onChange={(next) => handleElementPropChange('contrast', next)} />
                        <SliderRow label='Saturation' min={0} max={200} step={1} value={activeElementProps.saturation ?? 100} onChange={(next) => handleElementPropChange('saturation', next)} />
                        <SliderRow label='Hue Rotate' min={-180} max={180} step={1} value={activeElementProps.hueRotate ?? 0} onChange={(next) => handleElementPropChange('hueRotate', next)} />
                    </div>
                ) : null}
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay('ai-effects')}
                    className='w-full rounded-lg border border-[rgba(59,130,246,0.45)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(191,219,254,0.95)] transition-colors hover:border-[rgba(191,219,254,0.85)]'
                >
                    AI Auto Enhance
                </button>
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

        const textFillType = activeElementProps.textFillType ?? 'solid';
        const alignValue = activeElementProps.align ?? 'left';

        return (
            <div className='space-y-4'>
                <label className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
                    <span>Font Family</span>
                    <input
                        type='text'
                        value={activeElementProps.fontFamily ?? ''}
                        onChange={(event) => handleElementPropChange('fontFamily', event.target.value)}
                        placeholder='Inter, Satoshi, etc.'
                        className='rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)]'
                    />
                </label>
                <SliderRow label='Font Size' min={8} max={180} value={activeElementProps.fontSize ?? 16} onChange={(next) => handleElementPropChange('fontSize', next)} />
                <SliderRow
                    label='Font Weight'
                    min={100}
                    max={900}
                    step={100}
                    value={activeElementProps.fontWeight ?? (activeElementProps.fontStyle?.includes('bold') ? 600 : 400)}
                    onChange={(next) => handleElementPropChange('fontWeight', next)}
                />
                <div className='grid grid-cols-2 gap-3'>
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
                <SegmentedControl
                    label='Text Fill'
                    value={textFillType}
                    options={TEXT_FILL_TYPE_OPTIONS}
                    onChange={(next) => handleElementPropChange('textFillType', next)}
                />
                {textFillType === 'solid' ? (
                    <ColorRow label='Text Color' value={activeElementProps.fill ?? '#ECE9FE'} onChange={(next) => handleElementPropChange('fill', next)} />
                ) : (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ColorRow label='Gradient Start' value={activeElementProps.textGradientStart ?? '#8B5CF6'} onChange={(next) => handleElementPropChange('textGradientStart', next)} />
                        <ColorRow label='Gradient End' value={activeElementProps.textGradientEnd ?? '#3B82F6'} onChange={(next) => handleElementPropChange('textGradientEnd', next)} />
                        <SliderRow label='Gradient Angle' min={0} max={360} step={1} value={activeElementProps.textGradientAngle ?? 45} onChange={(next) => handleElementPropChange('textGradientAngle', next)} />
                    </div>
                )}
                <SegmentedControl
                    label='Alignment'
                    value={alignValue}
                    options={TEXT_ALIGN_OPTIONS}
                    onChange={(next) => handleElementPropChange('align', next)}
                />
                <SelectRow
                    label='Text Transform'
                    value={activeElementProps.textTransform ?? 'none'}
                    options={TEXT_TRANSFORM_OPTIONS}
                    onChange={(next) => handleElementPropChange('textTransform', next)}
                />
                <button
                    type='button'
                    onClick={() => setShowTypographyAdvanced((value) => !value)}
                    className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                >
                    {showTypographyAdvanced ? 'Hide Shadow Controls' : 'Show Shadow Controls'}
                </button>
                {showTypographyAdvanced ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ColorRow label='Text Shadow' value={activeElementProps.textShadowColor ?? '#000000'} onChange={(next) => handleElementPropChange('textShadowColor', next)} />
                        <div className='grid grid-cols-3 gap-3'>
                            <SliderRow label='Blur' min={0} max={60} step={1} value={activeElementProps.textShadowBlur ?? 0} onChange={(next) => handleElementPropChange('textShadowBlur', next)} />
                            <SliderRow label='Offset X' min={-50} max={50} step={1} value={activeElementProps.textShadowX ?? 0} onChange={(next) => handleElementPropChange('textShadowX', next)} />
                            <SliderRow label='Offset Y' min={-50} max={50} step={1} value={activeElementProps.textShadowY ?? 0} onChange={(next) => handleElementPropChange('textShadowY', next)} />
                        </div>
                    </div>
                ) : null}
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay('ai-typography')}
                    className='w-full rounded-lg border border-[rgba(139,92,246,0.45)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(236,233,254,0.9)] transition-colors hover:border-[rgba(236,233,254,0.85)]'
                >
                    AI Suggest Font Pair
                </button>
            </div>
        );
    };

    const renderLayoutControls = () => {
        if (!activeFrame) {
            return <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame and elements to align.</p>;
        }

        const isGroupContainer = activeElement?.type === 'group';
        const containerLayoutMode = isGroupContainer
            ? activeElement.layoutMode ?? 'absolute'
            : activeFrame.layoutMode ?? 'absolute';
        const rawGap = isGroupContainer ? activeElement.layoutGap : activeFrame.layoutGap;
        const rawRowGap = isGroupContainer ? activeElement.layoutRowGap : activeFrame.layoutRowGap;
        const rawColumns = isGroupContainer ? activeElement.layoutGridColumns : activeFrame.layoutGridColumns;
        const rawAutoRows = isGroupContainer ? activeElement.layoutGridAutoRows : activeFrame.layoutGridAutoRows;
        const rawAlign = isGroupContainer ? activeElement.layoutAlign : activeFrame.layoutAlign;
        const rawCrossAlign = isGroupContainer ? activeElement.layoutCrossAlign : activeFrame.layoutCrossAlign;
        const rawWrap = isGroupContainer ? activeElement.layoutWrap : activeFrame.layoutWrap;
        const rawPadding = isGroupContainer ? activeElement.layoutPadding : activeFrame.layoutPadding;
        const rawAutoFit = isGroupContainer ? activeElement.layoutGridAutoFit : activeFrame.layoutGridAutoFit;
        const rawMinColumnWidth = isGroupContainer
            ? activeElement.layoutGridMinColumnWidth
            : activeFrame.layoutGridMinColumnWidth;
        const layoutGap = Number.isFinite(rawGap) ? rawGap : 0;
        const layoutRowGap = Number.isFinite(rawRowGap) ? rawRowGap : layoutGap;
        const layoutGridColumns = Number.isFinite(rawColumns) ? rawColumns : DEFAULT_GRID_COLUMNS;
        const layoutGridAutoRows = Number.isFinite(rawAutoRows) ? rawAutoRows : DEFAULT_GRID_AUTO_ROWS;
        const layoutAlign = rawAlign ?? 'start';
        const layoutCrossAlign = rawCrossAlign ?? 'stretch';
        const layoutWrap = typeof rawWrap === 'string' ? rawWrap : 'nowrap';
        const padding = rawPadding ?? {};
        const layoutGridAutoFit = GRID_AUTO_FIT_VALUES.includes(rawAutoFit) ? rawAutoFit : 'none';
        const layoutGridMinColumnWidth = Number.isFinite(rawMinColumnWidth)
            ? rawMinColumnWidth
            : DEFAULT_GRID_MIN_COLUMN_WIDTH;
        const disableAlign = selectionCount === 0;
        const disableDistribute = selectionCount < 3;
        const isFlexRow = containerLayoutMode === 'flex-row';
        const isFlexLayout = containerLayoutMode === 'flex-row' || containerLayoutMode === 'flex-column';
        const isGridLayout = containerLayoutMode === 'grid';
        const isAutoLayout = containerLayoutMode !== 'absolute';
        const mainAxisLabel = isFlexRow ? 'Horizontal Align' : 'Vertical Align';
        const crossAxisLabel = isFlexRow ? 'Vertical Align' : 'Horizontal Align';
        const basisLabel = isFlexRow ? 'Basis (Width)' : 'Basis (Height)';
        const basisFallback = isFlexRow
            ? Number.isFinite(activeElementProps.width)
                ? activeElementProps.width
                : 0
            : Number.isFinite(activeElementProps.height)
                ? activeElementProps.height
                : 0;
        const hasAutoFit = layoutGridAutoFit !== 'none';
        const showFixedColumnCount = !hasAutoFit;
        const layoutSectionLabel = isGroupContainer ? 'Group Layout' : 'Frame Layout';
        const updateContainerLayout = (payload) => {
            if (!activeFrame) return;
            if (isGroupContainer && activeElement) {
                setGroupLayout(activeFrame.id, activeElement.id, payload);
            } else {
                setFrameLayout(activeFrame.id, payload);
            }
        };

        const alignButtonClass = (disabled) =>
            clsx(
                'rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors',
                disabled
                    ? 'cursor-not-allowed border-[rgba(148,163,184,0.2)] text-[rgba(148,163,184,0.5)]'
                    : 'border-[rgba(148,163,184,0.25)] hover:border-[rgba(236,233,254,0.65)]',
            );

        const frameLayoutOptions = [
            { value: 'absolute', label: 'Free' },
            { value: 'flex-column', label: 'Stack (Flex Column)' },
            { value: 'flex-row', label: 'Row (Flex Row)' },
            { value: 'grid', label: 'Grid' },
        ];

        const axisAlignOptions = [
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'End' },
            { value: 'space-between', label: 'Space Between' },
        ];

        const crossAlignOptions = [
            { value: 'stretch', label: 'Stretch' },
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'End' },
        ];

        const currentElementLayout = activeElement?.layout ?? {};
        const applyLayoutToSelection = (updates) => {
            if (!activeFrame) return;
            const targets =
                selectionCount > 1
                    ? selectedElements
                    : activeElement
                        ? [activeElement]
                        : [];
            targets.forEach((target) => {
                setElementLayout(activeFrame.id, target.id, updates);
            });
        };
        const deriveAlignSelf = () => {
            if (selectionCount > 1 && selectedElements.length > 1) {
                const first = selectedElements[0]?.layout?.alignSelf ?? null;
                const consistent = selectedElements.every(
                    (item) => (item.layout?.alignSelf ?? null) === first,
                );
                if (!consistent) return 'mixed';
                return first ?? 'auto';
            }
            return currentElementLayout.alignSelf !== null && currentElementLayout.alignSelf !== undefined
                ? currentElementLayout.alignSelf
                : 'auto';
        };
        const currentAlignSelf = deriveAlignSelf();

        return (
            <div className='space-y-6'>
                <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.45)] px-3 py-3'>
                    <h4 className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.75)]'>{layoutSectionLabel}</h4>
                    <SegmentedControl
                        value={containerLayoutMode}
                        options={frameLayoutOptions}
                        onChange={(next) => updateContainerLayout({ layoutMode: next })}
                    />
                    {isAutoLayout ? (
                        <div className='space-y-4'>
                            <SliderRow
                                label={isGridLayout ? 'Column Gap' : 'Gap'}
                                min={0}
                                max={320}
                                step={4}
                                value={layoutGap}
                                onChange={(next) => updateContainerLayout({ layoutGap: next })}
                            />
                            <SegmentedControl
                                label={mainAxisLabel}
                                value={layoutAlign}
                                options={axisAlignOptions}
                                onChange={(next) => updateContainerLayout({ layoutAlign: next })}
                            />
                            <SegmentedControl
                                label={crossAxisLabel}
                                value={layoutCrossAlign}
                                options={crossAlignOptions}
                                onChange={(next) => updateContainerLayout({ layoutCrossAlign: next })}
                            />
                            {isFlexLayout ? (
                                <SegmentedControl
                                    label='Flex Wrap'
                                    value={layoutWrap}
                                    options={FLEX_WRAP_OPTIONS}
                                    onChange={(next) => updateContainerLayout({ layoutWrap: next })}
                                />
                            ) : null}
                            {isGridLayout ? (
                                <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                                    <SelectRow
                                        label='Column Behavior'
                                        value={layoutGridAutoFit}
                                        options={GRID_AUTO_FIT_OPTIONS}
                                        onChange={(next) => updateContainerLayout({ layoutGridAutoFit: next })}
                                    />
                                    <NumberInputRow
                                        label='Min Column Width'
                                        suffix='px'
                                        min={64}
                                        value={layoutGridMinColumnWidth}
                                        disabled={!hasAutoFit}
                                        onChange={(next) =>
                                            updateContainerLayout({
                                                layoutGridMinColumnWidth: Math.max(32, next),
                                            })
                                        }
                                    />
                                    <NumberInputRow
                                        label='Columns'
                                        min={1}
                                        value={Math.max(1, Math.floor(layoutGridColumns))}
                                        disabled={!showFixedColumnCount}
                                        onChange={(next) =>
                                            updateContainerLayout({
                                                layoutGridColumns: Math.max(1, Math.floor(next)),
                                            })
                                        }
                                    />
                                    <NumberInputRow
                                        label='Row Gap'
                                        suffix='px'
                                        min={0}
                                        value={layoutRowGap}
                                        onChange={(next) => updateContainerLayout({ layoutRowGap: Math.max(0, next) })}
                                    />
                                    <NumberInputRow
                                        label='Auto Row Height'
                                        suffix='px'
                                        min={16}
                                        value={layoutGridAutoRows}
                                        onChange={(next) =>
                                            updateContainerLayout({
                                                layoutGridAutoRows: Math.max(16, next),
                                            })
                                        }
                                    />
                                </div>
                            ) : null}
                            <div className='space-y-2'>
                                <p className='text-[10px] font-semibold uppercase tracking-[0.32em] text-[rgba(148,163,184,0.65)]'>Padding</p>
                                <div className='grid grid-cols-2 gap-2'>
                                    <NumberInputRow
                                        label='Top'
                                        suffix='px'
                                        value={Number.isFinite(padding.top) ? padding.top : 0}
                                        onChange={(next) => updateContainerLayout({ layoutPadding: { top: next } })}
                                    />
                                    <NumberInputRow
                                        label='Right'
                                        suffix='px'
                                        value={Number.isFinite(padding.right) ? padding.right : 0}
                                        onChange={(next) => updateContainerLayout({ layoutPadding: { right: next } })}
                                    />
                                    <NumberInputRow
                                        label='Bottom'
                                        suffix='px'
                                        value={Number.isFinite(padding.bottom) ? padding.bottom : 0}
                                        onChange={(next) => updateContainerLayout({ layoutPadding: { bottom: next } })}
                                    />
                                    <NumberInputRow
                                        label='Left'
                                        suffix='px'
                                        value={Number.isFinite(padding.left) ? padding.left : 0}
                                        onChange={(next) => updateContainerLayout({ layoutPadding: { left: next } })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {selectionCount > 0 && isAutoLayout ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.45)] px-3 py-3'>
                        <h4 className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.75)]'>
                            Auto Layout (Selected)
                        </h4>
                        {selectionCount > 1 ? (
                            <p className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                Applying changes to {selectionCount} elements.
                            </p>
                        ) : null}
                        {activeElement ? (
                            <div className='space-y-3'>
                                {selectionCount === 1 ? (
                                    <NumberInputRow
                                        label='Order'
                                        value={Number.isFinite(currentElementLayout.order) ? currentElementLayout.order : 0}
                                        onChange={(next) => setElementLayout(activeFrame.id, activeElement.id, { order: next })}
                                    />
                                ) : null}
                                {isFlexLayout ? (
                                    <>
                                        <NumberInputRow
                                            label={basisLabel}
                                            suffix='px'
                                            min={0}
                                            value={
                                                selectionCount > 1
                                                    ? ''
                                                    : Number.isFinite(currentElementLayout.basis)
                                                        ? currentElementLayout.basis
                                                        : basisFallback
                                            }
                                            onChange={(next) => applyLayoutToSelection({ basis: next })}
                                        />
                                        <NumberInputRow
                                            label='Grow'
                                            min={0}
                                            step={0.1}
                                            value={
                                                selectionCount > 1
                                                    ? ''
                                                    : Number.isFinite(currentElementLayout.grow)
                                                        ? currentElementLayout.grow
                                                        : 0
                                            }
                                            onChange={(next) => applyLayoutToSelection({ grow: next })}
                                        />
                                        <NumberInputRow
                                            label='Shrink'
                                            min={0}
                                            step={0.1}
                                            value={
                                                selectionCount > 1
                                                    ? ''
                                                    : Number.isFinite(currentElementLayout.shrink)
                                                        ? currentElementLayout.shrink
                                                        : 1
                                            }
                                            onChange={(next) => applyLayoutToSelection({ shrink: next })}
                                        />
                                    </>
                                ) : null}
                                {isGridLayout ? (
                                    <>
                                        <NumberInputRow
                                            label='Column Span'
                                            min={1}
                                            value={
                                                selectionCount > 1
                                                    ? ''
                                                    : Number.isFinite(currentElementLayout.gridColumnSpan)
                                                        ? currentElementLayout.gridColumnSpan
                                                        : 1
                                            }
                                            onChange={(next) =>
                                                applyLayoutToSelection({
                                                    gridColumnSpan: Math.max(1, Math.floor(next)),
                                                })
                                            }
                                        />
                                        <NumberInputRow
                                            label='Row Span'
                                            min={1}
                                            value={
                                                selectionCount > 1
                                                    ? ''
                                                    : Number.isFinite(currentElementLayout.gridRowSpan)
                                                        ? currentElementLayout.gridRowSpan
                                                        : 1
                                            }
                                            onChange={(next) =>
                                                applyLayoutToSelection({
                                                    gridRowSpan: Math.max(1, Math.floor(next)),
                                                })
                                            }
                                        />
                                        <div className='grid grid-cols-2 gap-3'>
                                            <div className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
                                                <span className='uppercase tracking-[0.2em]'>Column Start</span>
                                                <div className='flex items-center gap-2'>
                                                    <input
                                                        type='number'
                                                        min={1}
                                                        value={
                                                            selectionCount > 1
                                                                ? ''
                                                                : Number.isFinite(currentElementLayout.gridColumnStart)
                                                                    ? currentElementLayout.gridColumnStart
                                                                    : ''
                                                        }
                                                        placeholder='Auto'
                                                        onChange={(event) => {
                                                            const rawValue = event.target.value;
                                                            if (rawValue === '') {
                                                                applyLayoutToSelection({
                                                                    gridColumnStart: null,
                                                                });
                                                                return;
                                                            }
                                                            const parsed = Number(rawValue);
                                                            if (Number.isNaN(parsed)) return;
                                                            applyLayoutToSelection({
                                                                gridColumnStart: Math.max(1, Math.floor(parsed)),
                                                            });
                                                        }}
                                                        className='w-full rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-2 py-1 text-right text-[rgba(236,233,254,0.9)]'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            applyLayoutToSelection({
                                                                gridColumnStart: null,
                                                            })
                                                        }
                                                        className='rounded-md border border-[rgba(148,163,184,0.35)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(226,232,240,0.75)] transition-colors hover:border-[rgba(236,233,254,0.6)]'
                                                    >
                                                        Auto
                                                    </button>
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
                                                <span className='uppercase tracking-[0.2em]'>Row Start</span>
                                                <div className='flex items-center gap-2'>
                                                    <input
                                                        type='number'
                                                        min={1}
                                                        value={
                                                            selectionCount > 1
                                                                ? ''
                                                                : Number.isFinite(currentElementLayout.gridRowStart)
                                                                    ? currentElementLayout.gridRowStart
                                                                    : ''
                                                        }
                                                        placeholder='Auto'
                                                        onChange={(event) => {
                                                            const rawValue = event.target.value;
                                                            if (rawValue === '') {
                                                                applyLayoutToSelection({
                                                                    gridRowStart: null,
                                                                });
                                                                return;
                                                            }
                                                            const parsed = Number(rawValue);
                                                            if (Number.isNaN(parsed)) return;
                                                            applyLayoutToSelection({
                                                                gridRowStart: Math.max(1, Math.floor(parsed)),
                                                            });
                                                        }}
                                                        className='w-full rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-2 py-1 text-right text-[rgba(236,233,254,0.9)]'
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            applyLayoutToSelection({
                                                                gridRowStart: null,
                                                            })
                                                        }
                                                        className='rounded-md border border-[rgba(148,163,184,0.35)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(226,232,240,0.75)] transition-colors hover:border-[rgba(236,233,254,0.6)]'
                                                    >
                                                        Auto
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                                <SegmentedControl
                                    label='Align Self'
                                    value={currentAlignSelf === 'mixed' ? 'auto' : currentAlignSelf}
                                    options={[
                                        { value: 'auto', label: 'Auto' },
                                        { value: 'stretch', label: 'Stretch' },
                                        { value: 'start', label: 'Start' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'end', label: 'End' },
                                    ]}
                                    onChange={(next) =>
                                        applyLayoutToSelection({
                                            alignSelf: next === 'auto' ? null : next,
                                        })
                                    }
                                />
                                {currentAlignSelf === 'mixed' ? (
                                    <p className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                        Mixed values — choose an option to unify.
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {!isGroupContainer ? (
                    <>
                        <div className='space-y-2'>
                            <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Quick Align</p>
                            <div className='grid grid-cols-3 gap-2'>
                                <button type='button' disabled={disableAlign} onClick={() => alignElements('left')} className={alignButtonClass(disableAlign)}>
                                    Align Left
                                </button>
                                <button type='button' disabled={disableAlign} onClick={() => alignElements('center')} className={alignButtonClass(disableAlign)}>
                                    Align Center
                                </button>
                                <button type='button' disabled={disableAlign} onClick={() => alignElements('right')} className={alignButtonClass(disableAlign)}>
                                    Align Right
                                </button>
                                <button type='button' disabled={disableAlign} onClick={() => alignElements('top')} className={alignButtonClass(disableAlign)}>
                                    Align Top
                                </button>
                                <button type='button' disabled={disableAlign} onClick={() => alignElements('middle')} className={alignButtonClass(disableAlign)}>
                                    Align Middle
                                </button>
                                <button type='button' disabled={disableAlign} onClick={() => alignElements('bottom')} className={alignButtonClass(disableAlign)}>
                                    Align Bottom
                                </button>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>Distribute</p>
                            <div className='grid grid-cols-2 gap-2'>
                                <button type='button' disabled={disableDistribute} onClick={() => distributeElements('horizontal')} className={alignButtonClass(disableDistribute)}>
                                    Horizontal
                                </button>
                                <button type='button' disabled={disableDistribute} onClick={() => distributeElements('vertical')} className={alignButtonClass(disableDistribute)}>
                                    Vertical
                                </button>
                            </div>
                            {disableDistribute ? (
                                <p className='text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.55)]'>Select three or more elements to distribute.</p>
                            ) : null}
                        </div>
                    </>
                ) : null}
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
        <aside className='pointer-events-auto hidden h-full max-h-screen w-80 overflow-y-auto border-l border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.78)] px-5 py-6 text-sm text-[rgba(226,232,240,0.8)] backdrop-blur lg:flex lg:flex-col'>
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

            <div className='space-y-4 pr-2'>
                <section className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                    <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>Transform</h3>
                    <div className='mt-3 space-y-4'>{renderTransformControls()}</div>
                </section>

                {inspectorSections.map((section) => {
                    if (['style', 'appearance'].includes(section.id)) {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-4'>{renderStyleControls()}</div>
                            </section>
                        );
                    }

                    if (section.id === 'effects') {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-4'>{renderEffectsControls()}</div>
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

                    if (section.id === 'layout') {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-4'>{renderLayoutControls()}</div>
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
