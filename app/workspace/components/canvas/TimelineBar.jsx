'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasStore } from './context/CanvasStore';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export default function TimelineBar({ frameId, assets, totalDuration, getTimelineStyles }) {
    const updateTimelineAsset = useCanvasStore((state) => state.updateTimelineAsset);
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const pointerDownRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const [activeAssetId, setActiveAssetId] = useState(null);
    const [dragLabel, setDragLabel] = useState(null);
    const [highlightTick, setHighlightTick] = useState(null);
    const [highlightFading, setHighlightFading] = useState(false);

    const normalizedAssets = useMemo(() => {
        const total = totalDuration || 1;
        return assets.map((asset) => {
            const duration = Math.max(0.1, asset.duration || 1);
            const offset = clamp(asset.offset || 0, 0, total);
            const widthPercent = Math.max((duration / total) * 100, 4);
            const leftPercent = clamp((offset / total) * 100, 0, 100);
            const preview = getTimelineStyles(asset);
            const waveformValues = Array.isArray(asset.waveform) ? asset.waveform : [];
            const maxWaveform = waveformValues.reduce((max, value) => Math.max(max, Math.abs(value)), 0);

            return {
                ...asset,
                duration,
                offset,
                widthPercent,
                leftPercent,
                preview,
                waveformValues,
                maxWaveform,
            };
        });
    }, [assets, totalDuration, getTimelineStyles]);

    const handleDragStart = (event, assetId, handleType) => {
        event.stopPropagation();
        if (selectedTool !== 'pointer') return;
        const currentAsset = normalizedAssets.find((item) => item.id === assetId);
        if (!currentAsset) return;
        pointerDownRef.current = {
            assetId,
            handleType,
            startClientX: event.clientX,
            rect: event.currentTarget.getBoundingClientRect(),
            shiftKey: event.shiftKey,
            initialOffset: currentAsset.offset,
            initialDuration: currentAsset.duration,
        };
        setActiveAssetId(assetId);
        setDragLabel({
            assetId,
            value:
                handleType === 'offset'
                    ? pointerDownRef.current.initialOffset
                    : pointerDownRef.current.initialDuration,
        });
        setHighlightTick(null);
        setHighlightFading(false);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('keydown', handleKeyDown);
    };

    const handlePointerMove = (event) => {
        const pointerInfo = pointerDownRef.current;
        if (!pointerInfo) return;

        const { assetId, handleType, startClientX, shiftKey } = pointerInfo;
        const storeState = useCanvasStore.getState();
        const asset = storeState.timelineAssets.find((item) => item.id === assetId);
        if (!asset) return;

        const deltaPx = event.clientX - startClientX;
        const container = pointerInfo.rect;
        const totalPx = container?.width ?? 1;
        const deltaSeconds = (deltaPx / totalPx) * totalDuration;
        const gridStep = totalDuration <= 10 ? 1 : totalDuration <= 60 ? 5 : 10;
        const snappedDelta = shiftKey
            ? Math.round(deltaSeconds / gridStep) * gridStep
            : deltaSeconds;

        const now = performance.now();
        if (now - lastUpdateRef.current < 16) {
            setDragLabel({
                assetId,
                value: handleType === 'offset' ? asset.offset + snappedDelta : asset.duration + snappedDelta,
            });
            return;
        }
        lastUpdateRef.current = now;

        if (!shiftKey) {
            setHighlightTick(null);
            setHighlightFading(false);
        }

        if (handleType === 'offset') {
            const nextOffset = clamp(asset.offset + snappedDelta, 0, totalDuration - 0.1);
            updateTimelineAsset(asset.id, { offset: nextOffset }, { log: false });
            setDragLabel({ assetId, value: nextOffset });
            if (shiftKey) {
                setHighlightTick(Math.round(nextOffset / gridStep) * gridStep);
                setHighlightFading(false);
            }
        } else if (handleType === 'end') {
            const nextDuration = clamp(asset.duration + snappedDelta, 0.1, totalDuration - asset.offset);
            updateTimelineAsset(asset.id, { duration: nextDuration }, { log: false });
            setDragLabel({ assetId, value: nextDuration });
            if (shiftKey) {
                setHighlightTick(Math.round((asset.offset + nextDuration) / gridStep) * gridStep);
                setHighlightFading(false);
            }
        }
    };

    const handlePointerUp = () => {
        const pointerInfo = pointerDownRef.current;
        pointerDownRef.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('keydown', handleKeyDown);
        setActiveAssetId(null);
        setDragLabel(null);
        if (pointerInfo) {
            const storeState = useCanvasStore.getState();
            const asset = storeState.timelineAssets.find((item) => item.id === pointerInfo.assetId);
            if (asset) {
                const hasChanged =
                    Math.abs(asset.offset - pointerInfo.initialOffset) > 0.0001 ||
                    Math.abs(asset.duration - pointerInfo.initialDuration) > 0.0001;
                if (hasChanged) {
                    storeState.commitTimelineAssetChange(pointerInfo.assetId, {
                        frameId: asset.frameId,
                        offset: pointerInfo.initialOffset,
                        duration: pointerInfo.initialDuration,
                        label: asset.label,
                        type: asset.type,
                        thumbnailUrl: asset.thumbnailUrl,
                        waveform: asset.waveform ? [...asset.waveform] : null,
                    });
                }
            }
        }
        if (highlightTick != null) {
            setHighlightFading(true);
        } else {
            setHighlightFading(false);
        }
    };

    const handleKeyDown = (event) => {
        const pointerInfo = pointerDownRef.current;
        if (!pointerInfo) return;
        if (event.key === 'Escape') {
            if (pointerInfo.handleType === 'offset') {
                updateTimelineAsset(pointerInfo.assetId, { offset: pointerInfo.initialOffset });
                setDragLabel({ assetId: pointerInfo.assetId, value: pointerInfo.initialOffset });
            } else {
                updateTimelineAsset(pointerInfo.assetId, { duration: pointerInfo.initialDuration });
                setDragLabel({ assetId: pointerInfo.assetId, value: pointerInfo.initialDuration });
            }
            handlePointerUp();
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
            handlePointerUp();
            event.preventDefault();
        }
    };

    useEffect(() => {
        if (highlightFading) {
            const timeout = setTimeout(() => {
                setHighlightTick(null);
                setHighlightFading(false);
            }, 180);
            return () => clearTimeout(timeout);
        }
        return undefined;
    }, [highlightFading]);

    const gridMarkers = useMemo(() => {
        const markers = [];
        const majorStep = totalDuration <= 10 ? 1 : totalDuration <= 60 ? 5 : 10;
        for (let time = 0; time <= totalDuration; time += majorStep) {
            const percent = (time / (totalDuration || 1)) * 100;
            markers.push({ time, percent });
        }
        return markers;
    }, [totalDuration]);

    return (
        <div className='mt-2 flex h-12 w-full flex-col gap-1'>
            <div className='relative h-3 w-full'>
                {gridMarkers.map((marker) => (
                    <div
                        key={marker.time}
                        className={clsx(
                            'absolute top-0 h-full w-px bg-[rgba(148,163,184,0.3)] transition-colors',
                            highlightTick != null && Math.abs(marker.time - highlightTick) < 0.5
                                ? 'bg-[rgba(236,233,254,0.75)]'
                                : '',
                        )}
                        style={{ left: `${marker.percent}%` }}
                    >
                        <span className='absolute left-1 top-full mt-0.5 text-[9px] uppercase tracking-[0.2em] text-[rgba(148,163,184,0.6)]'>
                            {marker.time}s
                        </span>
                    </div>
                ))}
                {highlightTick != null ? (
                    <div
                        className='pointer-events-none absolute top-0 h-full w-px bg-[rgba(236,233,254,0.8)]'
                        style={{ left: `${(highlightTick / (totalDuration || 1)) * 100}%` }}
                    >
                        <div
                            className={clsx(
                                'absolute -top-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border border-[rgba(236,233,254,0.45)] bg-[rgba(15,23,42,0.9)] px-2 py-1 text-[10px] font-semibold text-[rgba(236,233,254,0.92)] shadow-lg transition-opacity',
                                highlightFading ? 'opacity-0' : 'opacity-100',
                            )}
                        >
                            {highlightTick.toFixed(2)}s
                        </div>
                    </div>
                ) : null}
            </div>
            <div className='flex h-7 w-full items-center gap-1'>
            {normalizedAssets.map((asset) => (
                    <div
                        key={asset.id}
                        className={clsx(
                            'relative h-full rounded-full border border-transparent transition-shadow',
                            activeAssetId === asset.id ? 'shadow-[0_0_0_2px_rgba(236,233,254,0.75)]' : '',
                        )}
                    style={{
                        marginLeft: `${asset.leftPercent}%`,
                        width: `${asset.widthPercent}%`,
                        ...asset.preview.style,
                        border: asset.preview.style?.border || '1px solid rgba(59,130,246,0.35)',
                    }}
                        title={`${asset.label} • ${asset.duration.toFixed(2)}s • offset ${asset.offset.toFixed(2)}s`}
                    >
                        <div className='flex h-full items-center justify-center gap-1 px-2 text-[10px] font-semibold text-[rgba(226,232,240,0.92)]'>
                            <span>{asset.preview.icon}</span>
                            <span className='truncate'>{asset.label}</span>
                        </div>
                        {dragLabel?.assetId === asset.id ? (
                            <div className='pointer-events-none absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border border-[rgba(236,233,254,0.45)] bg-[rgba(15,23,42,0.85)] px-2 py-1 text-[10px] font-semibold text-[rgba(236,233,254,0.92)] shadow-lg'>
                                <span>{dragLabel.value.toFixed(2)}s</span>
                            </div>
                        ) : null}
                    {asset.thumbnailUrl ? (
                        <div className='pointer-events-none absolute inset-x-1 bottom-[2px] top-[2px] overflow-hidden rounded-full opacity-70'>
                            <img src={asset.thumbnailUrl} alt={asset.label} className='h-full w-full object-cover' />
                        </div>
                    ) : null}
                    {asset.preview.icon === '🎵' && asset.waveformValues.length > 0 && asset.maxWaveform > 0 ? (
                        <svg className='pointer-events-none absolute inset-x-2 bottom-1 top-1 opacity-70' viewBox='0 0 100 100' preserveAspectRatio='none'>
                            {asset.waveformValues.map((value, index) => {
                                const normalized = (Math.abs(value) / asset.maxWaveform) * 40;
                                const x = (index / asset.waveformValues.length) * 100;
                                const y1 = 50 - normalized;
                                const y2 = 50 + normalized;
                                return (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <line key={index} x1={x} x2={x} y1={y1} y2={y2} stroke='rgba(236,233,254,0.75)' strokeWidth={0.8} />
                                );
                            })}
                        </svg>
                    ) : null}
                    <div
                        role='button'
                        tabIndex={0}
                        className='absolute left-0 top-0 h-full w-2 cursor-ew-resize rounded-l-full bg-[rgba(15,23,42,0.45)]'
                        onPointerDown={(event) => handleDragStart(event, asset.id, 'offset')}
                    />
                    <div
                        role='button'
                        tabIndex={0}
                        className='absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-full bg-[rgba(15,23,42,0.45)]'
                        onPointerDown={(event) => handleDragStart(event, asset.id, 'end')}
                    />
                    <div className='absolute inset-x-2 bottom-0 flex h-4 items-end gap-1 opacity-0 hover:opacity-100'>
                        <input
                            type='number'
                            value={asset.offset.toFixed(2)}
                            min={0}
                            step={0.1}
                            onChange={(event) => updateTimelineAsset(asset.id, { offset: Number(event.target.value) || 0 })}
                            className='w-16 rounded-md border border-[rgba(148,163,184,0.3)] bg-[rgba(15,23,42,0.7)] px-1 py-0.5 text-[10px] text-[rgba(236,233,254,0.92)] focus:border-[rgba(139,92,246,0.6)]'
                        />
                        <input
                            type='number'
                            value={asset.duration.toFixed(2)}
                            min={0.1}
                            step={0.1}
                            onChange={(event) => updateTimelineAsset(asset.id, { duration: Number(event.target.value) || 0.1 })}
                            className='w-16 rounded-md border border-[rgba(148,163,184,0.3)] bg-[rgba(15,23,42,0.7)] px-1 py-0.5 text-[10px] text-[rgba(236,233,254,0.92)] focus:border-[rgba(139,92,246,0.6)]'
                        />
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}
