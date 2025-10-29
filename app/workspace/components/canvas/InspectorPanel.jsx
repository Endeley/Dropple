'use client';

import clsx from 'clsx';
import { useState, useCallback } from 'react';
import { MODE_CONFIG } from './modeConfig';
import { useCanvasStore } from './context/CanvasStore';

function SliderRow({ label, min = 0, max = 100, step = 1, value = 0, onChange, mixed = false }) {
    const safeValue = Number.isFinite(value) ? value : min;
    const progress = ((safeValue - min) / (max - min)) * 100;
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className='space-y-1'>
            <div className='flex items-center justify-between text-xs text-[rgba(226,232,240,0.65)]'>
                <span>
                    {label}
                    {mixed ? (
                        <span className='ml-2 rounded bg-[rgba(148,163,184,0.18)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.75)]'>
                            Mixed
                        </span>
                    ) : null}
                </span>
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

function NumberInputRow({
    label,
    value = 0,
    min,
    max,
    step = 1,
    suffix,
    onChange,
    disabled = false,
    mixed = false,
}) {
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
            <span className='uppercase tracking-[0.2em]'>
                {label}
                {mixed ? (
                    <span className='ml-2 rounded bg-[rgba(148,163,184,0.18)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                        Mixed
                    </span>
                ) : null}
            </span>
            <div className='flex items-center gap-2'>
                <input
                    type='number'
                    value={mixed ? '' : Number.isFinite(value) ? value : ''}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleChange}
                    disabled={disabled}
                    className={clsx(
                        'w-20 rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-2 py-1 text-right text-[rgba(236,233,254,0.9)]',
                        disabled && 'cursor-not-allowed',
                    )}
                    placeholder={mixed ? '—' : undefined}
                />
                {suffix ? <span className='text-[rgba(148,163,184,0.8)]'>{suffix}</span> : null}
            </div>
        </label>
    );
}

function ColorRow({ label, value = '#ffffff', onChange, mixed = false }) {
    const safeValue = typeof value === 'string' && value.startsWith('#') ? value : '#ffffff';

    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs text-[rgba(226,232,240,0.65)]'>
                <span>
                    {label}
                    {mixed ? (
                        <span className='ml-2 rounded bg-[rgba(148,163,184,0.18)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                            Mixed
                        </span>
                    ) : null}
                </span>
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

function ImageInputRow({ label, value, onChange, mixed = false }) {
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
                <span>
                    {label}
                    {mixed ? (
                        <span className='ml-2 rounded bg-[rgba(148,163,184,0.18)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                            Mixed
                        </span>
                    ) : null}
                </span>
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
                value={mixed ? '' : value ?? ''}
                onChange={(event) => onChange?.(event.target.value || null)}
                placeholder={mixed ? 'Mixed value' : 'https://... or drop a file'}
                className='w-full rounded-md border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.65)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)]'
            />
            <label className='flex cursor-pointer items-center justify-center rounded-md border border-dashed border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.35)] px-3 py-2 text-xs font-medium text-[rgba(148,163,184,0.8)] hover:border-[rgba(139,92,246,0.45)] hover:text-[rgba(236,233,254,0.85)]'>
                Upload image
                <input type='file' accept='image/*' className='hidden' onChange={handleFile} />
            </label>
        </div>
    );
}

function SelectRow({ label, value = '', options = [], onChange, mixed = false }) {
    return (
        <label className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
            <span>
                {label}
                {mixed ? (
                    <span className='ml-2 rounded bg-[rgba(148,163,184,0.18)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                        Mixed
                    </span>
                ) : null}
            </span>
            <select
                value={mixed ? '' : value ?? ''}
                onChange={(event) => onChange?.(event.target.value)}
                className='rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)]'
            >
                {mixed ? (
                    <option value='' disabled>
                        Mixed value
                    </option>
                ) : null}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function SegmentedControl({ label, value, options = [], onChange, mixed = false }) {
    return (
        <div className='space-y-2'>
            {label ? (
                <div className='text-xs font-medium uppercase tracking-[0.15em] text-[rgba(148,163,184,0.7)]'>
                    {label}
                    {mixed ? (
                        <span className='ml-2 rounded bg-[rgba(148,163,184,0.18)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.7)]'>
                            Mixed
                        </span>
                    ) : null}
                </div>
            ) : null}
            <div className='flex flex-wrap gap-1'>
                {options.map((option) => {
                    const isActive = value !== null && value !== undefined && option.value === value;
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
    const updateElementsPropsBatch = useCanvasStore((state) => state.updateElementsPropsBatch);
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
    const [sectionControlValues, setSectionControlValues] = useState({});

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
    const humanizeProp = (key) =>
        (key ?? '')
            .replace(/([A-Z])/g, ' $1')
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^./, (char) => char.toUpperCase());

    const isEqualValue = (a, b) => {
        if (Object.is(a, b)) return true;
        if (Number.isNaN(a) && Number.isNaN(b)) return true;
        if (typeof a === 'object' || typeof b === 'object') {
            try {
                return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
            } catch (error) {
                return false;
            }
        }
        return a === b;
    };

    const getSelectionPropState = useCallback(
        (prop, defaultValue = undefined) => {
            if (!activeFrame || selectionCount === 0) {
                return { value: defaultValue, mixed: false };
            }
            if (selectionCount <= 1 || selectedElements.length <= 1) {
                const value = activeElementProps?.[prop];
                return { value: value ?? defaultValue, mixed: false };
            }
            const baseElements = selectedElements;
            const firstRaw = (baseElements[0]?.props ?? {})[prop];
            const firstValue = firstRaw ?? defaultValue;
            const mixed = baseElements.some((element, index) => {
                if (index === 0) return false;
                const nextRaw = (element.props ?? {})[prop];
                const nextValue = nextRaw ?? defaultValue;
                return !isEqualValue(nextValue, firstValue);
            });
            return { value: firstValue, mixed };
        },
        [activeFrame, selectionCount, selectedElements, activeElementProps],
    );

    const getControlState = useCallback(
        (prop, defaultValue) => {
            const state = getSelectionPropState(prop, defaultValue);
            return {
                value: state.value ?? defaultValue,
                mixed: selectionCount > 1 && state.mixed,
            };
        },
        [getSelectionPropState, selectionCount],
    );

    const handleFramePropChange = (prop, next) => {
        if (!activeFrame) return;
        const label = `Inspector: Set Frame ${humanizeProp(prop)}`;
        updateFrame(
            activeFrame.id,
            { [prop]: next },
            { historyLabel: label, source: 'inspector' },
        );
    };

    const handleElementPropChange = (prop, next) => {
        if (!activeFrame || selectionCount === 0) return;
        const label = `Inspector: Set Element ${humanizeProp(prop)}`;
        const buildValue = () => {
            if (Array.isArray(next)) {
                return next.map((item) => (item && typeof item === 'object' ? { ...item } : item));
            }
            if (next && typeof next === 'object') {
                return { ...next };
            }
            return next;
        };

        if (selectionCount > 1) {
            const entries = selectedElementIds.map((elementId) => ({
                elementId,
                props: { [prop]: buildValue() },
            }));
            updateElementsPropsBatch(activeFrame.id, entries, {
                historyLabel: label,
                source: 'inspector',
            });
        } else if (activeElement) {
            updateElementProps(
                activeFrame.id,
                activeElement.id,
                { [prop]: next },
                { historyLabel: label, source: 'inspector' },
            );
        }
    };

    const applyFrameBackground = (updates, historyLabel) => {
        if (!activeFrame) return;
        setFrameBackground(activeFrame.id, updates, {
            historyLabel: historyLabel ?? 'Inspector: Update Frame Background',
            source: 'inspector',
        });
    };

    const handleFrameBackgroundColor = (next) => {
        applyFrameBackground({ backgroundColor: next }, 'Inspector: Set Frame Background Color');
    };

    const handleFrameBackgroundImage = (next) => {
        applyFrameBackground({ backgroundImage: next }, 'Inspector: Set Frame Background Image');
    };

    const handleElementImage = (next) => {
        if (!activeFrame || !activeElement) return;
        updateElementProps(
            activeFrame.id,
            activeElement.id,
            { imageUrl: next },
            { historyLabel: 'Inspector: Set Element Image', source: 'inspector' },
        );
    };

    const handleLayerAction = (action) => {
        if (!activeFrame || !activeElement) return;
        action(activeFrame.id, activeElement.id);
    };

    const handleInspectorAction = (sectionId, item) => {
        if (!activeFrame) return;
        if (sectionId === 'export') {
            setActiveToolOverlay((prev) => (prev === 'export' ? null : 'export'));
            console.info(`Preparing export for ${item.toUpperCase()}...`);
            return;
        }
        if (sectionId === 'code') {
            setActiveToolOverlay((prev) => (prev === 'code-preview' ? null : 'code-preview'));
            console.info(`Opening code preview for ${item}...`);
            return;
        }
    };

    const getSectionControlValue = (sectionId, itemId) => {
        const key = `${sectionId}::${itemId}`;
        const current = sectionControlValues[key];
        if (Number.isFinite(current)) return current;
        return 50;
    };

    const handleSectionControlChange = (sectionId, itemId, rawValue) => {
        const nextValue = Number.parseFloat(rawValue);
        if (Number.isNaN(nextValue)) return;
        const key = `${sectionId}::${itemId}`;
        setSectionControlValues((prev) => ({
            ...prev,
            [key]: Math.min(100, Math.max(0, nextValue)),
        }));
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

    const CORNER_KEYS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

    const getCornerValue = (cornerKey) => {
        if (!activeElement) {
            return { value: 0, mixed: false };
        }
        if (selectionCount > 1) {
            const baseElements = selectedElements;
            const firstCorner = (() => {
                const first = baseElements[0]?.props?.cornerRadius;
                if (typeof first === 'object' && first !== null) {
                    return first[cornerKey];
                }
                return first;
            })();
            const mixed = baseElements.some((element, index) => {
                if (index === 0) return false;
                const next = element.props?.cornerRadius;
                const nextCorner =
                    typeof next === 'object' && next !== null ? next[cornerKey] : next;
                return !isEqualValue(nextCorner ?? 0, firstCorner ?? 0);
            });
            return {
                value: Number.isFinite(firstCorner) ? firstCorner : 0,
                mixed,
            };
        }
        const value = activeElementProps.cornerRadius;
        if (typeof value === 'object' && value !== null) {
            const corner = value[cornerKey];
            return { value: Number.isFinite(corner) ? corner : 0, mixed: false };
        }
        if (Number.isFinite(value)) return { value, mixed: false };
        return { value: 0, mixed: false };
    };

    const renderTransformControls = () => {
        if (!activeFrame) {
            return <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame to edit transform values.</p>;
        }

        if (activeElement) {
            const xControl = getControlState('x', 0);
            const yControl = getControlState('y', 0);
            const widthControl = getControlState('width', activeElementProps.width ?? 0);
            const heightControl = getControlState('height', activeElementProps.height ?? 0);
            const rotationControl = getControlState('rotation', 0);
            const scaleXControl = getControlState('scaleX', 1);
            const scaleYControl = getControlState('scaleY', 1);
            const skewXControl = getControlState('skewX', 0);
            const skewYControl = getControlState('skewY', 0);
            const opacityControl = getControlState('opacity', 1);
            const showWidthSlider = selectedElements.every((element) => Number.isFinite(element.props?.width));
            const showHeightSlider = selectedElements.every((element) => Number.isFinite(element.props?.height));

            return (
                <div className='space-y-4'>
                    {selectionCount > 1 ? (
                        <p className='rounded-md border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.12)] px-3 py-2 text-xs text-[rgba(236,233,254,0.75)]'>
                            Editing applies to {selectionCount} elements. Values will update each selected layer together.
                        </p>
                    ) : null}
                    <SliderRow
                        label='X Position'
                        min={-4000}
                        max={4000}
                        value={typeof xControl.value === 'number' ? xControl.value : 0}
                        mixed={xControl.mixed}
                        onChange={(next) => handleElementPropChange('x', next)}
                    />
                    <SliderRow
                        label='Y Position'
                        min={-4000}
                        max={4000}
                        value={typeof yControl.value === 'number' ? yControl.value : 0}
                        mixed={yControl.mixed}
                        onChange={(next) => handleElementPropChange('y', next)}
                    />
                    {showWidthSlider ? (
                        <SliderRow
                            label='Width'
                            min={0}
                            max={4000}
                            value={typeof widthControl.value === 'number' ? widthControl.value : 0}
                            mixed={widthControl.mixed}
                            onChange={(next) => handleElementPropChange('width', next)}
                        />
                    ) : null}
                    {showHeightSlider ? (
                        <SliderRow
                            label='Height'
                            min={0}
                            max={4000}
                            value={typeof heightControl.value === 'number' ? heightControl.value : 0}
                            mixed={heightControl.mixed}
                            onChange={(next) => handleElementPropChange('height', next)}
                        />
                    ) : null}
                    <SliderRow
                        label='Rotation'
                        min={-180}
                        max={180}
                        value={typeof rotationControl.value === 'number' ? rotationControl.value : 0}
                        mixed={rotationControl.mixed}
                        onChange={(next) => handleElementPropChange('rotation', next)}
                    />
                    <div className='grid grid-cols-2 gap-3'>
                        <SliderRow
                            label='Scale X'
                            min={-4}
                            max={4}
                            step={0.05}
                            value={typeof scaleXControl.value === 'number' ? scaleXControl.value : 1}
                            mixed={scaleXControl.mixed}
                            onChange={(next) => handleElementPropChange('scaleX', next)}
                        />
                        <SliderRow
                            label='Scale Y'
                            min={-4}
                            max={4}
                            step={0.05}
                            value={typeof scaleYControl.value === 'number' ? scaleYControl.value : 1}
                            mixed={scaleYControl.mixed}
                            onChange={(next) => handleElementPropChange('scaleY', next)}
                        />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                        <SliderRow
                            label='Skew X'
                            min={-75}
                            max={75}
                            step={1}
                            value={typeof skewXControl.value === 'number' ? skewXControl.value : 0}
                            mixed={skewXControl.mixed}
                            onChange={(next) => handleElementPropChange('skewX', next)}
                        />
                        <SliderRow
                            label='Skew Y'
                            min={-75}
                            max={75}
                            step={1}
                            value={typeof skewYControl.value === 'number' ? skewYControl.value : 0}
                            mixed={skewYControl.mixed}
                            onChange={(next) => handleElementPropChange('skewY', next)}
                        />
                    </div>
                    <SliderRow
                        label='Opacity'
                        min={0}
                        max={1}
                        step={0.01}
                        value={typeof opacityControl.value === 'number' ? opacityControl.value : 1}
                        mixed={opacityControl.mixed}
                        onChange={(next) => handleElementPropChange('opacity', next)}
                    />
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

            const fallbackFillType =
                activeElementProps.fillType ?? (activeElementProps.imageUrl ? 'image' : 'solid');
            const fillTypeState = getSelectionPropState('fillType', fallbackFillType);
            const fillType = fillTypeState.value ?? fallbackFillType;
            const fillTypeMixed = selectionCount > 1 && fillTypeState.mixed;
            const baseColorState = getSelectionPropState('fill', activeElementProps.fill ?? '#8B5CF6');
            const gradientTypeState = getSelectionPropState('gradientType', activeElementProps.gradientType ?? 'linear');
            const gradientStartState = getSelectionPropState(
                'gradientStart',
                activeElementProps.gradientStart ?? '#8B5CF6',
            );
            const gradientEndState = getSelectionPropState(
                'gradientEnd',
                activeElementProps.gradientEnd ?? '#3B82F6',
            );
            const gradientAngleControl = getControlState('gradientAngle', activeElementProps.gradientAngle ?? 45);
            const imageUrlState = getSelectionPropState('imageUrl', activeElementProps.imageUrl ?? null);
            const patternScaleControl = getControlState('patternScale', activeElementProps.patternScale ?? 1);
            const patternOffsetXControl = getControlState(
                'patternOffsetX',
                activeElementProps.patternOffsetX ?? 0,
            );
            const patternOffsetYControl = getControlState(
                'patternOffsetY',
                activeElementProps.patternOffsetY ?? 0,
            );
            const patternRepeatState = getSelectionPropState(
                'patternRepeat',
                activeElementProps.patternRepeat ?? 'repeat',
            );
            const backgroundFitState = getSelectionPropState(
                'backgroundFit',
                activeElementProps.backgroundFit ?? 'cover',
            );
            const strokeColorState = getSelectionPropState('stroke', activeElementProps.stroke ?? '#FFFFFF');
            const strokeWidthControl = getControlState('strokeWidth', activeElementProps.strokeWidth ?? 0);
            const blendModeState = getSelectionPropState('blendMode', activeElementProps.blendMode ?? 'normal');
            const backgroundBlendState = getSelectionPropState(
                'backgroundBlendMode',
                activeElementProps.backgroundBlendMode ?? 'normal',
            );
            const uniformCornerState = (() => {
                if (selectionCount > 1) {
                    const baseElements = selectedElements;
                    const first = baseElements[0]?.props?.cornerRadius;
                    const normalized =
                        typeof first === 'object' && first !== null ? first.topLeft ?? 0 : first ?? 0;
                    const mixed = baseElements.some((element, index) => {
                        if (index === 0) return false;
                        const current = element.props?.cornerRadius;
                        if (typeof current === 'object' && current !== null) {
                            return CORNER_KEYS.some((key) => {
                                const firstCorner =
                                    typeof first === 'object' && first !== null ? first[key] : first;
                                const nextCorner = current[key];
                                return !isEqualValue(nextCorner ?? 0, firstCorner ?? 0);
                            });
                        }
                        return !isEqualValue(current ?? 0, normalized ?? 0);
                    });
                    return {
                        value: Number.isFinite(normalized) ? normalized : 0,
                        mixed,
                    };
                }
                const value = activeElementProps.cornerRadius;
                if (Number.isFinite(value)) {
                    return { value, mixed: false };
                }
                if (typeof value === 'object' && value !== null) {
                    const normalized = value.topLeft ?? 0;
                    const mixed =
                        !isEqualValue(value.topLeft ?? 0, value.topRight ?? 0) ||
                        !isEqualValue(value.topLeft ?? 0, value.bottomLeft ?? 0) ||
                        !isEqualValue(value.topLeft ?? 0, value.bottomRight ?? 0);
                    return { value: Number.isFinite(normalized) ? normalized : 0, mixed };
                }
                return { value: 0, mixed: false };
            })();

            return (
                <div className='space-y-4'>
                    <SegmentedControl
                        label='Fill Type'
                        value={fillTypeMixed ? null : fillType}
                        mixed={fillTypeMixed}
                        options={FILL_TYPE_OPTIONS}
                        onChange={(next) => handleElementPropChange('fillType', next)}
                    />
                    {fillTypeMixed ? (
                        <p className='rounded-md border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.15)] px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-[rgba(236,233,254,0.75)]'>
                            Mixed fill types — choose a fill type to unify selection.
                        </p>
                    ) : (
                        <ColorRow
                            label='Base Color'
                            value={baseColorState.value ?? '#8B5CF6'}
                            mixed={selectionCount > 1 && baseColorState.mixed}
                            onChange={(next) => handleElementPropChange('fill', next)}
                        />
                    )}
                    {!fillTypeMixed && fillType === 'gradient' ? (
                        <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                            <SelectRow
                                label='Gradient Type'
                                value={
                                    selectionCount > 1 && gradientTypeState.mixed
                                        ? ''
                                        : gradientTypeState.value ?? 'linear'
                                }
                                mixed={selectionCount > 1 && gradientTypeState.mixed}
                                options={GRADIENT_TYPE_OPTIONS}
                                onChange={(next) => handleElementPropChange('gradientType', next)}
                            />
                            <ColorRow
                                label='Start Color'
                                value={gradientStartState.value ?? '#8B5CF6'}
                                mixed={selectionCount > 1 && gradientStartState.mixed}
                                onChange={(next) => handleElementPropChange('gradientStart', next)}
                            />
                            <ColorRow
                                label='End Color'
                                value={gradientEndState.value ?? '#3B82F6'}
                                mixed={selectionCount > 1 && gradientEndState.mixed}
                                onChange={(next) => handleElementPropChange('gradientEnd', next)}
                            />
                            <SliderRow
                                label='Angle'
                                min={0}
                                max={360}
                                step={1}
                                value={
                                    typeof gradientAngleControl.value === 'number'
                                        ? gradientAngleControl.value
                                        : 45
                                }
                                mixed={gradientAngleControl.mixed}
                                onChange={(next) => handleElementPropChange('gradientAngle', next)}
                            />
                        </div>
                    ) : null}
                    {!fillTypeMixed && ['image', 'pattern'].includes(fillType) ? (
                        <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                            <ImageInputRow
                                label='Image Source'
                                value={imageUrlState.value ?? null}
                                mixed={selectionCount > 1 && imageUrlState.mixed}
                                onChange={handleElementImage}
                            />
                            {fillType === 'pattern' ? (
                                <>
                                    <SliderRow
                                        label='Pattern Scale'
                                        min={0.1}
                                        max={4}
                                        step={0.05}
                                        value={
                                            typeof patternScaleControl.value === 'number'
                                                ? patternScaleControl.value
                                                : 1
                                        }
                                        mixed={patternScaleControl.mixed}
                                        onChange={(next) => handleElementPropChange('patternScale', next)}
                                    />
                                    <div className='grid grid-cols-2 gap-3'>
                                        <SliderRow
                                            label='Offset X'
                                            min={-500}
                                            max={500}
                                            step={1}
                                            value={
                                                typeof patternOffsetXControl.value === 'number'
                                                    ? patternOffsetXControl.value
                                                    : 0
                                            }
                                            mixed={patternOffsetXControl.mixed}
                                            onChange={(next) => handleElementPropChange('patternOffsetX', next)}
                                        />
                                        <SliderRow
                                            label='Offset Y'
                                            min={-500}
                                            max={500}
                                            step={1}
                                            value={
                                                typeof patternOffsetYControl.value === 'number'
                                                    ? patternOffsetYControl.value
                                                    : 0
                                            }
                                            mixed={patternOffsetYControl.mixed}
                                            onChange={(next) => handleElementPropChange('patternOffsetY', next)}
                                        />
                                    </div>
                                    <SelectRow
                                        label='Repeat'
                                        value={
                                            selectionCount > 1 && patternRepeatState.mixed
                                                ? ''
                                                : patternRepeatState.value ?? 'repeat'
                                        }
                                        mixed={selectionCount > 1 && patternRepeatState.mixed}
                                        options={PATTERN_REPEAT_OPTIONS}
                                        onChange={(next) => handleElementPropChange('patternRepeat', next)}
                                    />
                                </>
                            ) : (
                                <SelectRow
                                    label='Object Fit'
                                    value={
                                        selectionCount > 1 && backgroundFitState.mixed
                                            ? ''
                                            : backgroundFitState.value ?? 'cover'
                                    }
                                    mixed={selectionCount > 1 && backgroundFitState.mixed}
                                    options={IMAGE_FIT_OPTIONS}
                                    onChange={(next) => handleElementPropChange('backgroundFit', next)}
                                />
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
                                    {CORNER_KEYS.map((cornerKey) => {
                                        const cornerState = getCornerValue(cornerKey);
                                        const labelMap = {
                                            topLeft: 'Top Left',
                                            topRight: 'Top Right',
                                            bottomLeft: 'Bottom Left',
                                            bottomRight: 'Bottom Right',
                                        };
                                        return (
                                            <SliderRow
                                                key={cornerKey}
                                                label={labelMap[cornerKey]}
                                                min={0}
                                                max={320}
                                                step={1}
                                                value={cornerState.value}
                                                mixed={cornerState.mixed}
                                                onChange={(next) => handleCornerRadiusChange(cornerKey, next)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <SliderRow
                                    label='Radius'
                                    min={0}
                                    max={320}
                                    step={1}
                                    value={uniformCornerState.value}
                                    mixed={uniformCornerState.mixed}
                                    onChange={(next) => handleElementPropChange('cornerRadius', Math.max(0, next))}
                                />
                            )}
                        </div>
                    ) : null}
                    <div className='grid grid-cols-2 gap-3'>
                        <ColorRow
                            label='Stroke Color'
                            value={strokeColorState.value ?? '#FFFFFF'}
                            mixed={selectionCount > 1 && strokeColorState.mixed}
                            onChange={(next) => handleElementPropChange('stroke', next)}
                        />
                        <SliderRow
                            label='Stroke Width'
                            min={0}
                            max={24}
                            step={0.5}
                            value={typeof strokeWidthControl.value === 'number' ? strokeWidthControl.value : 0}
                            mixed={strokeWidthControl.mixed}
                            onChange={(next) => handleElementPropChange('strokeWidth', next)}
                        />
                    </div>
                    <SelectRow
                        label='Blend Mode'
                        value={selectionCount > 1 && blendModeState.mixed ? '' : blendModeState.value ?? 'normal'}
                        mixed={selectionCount > 1 && blendModeState.mixed}
                        options={BLEND_MODE_OPTIONS}
                        onChange={(next) => handleElementPropChange('blendMode', next)}
                    />
                    <SelectRow
                        label='Background Blend'
                        value={
                            selectionCount > 1 && backgroundBlendState.mixed
                                ? ''
                                : backgroundBlendState.value ?? 'normal'
                        }
                        mixed={selectionCount > 1 && backgroundBlendState.mixed}
                        options={BACKGROUND_BLEND_OPTIONS}
                        onChange={(next) => handleElementPropChange('backgroundBlendMode', next)}
                    />
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
                        applyFrameBackground(
                            { backgroundFillType: next },
                            'Inspector: Set Frame Fill Type',
                        )
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
                                applyFrameBackground(
                                    { backgroundGradientType: next },
                                    'Inspector: Set Gradient Type',
                                )
                            }
                        />
                        <ColorRow
                            label='Gradient Start'
                            value={activeFrame.backgroundGradientStart ?? '#8B5CF6'}
                            onChange={(next) =>
                                applyFrameBackground(
                                    { backgroundGradientStart: next },
                                    'Inspector: Set Gradient Color Start',
                                )
                            }
                        />
                        <ColorRow
                            label='Gradient End'
                            value={activeFrame.backgroundGradientEnd ?? '#3B82F6'}
                            onChange={(next) =>
                                applyFrameBackground(
                                    { backgroundGradientEnd: next },
                                    'Inspector: Set Gradient Color End',
                                )
                            }
                        />
                        <SliderRow
                            label='Angle'
                            min={0}
                            max={360}
                            step={1}
                            value={activeFrame.backgroundGradientAngle ?? 45}
                            onChange={(next) =>
                                applyFrameBackground(
                                    { backgroundGradientAngle: next },
                                    'Inspector: Set Gradient Angle',
                                )
                            }
                        />
                    </div>
                ) : null}
                {['image', 'pattern'].includes(frameFillType) ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ImageInputRow
                            label='Background Image'
                            value={activeFrame.backgroundImage ?? null}
                            onChange={handleFrameBackgroundImage}
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
                                        applyFrameBackground(
                                            { backgroundPatternScale: next },
                                            'Inspector: Set Pattern Scale',
                                        )
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
                                            applyFrameBackground(
                                                { backgroundPatternOffsetX: next },
                                                'Inspector: Set Pattern Offset X',
                                            )
                                        }
                                    />
                                    <SliderRow
                                        label='Offset Y'
                                        min={-500}
                                        max={500}
                                        step={1}
                                        value={activeFrame.backgroundPatternOffsetY ?? 0}
                                        onChange={(next) =>
                                            applyFrameBackground(
                                                { backgroundPatternOffsetY: next },
                                                'Inspector: Set Pattern Offset Y',
                                            )
                                        }
                                    />
                                </div>
                                <SelectRow
                                    label='Repeat'
                                    value={activeFrame.backgroundPatternRepeat ?? 'repeat'}
                                    options={PATTERN_REPEAT_OPTIONS}
                                    onChange={(next) =>
                                        applyFrameBackground(
                                            { backgroundPatternRepeat: next },
                                            'Inspector: Set Pattern Repeat',
                                        )
                                    }
                                />
                            </>
                        ) : (
                            <SelectRow
                                label='Object Fit'
                                value={activeFrame.backgroundFit ?? 'cover'}
                                options={IMAGE_FIT_OPTIONS}
                                onChange={(next) =>
                                    applyFrameBackground(
                                        { backgroundFit: next },
                                        'Inspector: Set Background Fit',
                                    )
                                }
                            />
                        )}
                    </div>
                ) : null}
                <SelectRow
                    label='Background Blend'
                    value={activeFrame.backgroundBlendMode ?? 'normal'}
                    options={BACKGROUND_BLEND_OPTIONS}
                    onChange={(next) =>
                        applyFrameBackground(
                            { backgroundBlendMode: next },
                            'Inspector: Set Background Blend Mode',
                        )
                    }
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

        const shadowColorState = getSelectionPropState('shadowColor', activeElementProps.shadowColor ?? '#000000');
        const shadowOffsetXControl = getControlState('shadowOffsetX', activeElementProps.shadowOffsetX ?? 0);
        const shadowOffsetYControl = getControlState('shadowOffsetY', activeElementProps.shadowOffsetY ?? 0);
        const shadowBlurControl = getControlState('shadowBlur', activeElementProps.shadowBlur ?? 0);
        const shadowSpreadControl = getControlState('shadowSpread', activeElementProps.shadowSpread ?? 0);
        const glowColorState = getSelectionPropState('glowColor', activeElementProps.glowColor ?? '#8B5CF6');
        const glowBlurControl = getControlState('glowBlur', activeElementProps.glowBlur ?? 24);
        const blurControl = getControlState('blur', activeElementProps.blur ?? 0);
        const brightnessControl = getControlState('brightness', activeElementProps.brightness ?? 100);
        const contrastControl = getControlState('contrast', activeElementProps.contrast ?? 100);
        const saturationControl = getControlState('saturation', activeElementProps.saturation ?? 100);
        const hueRotateControl = getControlState('hueRotate', activeElementProps.hueRotate ?? 0);

        return (
            <div className='space-y-4'>
                <ColorRow
                    label='Shadow Color'
                    value={shadowColorState.value ?? '#000000'}
                    mixed={selectionCount > 1 && shadowColorState.mixed}
                    onChange={(next) => handleElementPropChange('shadowColor', next)}
                />
                <div className='grid grid-cols-2 gap-3'>
                    <SliderRow
                        label='Offset X'
                        min={-200}
                        max={200}
                        step={1}
                        value={
                            typeof shadowOffsetXControl.value === 'number' ? shadowOffsetXControl.value : 0
                        }
                        mixed={shadowOffsetXControl.mixed}
                        onChange={(next) => handleElementPropChange('shadowOffsetX', next)}
                    />
                    <SliderRow
                        label='Offset Y'
                        min={-200}
                        max={200}
                        step={1}
                        value={
                            typeof shadowOffsetYControl.value === 'number' ? shadowOffsetYControl.value : 0
                        }
                        mixed={shadowOffsetYControl.mixed}
                        onChange={(next) => handleElementPropChange('shadowOffsetY', next)}
                    />
                </div>
                <SliderRow
                    label='Shadow Blur'
                    min={0}
                    max={200}
                    step={1}
                    value={
                        typeof shadowBlurControl.value === 'number' ? shadowBlurControl.value : 0
                    }
                    mixed={shadowBlurControl.mixed}
                    onChange={(next) => handleElementPropChange('shadowBlur', next)}
                />
                <SliderRow
                    label='Shadow Spread'
                    min={-50}
                    max={50}
                    step={1}
                    value={
                        typeof shadowSpreadControl.value === 'number' ? shadowSpreadControl.value : 0
                    }
                    mixed={shadowSpreadControl.mixed}
                    onChange={(next) => handleElementPropChange('shadowSpread', next)}
                />
                <button
                    type='button'
                    onClick={() => setShowShadowDetails((value) => !value)}
                    className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                >
                    {showShadowDetails ? 'Hide Glow Controls' : 'Show Glow Controls'}
                </button>
                {showShadowDetails ? (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ColorRow
                            label='Glow Color'
                            value={glowColorState.value ?? '#8B5CF6'}
                            mixed={selectionCount > 1 && glowColorState.mixed}
                            onChange={(next) => handleElementPropChange('glowColor', next)}
                        />
                        <SliderRow
                            label='Glow Blur'
                            min={0}
                            max={200}
                            step={1}
                            value={typeof glowBlurControl.value === 'number' ? glowBlurControl.value : 24}
                            mixed={glowBlurControl.mixed}
                            onChange={(next) => handleElementPropChange('glowBlur', next)}
                        />
                    </div>
                ) : null}
                <SliderRow
                    label='Gaussian Blur'
                    min={0}
                    max={100}
                    step={1}
                    value={typeof blurControl.value === 'number' ? blurControl.value : 0}
                    mixed={blurControl.mixed}
                    onChange={(next) => handleElementPropChange('blur', next)}
                />
                <button
                    type='button'
                    onClick={() => setShowFilterDetails((value) => !value)}
                    className='w-full rounded-lg border border-[rgba(148,163,184,0.25)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(226,232,240,0.78)] transition-colors hover:border-[rgba(236,233,254,0.65)]'
                >
                    {showFilterDetails ? 'Hide Color Adjustments' : 'Show Color Adjustments'}
                </button>
                {showFilterDetails ? (
                    <div className='grid grid-cols-2 gap-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <SliderRow
                            label='Brightness'
                            min={0}
                            max={200}
                            step={1}
                            value={
                                typeof brightnessControl.value === 'number' ? brightnessControl.value : 100
                            }
                            mixed={brightnessControl.mixed}
                            onChange={(next) => handleElementPropChange('brightness', next)}
                        />
                        <SliderRow
                            label='Contrast'
                            min={0}
                            max={200}
                            step={1}
                            value={
                                typeof contrastControl.value === 'number' ? contrastControl.value : 100
                            }
                            mixed={contrastControl.mixed}
                            onChange={(next) => handleElementPropChange('contrast', next)}
                        />
                        <SliderRow
                            label='Saturation'
                            min={0}
                            max={200}
                            step={1}
                            value={
                                typeof saturationControl.value === 'number' ? saturationControl.value : 100
                            }
                            mixed={saturationControl.mixed}
                            onChange={(next) => handleElementPropChange('saturation', next)}
                        />
                        <SliderRow
                            label='Hue Rotate'
                            min={-180}
                            max={180}
                            step={1}
                            value={
                                typeof hueRotateControl.value === 'number' ? hueRotateControl.value : 0
                            }
                            mixed={hueRotateControl.mixed}
                            onChange={(next) => handleElementPropChange('hueRotate', next)}
                        />
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

        const fontFamilyState = getSelectionPropState('fontFamily', '');
        const textFillTypeState = getSelectionPropState('textFillType', 'solid');
        const alignState = getSelectionPropState('align', 'left');
        const textTransformState = getSelectionPropState('textTransform', 'none');
        const fontSizeControl = getControlState('fontSize', 16);
        const fontWeightControl = getControlState('fontWeight', activeElementProps.fontWeight ?? 400);
        const lineHeightControl = getControlState('lineHeight', 1.2);
        const letterSpacingControl = getControlState('letterSpacing', 0);
        const textColorState = getSelectionPropState('fill', '#ECE9FE');
        const gradientStartState = getSelectionPropState('textGradientStart', '#8B5CF6');
        const gradientEndState = getSelectionPropState('textGradientEnd', '#3B82F6');
        const gradientAngleControl = getControlState('textGradientAngle', 45);
        const textShadowColorState = getSelectionPropState('textShadowColor', '#000000');
        const textShadowBlurControl = getControlState('textShadowBlur', 0);
        const textShadowXControl = getControlState('textShadowX', 0);
        const textShadowYControl = getControlState('textShadowY', 0);
        const textFillType = textFillTypeState.value ?? 'solid';

        return (
            <div className='space-y-4'>
                <label className='flex flex-col gap-1 text-xs text-[rgba(226,232,240,0.7)]'>
                    <span>Font Family</span>
                    <input
                        type='text'
                        value={
                            selectionCount > 1 && fontFamilyState.mixed
                                ? ''
                                : (fontFamilyState.value ?? '')
                        }
                        onChange={(event) => handleElementPropChange('fontFamily', event.target.value)}
                        placeholder={
                            selectionCount > 1 && fontFamilyState.mixed
                                ? 'Mixed value'
                                : 'Inter, Satoshi, etc.'
                        }
                        className='rounded-lg border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)]'
                    />
                </label>
                <SliderRow
                    label='Font Size'
                    min={8}
                    max={180}
                    value={typeof fontSizeControl.value === 'number' ? fontSizeControl.value : 16}
                    mixed={fontSizeControl.mixed}
                    onChange={(next) => handleElementPropChange('fontSize', next)}
                />
                <SliderRow
                    label='Font Weight'
                    min={100}
                    max={900}
                    step={100}
                    value={
                        typeof fontWeightControl.value === 'number'
                            ? fontWeightControl.value
                            : activeElementProps.fontStyle?.includes('bold')
                                ? 600
                                : 400
                    }
                    mixed={fontWeightControl.mixed}
                    onChange={(next) => handleElementPropChange('fontWeight', next)}
                />
                <div className='grid grid-cols-2 gap-3'>
                    <SliderRow
                        label='Line Height'
                        min={0.5}
                        max={3}
                        step={0.05}
                        value={typeof lineHeightControl.value === 'number' ? lineHeightControl.value : 1.2}
                        mixed={lineHeightControl.mixed}
                        onChange={(next) => handleElementPropChange('lineHeight', next)}
                    />
                    <SliderRow
                        label='Letter Spacing'
                        min={-10}
                        max={20}
                        step={0.25}
                        value={
                            typeof letterSpacingControl.value === 'number' ? letterSpacingControl.value : 0
                        }
                        mixed={letterSpacingControl.mixed}
                        onChange={(next) => handleElementPropChange('letterSpacing', next)}
                    />
                </div>
                <SegmentedControl
                    label='Text Fill'
                    value={selectionCount > 1 && textFillTypeState.mixed ? null : textFillType}
                    options={TEXT_FILL_TYPE_OPTIONS}
                    mixed={selectionCount > 1 && textFillTypeState.mixed}
                    onChange={(next) => handleElementPropChange('textFillType', next)}
                />
                {textFillType === 'solid' ? (
                    <ColorRow
                        label='Text Color'
                        value={textColorState.value ?? '#ECE9FE'}
                        mixed={selectionCount > 1 && textColorState.mixed}
                        onChange={(next) => handleElementPropChange('fill', next)}
                    />
                ) : (
                    <div className='space-y-3 rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.55)] px-3 py-3'>
                        <ColorRow
                            label='Gradient Start'
                            value={gradientStartState.value ?? '#8B5CF6'}
                            mixed={selectionCount > 1 && gradientStartState.mixed}
                            onChange={(next) => handleElementPropChange('textGradientStart', next)}
                        />
                        <ColorRow
                            label='Gradient End'
                            value={gradientEndState.value ?? '#3B82F6'}
                            mixed={selectionCount > 1 && gradientEndState.mixed}
                            onChange={(next) => handleElementPropChange('textGradientEnd', next)}
                        />
                        <SliderRow
                            label='Gradient Angle'
                            min={0}
                            max={360}
                            step={1}
                            value={
                                typeof gradientAngleControl.value === 'number'
                                    ? gradientAngleControl.value
                                    : 45
                            }
                            mixed={gradientAngleControl.mixed}
                            onChange={(next) => handleElementPropChange('textGradientAngle', next)}
                        />
                    </div>
                )}
                <SegmentedControl
                    label='Alignment'
                    value={
                        selectionCount > 1 && alignState.mixed
                            ? null
                            : (alignState.value ?? 'left')
                    }
                    options={TEXT_ALIGN_OPTIONS}
                    mixed={selectionCount > 1 && alignState.mixed}
                    onChange={(next) => handleElementPropChange('align', next)}
                />
                <SelectRow
                    label='Text Transform'
                    value={
                        selectionCount > 1 && textTransformState.mixed
                            ? ''
                            : (textTransformState.value ?? 'none')
                    }
                    options={TEXT_TRANSFORM_OPTIONS}
                    mixed={selectionCount > 1 && textTransformState.mixed}
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
                        <ColorRow
                            label='Text Shadow'
                            value={textShadowColorState.value ?? '#000000'}
                            mixed={selectionCount > 1 && textShadowColorState.mixed}
                            onChange={(next) => handleElementPropChange('textShadowColor', next)}
                        />
                        <div className='grid grid-cols-3 gap-3'>
                            <SliderRow
                                label='Blur'
                                min={0}
                                max={60}
                                step={1}
                                value={
                                    typeof textShadowBlurControl.value === 'number' ? textShadowBlurControl.value : 0
                                }
                                mixed={textShadowBlurControl.mixed}
                                onChange={(next) => handleElementPropChange('textShadowBlur', next)}
                            />
                            <SliderRow
                                label='Offset X'
                                min={-50}
                                max={50}
                                step={1}
                                value={
                                    typeof textShadowXControl.value === 'number' ? textShadowXControl.value : 0
                                }
                                mixed={textShadowXControl.mixed}
                                onChange={(next) => handleElementPropChange('textShadowX', next)}
                            />
                            <SliderRow
                                label='Offset Y'
                                min={-50}
                                max={50}
                                step={1}
                                value={
                                    typeof textShadowYControl.value === 'number' ? textShadowYControl.value : 0
                                }
                                mixed={textShadowYControl.mixed}
                                onChange={(next) => handleElementPropChange('textShadowY', next)}
                            />
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
            const keys = Object.keys(payload ?? {});
            const targetLabel = isGroupContainer ? 'Group' : 'Frame';
            let label = `Inspector: Update ${targetLabel} Layout`;
            if (keys.length === 1) {
                const key = keys[0];
                if (key === 'layoutPadding') {
                    const paddingKeys = Object.keys(payload.layoutPadding ?? {});
                    if (paddingKeys.length === 1) {
                        label = `Inspector: Set ${targetLabel} Layout Padding ${humanizeProp(paddingKeys[0])}`;
                    } else {
                        label = `Inspector: Set ${targetLabel} Layout Padding`;
                    }
                } else {
                    label = `Inspector: Set ${targetLabel} ${humanizeProp(key)}`;
                }
            }
            const options = {
                historyLabel: label,
                source: 'inspector',
            };
            if (isGroupContainer && activeElement) {
                setGroupLayout(activeFrame.id, activeElement.id, payload, options);
            } else {
                setFrameLayout(activeFrame.id, payload, options);
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
            if (targets.length === 0) return;
            const keys = Object.keys(updates ?? {});
            let label = 'Inspector: Update Element Layout';
            if (keys.length === 1) {
                label = `Inspector: Set Element Layout ${humanizeProp(keys[0])}`;
            }
            targets.forEach((target, index) => {
                setElementLayout(
                    activeFrame.id,
                    target.id,
                    updates,
                    {
                        historyLabel: label,
                        source: 'inspector',
                        skipHistory: index < targets.length - 1,
                    },
                );
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
                                        onChange={(next) => applyLayoutToSelection({ order: next })}
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
                                    value={currentAlignSelf === 'mixed' ? null : currentAlignSelf}
                                    options={[
                                        { value: 'auto', label: 'Auto' },
                                        { value: 'stretch', label: 'Stretch' },
                                        { value: 'start', label: 'Start' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'end', label: 'End' },
                                    ]}
                                    mixed={currentAlignSelf === 'mixed'}
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

                    if (section.id === 'export') {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-2'>
                                    {section.items?.map((item) => (
                                        <button
                                            key={item}
                                            type='button'
                                            onClick={() => handleInspectorAction(section.id, item)}
                                            className='flex w-full items-center justify-between rounded-lg border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.6)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(226,232,240,0.85)] transition-colors hover:border-[rgba(236,233,254,0.35)] hover:bg-[rgba(139,92,246,0.18)] hover:text-white'
                                        >
                                            <span>{item}</span>
                                            <span className='text-[rgba(236,233,254,0.85)]'>Export</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        );
                    }
                    if (section.id === 'code') {
                        return (
                            <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                                <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                                <div className='mt-3 space-y-2'>
                                    {section.items?.map((item) => (
                                        <button
                                            key={item}
                                            type='button'
                                            onClick={() => handleInspectorAction(section.id, item)}
                                            className='flex w-full items-center justify-between rounded-lg border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.6)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(226,232,240,0.85)] transition-colors hover:border-[rgba(236,233,254,0.35)] hover:bg-[rgba(59,130,246,0.18)] hover:text-white'
                                        >
                                            <span>{item}</span>
                                            <span className='text-[rgba(236,233,254,0.85)]'>Preview</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    return (
                        <section key={section.id} className='rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.55)] p-4'>
                            <h3 className='text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(148,163,184,0.7)]'>{section.title}</h3>
                            <ul className='mt-3 space-y-3'>
                                {section.items?.map((item) => {
                                    const itemId = item.toString().toLowerCase().replace(/\s+/g, '-');
                                    const value = getSectionControlValue(section.id, itemId);
                                    return (
                                        <li
                                            key={item}
                                            className='rounded-lg border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.6)] px-3 py-3 text-xs text-[rgba(226,232,240,0.78)]'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='uppercase tracking-[0.16em] text-[rgba(226,232,240,0.72)]'>{item}</span>
                                                <span className='font-semibold text-[rgba(236,233,254,0.88)]'>{Math.round(value)}%</span>
                                            </div>
                                            <div className='relative mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]'>
                                                <div
                                                    className='pointer-events-none absolute inset-0 rounded-full bg-[rgba(139,92,246,0.52)]'
                                                    style={{ width: `${value}%` }}
                                                />
                                                <input
                                                    type='range'
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={value}
                                                    onChange={(event) => handleSectionControlChange(section.id, itemId, event.target.value)}
                                                    className='absolute inset-0 h-2 w-full cursor-pointer opacity-0'
                                                    aria-label={`${item} level`}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </aside>
    );
}
