'use client';

import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasStore } from './context/CanvasStore';
import { resolveTool } from './utils/toolBehaviors';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

const DEFAULT_TRACK_ORDER = ['clip', 'overlay', 'audio', 'segment'];
const DEFAULT_TRACK_LABELS = {
    clip: 'Clip',
    overlay: 'Overlay',
    audio: 'Audio',
    segment: 'Segment',
};

const formatCategoryLabel = (value) => {
    if (!value) return 'Layer';
    const normalized = value.replace(/[-_]/g, ' ').trim();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatSeconds = (value) => {
    const seconds = Math.max(0, Number.isFinite(value) ? value : 0);
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds - minutes * 60;
        return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`;
    }
    return seconds.toFixed(2);
};

export default function TimelineBar({ frameId, assets, totalDuration, getTimelineStyles, trackConfig = {} }) {
    const mode = useCanvasStore((state) => state.mode);
    const updateTimelineAsset = useCanvasStore((state) => state.updateTimelineAsset);
    const addTimelineAsset = useCanvasStore((state) => state.addTimelineAsset);
    const selectedTool = useCanvasStore((state) => state.selectedTool);
    const setSelectedTool = useCanvasStore((state) => state.setSelectedTool);
    const timelinePlayback = useCanvasStore((state) => state.timelinePlayback);
    const stepTimelinePlayback = useCanvasStore((state) => state.stepTimelinePlayback);
    const setTimelinePlayhead = useCanvasStore((state) => state.setTimelinePlayhead);
    const playTimeline = useCanvasStore((state) => state.playTimeline);
    const pauseTimeline = useCanvasStore((state) => state.pauseTimeline);
    const setTimelineLoop = useCanvasStore((state) => state.setTimelineLoop);
    const placeAssetOnTimeline = useCanvasStore((state) => state.placeAssetOnTimeline);
    const wrapperRef = useRef(null);
    const surfaceRef = useRef(null);
    const scrubPointerRef = useRef(null);
    const pointerDownRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const [activeAssetId, setActiveAssetId] = useState(null);
    const [dragLabel, setDragLabel] = useState(null);
    const [highlightTick, setHighlightTick] = useState(null);
    const [highlightFading, setHighlightFading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropIndicatorPercent, setDropIndicatorPercent] = useState(null);

    const trackOrder = useMemo(() => {
        const baseOrder = Array.isArray(trackConfig.order) && trackConfig.order.length
            ? trackConfig.order
            : DEFAULT_TRACK_ORDER;
        const inferredTypes = assets.map((asset) => asset.type ?? 'clip');
        return Array.from(new Set([...baseOrder, ...inferredTypes]));
    }, [assets, trackConfig.order]);

    const trackLabels = useMemo(
        () => ({ ...DEFAULT_TRACK_LABELS, ...(trackConfig.labels ?? {}) }),
        [trackConfig.labels],
    );

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
            const trackType = asset.type ?? 'clip';

            return {
                ...asset,
                duration,
                offset,
                widthPercent,
                leftPercent,
                preview,
                waveformValues,
                maxWaveform,
                trackType,
            };
        });
    }, [assets, totalDuration, getTimelineStyles]);

    const tracks = useMemo(() => {
        if (normalizedAssets.length === 0) return [];
        const bucket = new Map();
        normalizedAssets.forEach((asset) => {
            const key = asset.trackType ?? 'clip';
            if (!bucket.has(key)) {
                bucket.set(key, []);
            }
            bucket.get(key).push(asset);
        });
        return trackOrder
            .filter((key) => bucket.has(key))
            .map((key) => ({
                type: key,
                label: trackLabels[key] ?? formatCategoryLabel(key),
                items: bucket.get(key).sort((a, b) => a.offset - b.offset),
            }));
    }, [normalizedAssets, trackLabels, trackOrder]);
    const isActiveTimeline = timelinePlayback.frameId === frameId;
    const playheadSeconds = isActiveTimeline ? timelinePlayback.playhead ?? 0 : 0;
    const effectiveDuration = totalDuration || 1;
    const playheadPercent = Math.min(100, Math.max(0, (playheadSeconds / effectiveDuration) * 100));
    const loopEnabled = Boolean(timelinePlayback.loop);
    const isPlaying = isActiveTimeline && timelinePlayback.isPlaying;
    const setSurfaceRef = useCallback((node) => {
        if (node) {
            surfaceRef.current = node;
        }
    }, []);

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
            hasChanged: false,
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
            updateTimelineAsset(asset.id, { offset: nextOffset }, { log: false, skipHistory: true });
            setDragLabel({ assetId, value: nextOffset });
            if (shiftKey) {
                setHighlightTick(Math.round(nextOffset / gridStep) * gridStep);
                setHighlightFading(false);
            }
            pointerInfo.hasChanged = true;
        } else if (handleType === 'end') {
            const nextDuration = clamp(asset.duration + snappedDelta, 0.1, totalDuration - asset.offset);
            updateTimelineAsset(asset.id, { duration: nextDuration }, { log: false, skipHistory: true });
            setDragLabel({ assetId, value: nextDuration });
            if (shiftKey) {
                setHighlightTick(Math.round((asset.offset + nextDuration) / gridStep) * gridStep);
                setHighlightFading(false);
            }
            pointerInfo.hasChanged = true;
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
                    const action = pointerInfo.handleType === 'offset' ? 'offset' : 'duration';
                    storeState.commitHistory(
                        `Timeline: Adjust ${action} for "${asset.label}"`,
                        'timeline',
                    );
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
                updateTimelineAsset(pointerInfo.assetId, { offset: pointerInfo.initialOffset }, { skipHistory: true });
                setDragLabel({ assetId: pointerInfo.assetId, value: pointerInfo.initialOffset });
            } else {
                updateTimelineAsset(pointerInfo.assetId, { duration: pointerInfo.initialDuration }, { skipHistory: true });
                setDragLabel({ assetId: pointerInfo.assetId, value: pointerInfo.initialDuration });
            }
            handlePointerUp();
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
            handlePointerUp();
            event.preventDefault();
        }
    };

    const handleSurfacePointerDown = (event) => {
        if (event.button !== 0) return;
        if (!surfaceRef.current) return;
        if (event.target.closest('[data-asset-block="true"]')) return;
        if (event.target.closest('[data-asset-handle="true"]')) return;
        const rect = surfaceRef.current.getBoundingClientRect();
        if (!rect || rect.width <= 0) return;
        const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const action = resolveTool(selectedTool, mode);
        if (action.type === 'timeline') {
            const baseDuration = action.duration ?? Math.max(totalDuration * 0.1, 1);
            const candidateStart = ratio * (totalDuration || 1);
            const duration = Math.min(baseDuration, totalDuration || baseDuration);
            const offset = clamp(candidateStart, 0, Math.max(0, (totalDuration || duration) - duration));
            const label = action.label ?? `Add ${action.assetType ?? 'clip'}`;
            addTimelineAsset({
                frameId,
                label,
                type: action.assetType ?? 'clip',
                duration,
                offset,
                thumbnailUrl: action.thumbnailUrl ?? null,
                waveform: action.waveform ?? null,
                historyLabel: action.historyLabel ?? `Timeline: Add ${action.assetType ?? 'asset'}`,
                source: 'timeline',
            });
            setTimelinePlayhead(frameId, offset, { resetTick: true });
            if (action.autoPlay) {
                playTimeline(frameId);
            }
            if (action.resetTool !== false) {
                setSelectedTool('pointer');
            }
            return;
        }
        const nextTime = ratio * totalDuration;
        setTimelinePlayhead(frameId, nextTime, { resetTick: true });
        scrubPointerRef.current = { rect };
        window.addEventListener('pointermove', handleSurfacePointerMove);
        window.addEventListener('pointerup', handleSurfacePointerUp);
    };

    const handleSurfacePointerMove = (event) => {
        const info = scrubPointerRef.current;
        if (!info || !info.rect || info.rect.width <= 0) return;
        const ratio = clamp((event.clientX - info.rect.left) / info.rect.width, 0, 1);
        setTimelinePlayhead(frameId, ratio * totalDuration, { resetTick: true });
    };

    const handleSurfacePointerUp = () => {
        scrubPointerRef.current = null;
        window.removeEventListener('pointermove', handleSurfacePointerMove);
        window.removeEventListener('pointerup', handleSurfacePointerUp);
    };

    const handleTimelineDragOver = (event) => {
        if (!surfaceRef.current) return;
        const types = Array.from(event.dataTransfer?.types ?? []);
        if (!types.includes('application/x-dropple-asset')) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
        const rect = surfaceRef.current.getBoundingClientRect();
        if (rect.width > 0) {
            const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
            setDropIndicatorPercent(ratio * 100);
        }
    };

    const handleTimelineDragLeave = (event) => {
        if (wrapperRef.current && event.relatedTarget && wrapperRef.current.contains(event.relatedTarget)) {
            return;
        }
        setIsDragOver(false);
        setDropIndicatorPercent(null);
    };

    const handleTimelineDrop = (event) => {
        if (!surfaceRef.current) return;
        event.preventDefault();
        setIsDragOver(false);
        const payload = event.dataTransfer.getData('application/x-dropple-asset');
        setDropIndicatorPercent(null);
        if (!payload) return;
        try {
            const data = JSON.parse(payload);
            if (!data?.assetId) return;
            const rect = surfaceRef.current.getBoundingClientRect();
            let offsetSeconds = 0;
            if (rect.width > 0) {
                const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
                offsetSeconds = ratio * totalDuration;
            }
            placeAssetOnTimeline(data.assetId, frameId, { offset: offsetSeconds });
            setTimelinePlayhead(frameId, offsetSeconds, { resetTick: true });
        } catch (error) {
            console.error('Unable to drop asset on timeline', error);
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

    useEffect(
        () => () => {
            window.removeEventListener('pointermove', handleSurfacePointerMove);
            window.removeEventListener('pointerup', handleSurfacePointerUp);
        },
        [],
    );

    useEffect(() => {
        if (!isActiveTimeline || !isPlaying) return undefined;
        let frameHandle = null;
        const tick = () => {
            stepTimelinePlayback();
            frameHandle = requestAnimationFrame(tick);
        };
        frameHandle = requestAnimationFrame(tick);
        return () => {
            if (frameHandle) cancelAnimationFrame(frameHandle);
        };
    }, [isActiveTimeline, isPlaying, stepTimelinePlayback]);

    const gridMarkers = useMemo(() => {
        const markers = [];
        const majorStep = totalDuration <= 10 ? 1 : totalDuration <= 60 ? 5 : 10;
        for (let time = 0; time <= totalDuration; time += majorStep) {
            const percent = (time / (totalDuration || 1)) * 100;
            markers.push({ time, percent });
        }
        return markers;
    }, [totalDuration]);

    const effectiveTracks = tracks.length > 0 ? tracks : [{ type: '__empty__', label: 'Clips', items: [] }];
    return (
        <div className='mt-3 w-full select-none'>
            <div
                ref={wrapperRef}
                className={clsx(
                    'relative rounded-xl border border-[rgba(59,130,246,0.35)] bg-[rgba(8,15,35,0.78)] px-3 py-3 transition-shadow',
                    isDragOver ? 'border-[rgba(236,233,254,0.75)] shadow-[0_0_35px_rgba(139,92,246,0.35)]' : '',
                )}
                onPointerDown={handleSurfacePointerDown}
                onDragOver={handleTimelineDragOver}
                onDragLeave={handleTimelineDragLeave}
                onDrop={handleTimelineDrop}
            >
                <div className='pointer-events-none absolute inset-0'>
                    {gridMarkers.map((marker) => (
                        <div
                            key={marker.time}
                            className={clsx(
                                'absolute top-2 bottom-2 w-px bg-[rgba(148,163,184,0.22)] transition-colors',
                                highlightTick != null && Math.abs(marker.time - highlightTick) < 0.5
                                    ? 'bg-[rgba(236,233,254,0.75)]'
                                    : '',
                            )}
                            style={{ left: `${marker.percent}%` }}
                        />
                    ))}
                </div>
                <div className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-3'>
                    {effectiveTracks.map((track, index) => (
                        <Fragment key={track.type}>
                            <div className='pt-2 text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                {track.label}
                            </div>
                            <div
                                className={clsx(
                                    'relative flex min-h-[48px] items-center rounded-lg border',
                                    track.items.length > 0
                                        ? 'border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.6)]'
                                        : 'border-dashed border-[rgba(148,163,184,0.28)] bg-[rgba(15,23,42,0.45)]',
                                )}
                                data-track-type={track.type}
                                ref={index === 0 ? setSurfaceRef : undefined}
                            >
                                {track.items.length === 0 ? (
                                    <span className='w-full text-center text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                        Drop assets here
                                    </span>
                                ) : (
                                    track.items.map((asset) => (
                                        <div
                                            key={asset.id}
                                            data-asset-block='true'
                                            className={clsx(
                                                'absolute top-2 flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-medium text-white transition-[box-shadow,transform]',
                                                activeAssetId === asset.id
                                                    ? 'border-[rgba(236,233,254,0.9)] shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                                                    : 'border-[rgba(148,163,184,0.3)] shadow-[0_6px_18px_rgba(8,15,35,0.45)]',
                                            )}
                                            style={{
                                                left: `calc(${asset.leftPercent}% - 1px)`,
                                                width: `calc(${asset.widthPercent}% + 2px)`,
                                                ...(asset.preview?.style ?? {
                                                    backgroundImage:
                                                        'linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(139,92,246,0.55) 100%)',
                                                }),
                                            }}
                                        >
                                            <span>{asset.preview?.icon ?? '•'}</span>
                                            <span className='max-w-[140px] truncate'>{asset.label}</span>
                                            <span className='text-[10px] text-[rgba(226,232,240,0.6)]'>
                                                {asset.duration.toFixed(1)}s
                                            </span>
                                            <div
                                                data-asset-handle='true'
                                                onPointerDown={(event) => handleDragStart(event, asset.id, 'offset')}
                                                className='absolute inset-y-0 left-0 w-2 cursor-col-resize rounded-l-lg bg-[rgba(15,23,42,0.55)]'
                                            />
                                            <div
                                                data-asset-handle='true'
                                                onPointerDown={(event) => handleDragStart(event, asset.id, 'end')}
                                                className='absolute inset-y-0 right-0 w-2 cursor-col-resize rounded-r-lg bg-[rgba(15,23,42,0.55)]'
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </Fragment>
                    ))}
                </div>
                {dropIndicatorPercent != null ? (
                    <div
                        className='pointer-events-none absolute top-2 bottom-2 w-[2px] rounded-full bg-[rgba(59,130,246,0.8)] shadow-[0_0_10px_rgba(59,130,246,0.45)]'
                        style={{ left: `${dropIndicatorPercent}%` }}
                    />
                ) : null}
                <div
                    className='pointer-events-none absolute top-2 bottom-2 w-[2px] rounded-full bg-[rgba(236,233,254,0.85)] shadow-[0_0_15px_rgba(139,92,246,0.55)]'
                    style={{ left: `${playheadPercent}%` }}
                />
            </div>
            <div className='mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                <span>
                    {highlightTick != null
                        ? `Snapped to ${highlightTick.toFixed(1)}s`
                        : 'Shift-drag for snapping · drop assets from the library'}
                </span>
                <span>
                    {formatSeconds(playheadSeconds)} / {formatSeconds(totalDuration)}
                </span>
            </div>
            {dragLabel ? (
                <div className='mt-1 text-[10px] uppercase tracking-[0.25em] text-[rgba(191,219,254,0.8)]'>
                    {dragLabel.value.toFixed(2)}s
                </div>
            ) : null}
        </div>
    );
}
