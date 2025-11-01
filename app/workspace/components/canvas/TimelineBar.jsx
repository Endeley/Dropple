'use client';

import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCanvasStore } from './context/CanvasStore';
import { resolveTool } from './utils/toolBehaviors';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

const isTimelineFileType = (value) =>
    typeof value === 'string' && (value.startsWith('video') || value.startsWith('audio'));

const TIMELINE_FILE_EXTENSIONS = new Set([
    'mp4',
    'mov',
    'm4v',
    'webm',
    'mkv',
    'avi',
    'mpg',
    'mpeg',
    'ogv',
    'wmv',
    'mp3',
    'wav',
    'aac',
    'flac',
    'ogg',
    'oga',
    'm4a',
    'aiff',
    'aif',
    'wma',
    'opus',
    'weba',
]);

const matchesTimelineExtension = (name) => {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return false;
    const dotIndex = trimmed.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === trimmed.length - 1) return false;
    const extension = trimmed.slice(dotIndex + 1);
    return TIMELINE_FILE_EXTENSIONS.has(extension);
};

const isTimelineFile = (file) => {
    if (!file) return false;
    if (isTimelineFileType(file.type)) return true;
    return matchesTimelineExtension(file.name);
};

const DEFAULT_TRACK_ORDER = ['clip', 'audio'];
const DEFAULT_TRACK_LABELS = {
    clip: 'Clip',
    audio: 'Audio',
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

const PIXELS_PER_SECOND = 120;
const LABEL_COLUMN_WIDTH = 132;
const TIMELINE_GAP_X = 16; // gap-x-4
const TIMELINE_PADDING_X = 16; // px-4
const TIMELINE_LEFT_OFFSET = TIMELINE_PADDING_X + LABEL_COLUMN_WIDTH + TIMELINE_GAP_X;
const WAVEFORM_BASELINE = 50;
const WAVEFORM_AMPLITUDE = 44;
const TARGET_WAVEFORM_SAMPLES = 180;

const resampleValues = (values, targetLength) => {
    if (!Array.isArray(values) || values.length === 0) return [];
    if (values.length >= targetLength) return values;
    const result = [];
    const lastIndex = values.length - 1;
    for (let index = 0; index < targetLength; index += 1) {
        const position = (index / (targetLength - 1)) * lastIndex;
        const leftIndex = Math.floor(position);
        const rightIndex = Math.min(lastIndex, leftIndex + 1);
        const ratio = position - leftIndex;
        const leftValue = values[leftIndex] ?? 0;
        const rightValue = values[rightIndex] ?? leftValue;
        result.push(leftValue + (rightValue - leftValue) * ratio);
    }
    return result;
};

const computeWaveformShape = (values, maxWaveform) => {
    if (!Array.isArray(values) || values.length === 0 || !(Number.isFinite(maxWaveform) && maxWaveform > 0)) {
        return { fillPath: null, strokePath: null };
    }
    const samples =
        values.length >= TARGET_WAVEFORM_SAMPLES ? values : resampleValues(values, TARGET_WAVEFORM_SAMPLES);
    if (samples.length < 2) {
        return { fillPath: null, strokePath: null };
    }
    const step = 100 / (samples.length - 1);
    const topPoints = [];
    const bottomPoints = [];
    let strokePath = '';
    samples.forEach((rawValue, index) => {
        const normalized = clamp(rawValue / maxWaveform, -1, 1) || 0;
        const magnitude = Math.abs(normalized);
        const x = index === samples.length - 1 ? 100 : step * index;
        const topY = WAVEFORM_BASELINE - magnitude * WAVEFORM_AMPLITUDE;
        const bottomY = WAVEFORM_BASELINE + magnitude * WAVEFORM_AMPLITUDE;
        topPoints.push({ x, y: topY });
        bottomPoints.push({ x, y: bottomY });
        strokePath += `${index === 0 ? 'M' : ' L'}${x.toFixed(2)} ${topY.toFixed(2)}`;
    });
    const fillSegments = [`M0 ${WAVEFORM_BASELINE.toFixed(2)}`];
    topPoints.forEach((point) => {
        fillSegments.push(`L${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    });
    fillSegments.push(`L100 ${WAVEFORM_BASELINE.toFixed(2)}`);
    bottomPoints
        .slice()
        .reverse()
        .forEach((point) => {
            fillSegments.push(`L${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
        });
    fillSegments.push('Z');
    return { fillPath: fillSegments.join(' '), strokePath };
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
    const ingestTimelineFiles = useCanvasStore((state) => state.ingestTimelineFiles);
    const setContextMenu = useCanvasStore((state) => state.setContextMenu);
    const setTimelineSelectedAssets = useCanvasStore((state) => state.setTimelineSelectedAssets);
    const timelineSelectedAssetIds = useCanvasStore((state) => state.timelineSelectedAssetIds ?? []);
    const selectTimelineAssetInStore = useCanvasStore((state) => state.selectTimelineAsset);
    const clearTimelineSelection = useCanvasStore((state) => state.clearTimelineSelection);
    const removeTimelineAssets = useCanvasStore((state) => state.removeTimelineAssets);
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
    const [dropIndicatorX, setDropIndicatorX] = useState(null);
    const [marqueeBounds, setMarqueeBounds] = useState(null);
    const marqueeRef = useRef(null);

    const trackOrder = useMemo(() => {
        const baseOrder =
            Array.isArray(trackConfig.order) && trackConfig.order.length ? trackConfig.order : DEFAULT_TRACK_ORDER;
        const baseSet = new Set(baseOrder);
        const inferred = assets
            .map((asset) => (asset.trackKey ?? asset.metadata?.trackKey ?? asset.type ?? 'clip'))
            .filter((type) => !baseSet.has(type));
        return [...baseOrder, ...new Set(inferred)];
    }, [assets, trackConfig.order]);

    const trackLabels = useMemo(
        () => ({ ...DEFAULT_TRACK_LABELS, ...(trackConfig.labels ?? {}) }),
        [trackConfig.labels],
    );

    const normalizedAssets = useMemo(() => {
        return assets
            .map((asset, index) => ({
                asset,
                index,
            }))
            .sort((a, b) => {
                const offsetA = a.asset.offset ?? 0;
                const offsetB = b.asset.offset ?? 0;
                if (offsetA === offsetB) return a.index - b.index;
                return offsetA - offsetB;
            })
            .map(({ asset }) => {
            const duration = Math.max(0.1, asset.duration || 1);
            const offset = Math.max(asset.offset || 0, 0);
            const leftPx = offset * PIXELS_PER_SECOND;
            const widthPx = Math.max(duration * PIXELS_PER_SECOND, 4);
            const preview = getTimelineStyles(asset);
            const waveformValues = Array.isArray(asset.waveform) ? asset.waveform : [];
            const maxWaveform = waveformValues.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
            const trackKey = asset.trackKey ?? asset.metadata?.trackKey ?? null;
            const trackType = trackKey ?? asset.type ?? 'clip';
            const providedLabel = asset.metadata?.trackLabel ?? null;
            const waveformColor =
                preview?.waveformColor ??
                (trackType === 'audio' ? 'rgba(191,219,254,0.9)' : 'rgba(236,233,254,0.7)');
            const waveformShape = computeWaveformShape(waveformValues, maxWaveform);

            return {
                ...asset,
                duration,
                offset,
                leftPx,
                widthPx,
                preview,
                waveformValues,
                maxWaveform,
                trackType,
                trackLabel: providedLabel,
                waveformColor,
                waveformFillPath: waveformShape.fillPath,
                waveformStrokePath: waveformShape.strokePath,
            };
        });
    }, [assets, totalDuration, getTimelineStyles]);

    const tracks = useMemo(() => {
        if (trackOrder.length === 0) return [];
        const grouped = normalizedAssets.reduce((acc, asset) => {
            const key = asset.trackType ?? 'clip';
            if (!acc.has(key)) {
                acc.set(key, []);
            }
            acc.get(key).push(asset);
            return acc;
        }, new Map());

        const entries = [];

        trackOrder.forEach((type) => {
            const baseLabel = trackLabels[type] ?? formatCategoryLabel(type);
            const items = (grouped.get(type) ?? []).sort((a, b) => a.offset - b.offset);

            const primaryAsset = items[0] ?? null;
            entries.push({
                type: `${type}-primary`,
                label: baseLabel,
                items: primaryAsset ? [primaryAsset] : [],
                baseType: type,
                placeholder: !primaryAsset,
            });

            if (items.length <= 1) {
                return;
            }

            items.slice(1).forEach((asset, index) => {
                const laneLabel = `${baseLabel} ${index + 2}`;
                entries.push({
                    type: `${type}-${asset.id}`,
                    label: laneLabel,
                    items: [asset],
                    baseType: type,
                    placeholder: false,
                });
            });
        });

        return entries;
    }, [normalizedAssets, trackLabels, trackOrder]);
    const isActiveTimeline = timelinePlayback.frameId === frameId;
    const playheadSeconds = isActiveTimeline ? timelinePlayback.playhead ?? 0 : 0;
    const playheadLeft = Math.min(playheadSeconds, totalDuration || 0) * PIXELS_PER_SECOND;
    const timelineWidth = Math.max((totalDuration || 1) * PIXELS_PER_SECOND, 960);
    const loopEnabled = Boolean(timelinePlayback.loop);
    const isPlaying = isActiveTimeline && timelinePlayback.isPlaying;
    const setSurfaceRef = useCallback((node) => {
        if (node) {
            surfaceRef.current = node;
        }
    }, []);

    const collectTimelineFiles = (dataTransfer) => {
        if (!dataTransfer) return [];
        const files = [];
        const seen = new Set();
        const pushFile = (file) => {
            if (!isTimelineFile(file)) return;
            const key = `${file.name ?? 'file'}::${file.size ?? 0}::${file.lastModified ?? 0}`;
            if (seen.has(key)) return;
            seen.add(key);
            files.push(file);
        };
        Array.from(dataTransfer.files ?? []).forEach(pushFile);
        Array.from(dataTransfer.items ?? []).forEach((item) => {
            if (!item || item.kind !== 'file') return;
            const candidate = item.getAsFile();
            if (candidate) pushFile(candidate);
        });
        return files;
    };

    const handleDragStart = (event, assetId, handleType) => {
        event.stopPropagation();
        if (selectedTool !== 'pointer') return;
        const currentAsset = normalizedAssets.find((item) => item.id === assetId);
        if (!currentAsset) return;
        const additive = event.shiftKey || event.metaKey || event.ctrlKey;
        if (!timelineSelectedAssetIds.includes(assetId)) {
            selectTimelineAssetInStore(assetId, { mode: additive ? 'append' : 'replace' });
        } else if (!additive) {
            selectTimelineAssetInStore(assetId, { mode: 'replace' });
        }
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

    const updateMarqueeSelection = useCallback(
        (clientX, clientY) => {
            if (!surfaceRef.current) return;
            const rect = surfaceRef.current.getBoundingClientRect();
            if (!rect || rect.width <= 0) return;
            const info = marqueeRef.current;
            if (!info) return;
            const clampedX = clamp(clientX, rect.left, rect.right);
            const startX = clamp(info.startClientX, rect.left, rect.right);
            const localStartPx = clamp(Math.min(startX, clampedX) - rect.left, 0, timelineWidth);
            const localEndPx = clamp(Math.max(startX, clampedX) - rect.left, 0, timelineWidth);
            const startTime = Math.min(localStartPx / PIXELS_PER_SECOND, totalDuration);
            const endTime = Math.min(localEndPx / PIXELS_PER_SECOND, totalDuration);
            const baseBounds = {
                left: Math.min(startX, clampedX) - rect.left,
                width: Math.abs(clampedX - startX),
            };
            const wrapperRect = info.wrapperRect ?? wrapperRef.current?.getBoundingClientRect();
            if (!wrapperRect || wrapperRect.height <= 0) {
                setMarqueeBounds(baseBounds);
                const selectedIds = normalizedAssets
                    .filter((asset) => {
                        const assetStart = asset.offset ?? 0;
                        const assetEnd = assetStart + (asset.duration ?? 0);
                        return assetStart < endTime && assetEnd > startTime;
                    })
                    .map((asset) => asset.id);
                setTimelineSelectedAssets(selectedIds);
                return;
            }
            const clampedY = clamp(
                clientY ?? info.startClientY,
                wrapperRect.top,
                wrapperRect.bottom,
            );
            const startY = clamp(info.startClientY, wrapperRect.top, wrapperRect.bottom);
            const top = Math.min(startY, clampedY) - wrapperRect.top;
            const height = Math.max(2, Math.abs(clampedY - startY));
            setMarqueeBounds({ ...baseBounds, top, height });
            const activeTrackTypes = (() => {
                const candidates = (info.trackRects ?? []).filter((entry) => {
                    const trackTop = entry.rect.top;
                    const trackBottom = entry.rect.bottom;
                    return Math.max(trackTop, Math.min(startY, clampedY)) < Math.min(trackBottom, Math.max(startY, clampedY));
                });
                if (candidates.length > 0) {
                    return candidates.map((entry) => entry.type);
                }
                return info.startTrackType ? [info.startTrackType] : [];
            })();
            const selectedIds = normalizedAssets
                .filter((asset) => {
                    if (activeTrackTypes.length > 0) {
                        const trackType = asset.trackType ?? 'clip';
                        if (!activeTrackTypes.includes(trackType)) {
                            return false;
                        }
                    }
                    const assetStart = asset.offset ?? 0;
                    const assetEnd = assetStart + (asset.duration ?? 0);
                    return assetStart < endTime && assetEnd > startTime;
                })
                .map((asset) => asset.id);
            setTimelineSelectedAssets(selectedIds);
        },
        [normalizedAssets, setTimelineSelectedAssets, timelineWidth, totalDuration],
    );

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
        return;
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
        if (event.target.closest('[data-asset-handle="true"]')) return;
        if (event.target.closest('[data-asset-block="true"]')) {
            return;
        }
        if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
            clearTimelineSelection();
            setActiveAssetId(null);
        }
        const rect = surfaceRef.current.getBoundingClientRect();
        if (!rect || rect.width <= 0) return;
        const localX = clamp(event.clientX - rect.left, 0, timelineWidth);
        const positionSeconds = Math.min(localX / PIXELS_PER_SECOND, totalDuration || 0);
        const action = resolveTool(selectedTool, mode);
        const wrapperRect = wrapperRef.current?.getBoundingClientRect() ?? null;
        const trackRects = wrapperRef.current
            ? Array.from(wrapperRef.current.querySelectorAll('[data-track-type]')).map((element) => ({
                  type: element.getAttribute('data-track-type') ?? 'clip',
                  rect: element.getBoundingClientRect(),
              }))
            : [];
        const startTrackType =
            trackRects.find((entry) => {
                const { top: trackTop, bottom: trackBottom } = entry.rect;
                return event.clientY >= trackTop && event.clientY <= trackBottom;
            })?.type ?? null;
        marqueeRef.current = {
            startClientX: event.clientX,
            startClientY: event.clientY,
            rect,
            wrapperRect,
            trackRects,
            startTrackType,
        };
        const initialTop = wrapperRect ? clamp(event.clientY, wrapperRect.top, wrapperRect.bottom) - wrapperRect.top : 0;
        setMarqueeBounds({ left: event.clientX - rect.left, width: 0, top: initialTop, height: 0 });
        if (action.type === 'timeline') {
            const baseDuration = action.duration ?? Math.max(totalDuration * 0.1, 1);
            const candidateStart = positionSeconds;
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
        setTimelinePlayhead(frameId, positionSeconds, { resetTick: true });
        scrubPointerRef.current = { rect };
        window.addEventListener('pointermove', handleSurfacePointerMove);
        window.addEventListener('pointerup', handleSurfacePointerUp);
    };

    const handleSurfacePointerMove = (event) => {
        const info = scrubPointerRef.current;
        if (!info || !info.rect || info.rect.width <= 0) return;
        const localX = clamp(event.clientX - info.rect.left, 0, timelineWidth);
        const seconds = Math.min(localX / PIXELS_PER_SECOND, totalDuration);
        setTimelinePlayhead(frameId, seconds, { resetTick: true });
        if (marqueeRef.current) {
            updateMarqueeSelection(event.clientX, event.clientY);
        }
    };

    const handleSurfacePointerUp = (event) => {
        scrubPointerRef.current = null;
        window.removeEventListener('pointermove', handleSurfacePointerMove);
        window.removeEventListener('pointerup', handleSurfacePointerUp);
        if (marqueeRef.current) {
            const fallbackX = marqueeRef.current.startClientX ?? 0;
            const fallbackY = marqueeRef.current.startClientY ?? 0;
            updateMarqueeSelection(event?.clientX ?? fallbackX, event?.clientY ?? fallbackY);
            marqueeRef.current = null;
            setMarqueeBounds(null);
        }
    };

    const handleTimelineDragOver = (event) => {
        if (!surfaceRef.current) return;
        const dataTransfer = event.dataTransfer;
        const types = Array.from(dataTransfer?.types ?? []);
        const hasAssetPayload = types.includes('application/x-dropple-asset');
        const hasFileIntent = types.some(
            (type) => type === 'Files' || (typeof type === 'string' && type.toLowerCase().includes('file')),
        );
        const fileMatches = collectTimelineFiles(dataTransfer);
        if (!hasAssetPayload && !hasFileIntent && fileMatches.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        if (dataTransfer) {
            dataTransfer.dropEffect = 'copy';
        }
        setIsDragOver(true);
        const rect = surfaceRef.current.getBoundingClientRect();
        if (rect.width > 0) {
            const localX = clamp(event.clientX - rect.left, 0, timelineWidth);
            setDropIndicatorX(localX);
        }
    };

    const handleTimelineDragLeave = (event) => {
        if (wrapperRef.current && event.relatedTarget && wrapperRef.current.contains(event.relatedTarget)) {
            return;
        }
        setIsDragOver(false);
        setDropIndicatorX(null);
    };

    const handleTimelineDrop = (event) => {
        if (!surfaceRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
        setDropIndicatorX(null);
        const dataTransfer = event.dataTransfer;
        const types = Array.from(dataTransfer?.types ?? []);
        const rect = surfaceRef.current.getBoundingClientRect();
        let offsetSeconds = 0;
        if (rect && rect.width > 0) {
            const localX = clamp(event.clientX - rect.left, 0, timelineWidth);
            offsetSeconds = Math.min(localX / PIXELS_PER_SECOND, totalDuration);
        }
        const snapToStart = assets.length === 0;
        const effectiveOffset = snapToStart ? 0 : offsetSeconds;
        const droppedFiles = collectTimelineFiles(dataTransfer);
        const allFiles = Array.from(dataTransfer?.files ?? []);
        const filesToProcess =
            droppedFiles.length > 0
                ? droppedFiles
                : allFiles.filter((file, index, array) => {
                      const key = `${file?.name ?? 'file'}::${file?.size ?? 0}::${file?.lastModified ?? 0}`;
                      return array.findIndex(
                          (candidate) =>
                              `${candidate?.name ?? 'file'}::${candidate?.size ?? 0}::${candidate?.lastModified ?? 0}` === key,
                      ) === index;
                  });
        if (filesToProcess.length > 0 && typeof ingestTimelineFiles === 'function') {
            console.info('Timeline drop: ingesting files', filesToProcess.map((file) => file?.name ?? '(unnamed)'));
            ingestTimelineFiles({
                files: filesToProcess,
                frameId,
                offset: effectiveOffset,
            }).catch((error) => {
                console.error('Unable to ingest dropped files', error);
            });
            setTimelinePlayhead(frameId, effectiveOffset, { resetTick: true });
            return;
        }
        if (filesToProcess.length === 0 && types.some((type) => type.toLowerCase().includes('file'))) {
            console.info('Timeline drop: received file-like payload but no files were readable', types);
        }
        const payload = dataTransfer?.getData('application/x-dropple-asset');
        if (!payload) return;
        try {
            const data = JSON.parse(payload);
            if (!data?.assetId) return;
            placeAssetOnTimeline(data.assetId, frameId, { offset: effectiveOffset });
            setTimelinePlayhead(frameId, effectiveOffset, { resetTick: true });
        } catch (error) {
            console.error('Unable to drop asset on timeline', error);
        }
    };

    const handleAssetContextMenu = useCallback(
        (event, asset) => {
            event.preventDefault();
            event.stopPropagation();
            if (!asset || !setContextMenu) return;
            if (!timelineSelectedAssetIds.includes(asset.id)) {
                selectTimelineAssetInStore(asset.id, { mode: 'replace' });
            }
            setContextMenu({
                type: 'timeline-asset',
                timelineAssetId: asset.id,
                frameId,
                assetLabel: asset.label,
                position: { x: event.clientX, y: event.clientY },
            });
            setActiveAssetId(asset.id);
        },
        [frameId, setContextMenu, timelineSelectedAssetIds, selectTimelineAssetInStore],
    );

    const handleAssetClick = useCallback(
        (event, asset) => {
            event.preventDefault();
            event.stopPropagation();
            const isAdditive = event.shiftKey || event.metaKey || event.ctrlKey;
            selectTimelineAssetInStore(asset.id, { mode: isAdditive ? 'toggle' : 'replace' });
            setActiveAssetId(asset.id);
        },
        [selectTimelineAssetInStore],
    );

    useEffect(() => {
        if (timelineSelectedAssetIds.length === 0) return undefined;
        const handleKeyDown = (event) => {
            if (event.target instanceof HTMLElement) {
                const tagName = event.target.tagName;
                if (tagName === 'INPUT' || tagName === 'TEXTAREA' || event.target.isContentEditable) {
                    return;
                }
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                const selection = timelineSelectedAssetIds;
                removeTimelineAssets(selection, {
                    historyLabel: `Timeline: Remove ${selection.length} clip${selection.length > 1 ? 's' : ''}`,
                    source: 'timeline',
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [timelineSelectedAssetIds, removeTimelineAssets]);

    useEffect(() => {
        if (!timelineSelectedAssetIds.length) return undefined;
        const handleKeyDown = (event) => {
            if (event.target instanceof HTMLElement) {
                const tag = event.target.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) {
                    return;
                }
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                removeTimelineAssets(timelineSelectedAssetIds, {
                    historyLabel: `Timeline: Remove ${timelineSelectedAssetIds.length} clip${timelineSelectedAssetIds.length > 1 ? 's' : ''}`,
                    source: 'timeline',
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [timelineSelectedAssetIds, removeTimelineAssets]);

    useEffect(() => {
        if (!activeAssetId) return;
        const stillExists = assets.some((asset) => asset.id === activeAssetId);
        if (!stillExists) {
            setActiveAssetId(null);
        }
    }, [activeAssetId, assets]);

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

    const highlightLeft = highlightTick != null ? clamp(highlightTick, 0, totalDuration || 1) * PIXELS_PER_SECOND : null;
    const effectiveTracks = tracks.length > 0 ? tracks : [{ type: '__empty__', label: 'Clip', items: [], baseType: 'clip' }];
    return (
        <div className='mt-3 w-full select-none'>
            <div
                ref={wrapperRef}
                className={clsx(
                    'relative overflow-x-auto overflow-y-hidden rounded-2xl border border-[rgba(59,130,246,0.25)] bg-[rgba(8,15,35,0.88)] pb-4 pt-3 transition-shadow',
                    isDragOver ? 'border-[rgba(236,233,254,0.75)] shadow-[0_0_35px_rgba(139,92,246,0.35)]' : '',
                )}
            >
                <div className='grid grid-cols-[132px_1fr] gap-x-4 gap-y-4 px-4'>
                    {effectiveTracks.map((track, index) => (
                        <Fragment key={track.type}>
                            <div className='flex items-center pt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[rgba(191,219,254,0.75)]'>
                                {track.label}
                            </div>
                            <div
                                className={clsx(
                                    'relative flex min-h-[72px] items-center overflow-x-visible overflow-y-hidden rounded-xl border',
                                    track.items.length > 0
                                        ? 'border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.68)]'
                                        : 'border-dashed border-[rgba(148,163,184,0.28)] bg-[rgba(15,23,42,0.5)]',
                                )}
                                data-track-type={track.baseType ?? track.type}
                            >
                                <div
                                    className='relative min-h-[72px]'
                                    style={{ minWidth: `${timelineWidth}px`, width: `${timelineWidth}px` }}
                                    onPointerDown={handleSurfacePointerDown}
                                    onDragOver={handleTimelineDragOver}
                                    onDragLeave={handleTimelineDragLeave}
                                    onDrop={handleTimelineDrop}
                                    ref={index === 0 ? setSurfaceRef : undefined}
                                >
                                    {track.items.length === 0 ? (
                                        <div className='pointer-events-none absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                                            Drop assets here
                                        </div>
                                    ) : (
                                        <>
                                            <div className='pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[rgba(96,165,250,0.18)]' />
                                            {track.items.map((asset) => {
                                                const isSelected = timelineSelectedAssetIds.includes(asset.id);
                                                const waveformAvailable = Boolean(asset.waveformFillPath);
                                                return (
                                                    <div
                                                        key={asset.id}
                                                        data-asset-block='true'
                                                        className={clsx(
                                                            'absolute top-3 flex h-14 items-center overflow-hidden rounded-xl border px-4 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(8,15,35,0.45)] transition-[box-shadow,transform]',
                                                            isSelected
                                                                ? 'border-[rgba(236,233,254,0.9)] shadow-[0_0_22px_rgba(139,92,246,0.55)]'
                                                                : activeAssetId === asset.id
                                                                    ? 'border-[rgba(236,233,254,0.6)] shadow-[0_0_18px_rgba(139,92,246,0.35)]'
                                                                    : 'border-[rgba(148,163,184,0.28)]',
                                                        )}
                                                        style={{
                                                            left: `${asset.leftPx}px`,
                                                            width: `${asset.widthPx}px`,
                                                            ...(asset.preview?.style ?? {
                                                                backgroundImage:
                                                                    'linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(139,92,246,0.55) 100%)',
                                                            }),
                                                        }}
                                                        onClick={(event) => handleAssetClick(event, asset)}
                                                        onContextMenu={(event) => handleAssetContextMenu(event, asset)}
                                                >
                                                    {waveformAvailable ? (
                                                        <svg
                                                            className='pointer-events-none absolute inset-0 h-full w-full'
                                                            viewBox='0 0 100 100'
                                                            preserveAspectRatio='none'
                                                        >
                                                            <path
                                                                d={asset.waveformFillPath}
                                                                fill={asset.waveformColor ?? 'rgba(236,233,254,0.75)'}
                                                                fillOpacity={0.28}
                                                            />
                                                            {asset.waveformStrokePath ? (
                                                                <path
                                                                    d={asset.waveformStrokePath}
                                                                    fill='none'
                                                                    stroke={asset.waveformColor ?? '#e2e8f0'}
                                                                    strokeWidth={0.8}
                                                                    strokeLinejoin='round'
                                                                    strokeLinecap='round'
                                                                    opacity={0.85}
                                                                />
                                                            ) : null}
                                                        </svg>
                                                    ) : null}
                                                    <div className='relative z-10 flex w-full items-center justify-between gap-3'>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-lg leading-none'>{asset.preview?.icon ?? '•'}</span>
                                                            <span className='max-w-[180px] truncate text-sm font-semibold'>
                                                                {asset.label}
                                                            </span>
                                                        </div>
                                                        <span className='text-[10px] uppercase tracking-[0.25em] text-[rgba(226,232,240,0.75)]'>
                                                            {asset.duration.toFixed(1)}s
                                                        </span>
                                                    </div>
                                                    <div
                                                        data-asset-handle='true'
                                                        onPointerDown={(event) => handleDragStart(event, asset.id, 'offset')}
                                                        className='absolute inset-y-0 left-0 w-2 cursor-col-resize bg-[rgba(8,15,35,0.4)]'
                                                        style={{ zIndex: 20 }}
                                                    />
                                                    <div
                                                        data-asset-handle='true'
                                                        onPointerDown={(event) => handleDragStart(event, asset.id, 'end')}
                                                        className='absolute inset-y-0 right-0 w-2 cursor-col-resize bg-[rgba(8,15,35,0.4)]'
                                                        style={{ zIndex: 20 }}
                                                    />
                                                </div>
                                            );
                                        })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </Fragment>
                    ))}
                </div>
                {dropIndicatorX != null ? (
                    <div
                        className='pointer-events-none absolute top-3 bottom-3 w-[2px] rounded-full bg-[rgba(59,130,246,0.8)] shadow-[0_0_10px_rgba(59,130,246,0.45)]'
                        style={{ left: `${TIMELINE_LEFT_OFFSET + dropIndicatorX}px` }}
                    />
                ) : null}
                {marqueeBounds ? (
                    <div
                        className='pointer-events-none absolute rounded-lg border border-[rgba(236,233,254,0.6)] bg-[rgba(139,92,246,0.2)]'
                        style={{
                            left: `${TIMELINE_LEFT_OFFSET + marqueeBounds.left}px`,
                            width: `${marqueeBounds.width}px`,
                            top:
                                marqueeBounds.top != null
                                    ? `${marqueeBounds.top}px`
                                    : '12px',
                            height:
                                marqueeBounds.height != null
                                    ? `${Math.max(2, marqueeBounds.height)}px`
                                    : 'calc(100% - 24px)',
                        }}
                    />
                ) : null}
                {highlightLeft != null ? (
                    <div
                        className={clsx(
                            'pointer-events-none absolute top-3 bottom-3 w-[2px] rounded-full bg-[rgba(139,92,246,0.55)] shadow-[0_0_12px_rgba(139,92,246,0.45)] transition-opacity',
                            highlightFading ? 'opacity-0' : 'opacity-100',
                        )}
                        style={{ left: `${TIMELINE_LEFT_OFFSET + highlightLeft}px` }}
                    />
                ) : null}
                <div
                    className='pointer-events-none absolute top-3 bottom-3 w-[2px] rounded-full bg-[rgba(236,233,254,0.85)] shadow-[0_0_15px_rgba(139,92,246,0.55)]'
                    style={{ left: `${TIMELINE_LEFT_OFFSET + playheadLeft}px` }}
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
