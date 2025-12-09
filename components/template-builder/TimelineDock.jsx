'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Plus, ZoomIn, ZoomOut, Repeat, CirclePlus, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTemplateBuilderStore } from '@/store/useTemplateBuilderStore';
import { evaluateTrack } from '@/lib/motion/timelineEngine';

const ROW_HEIGHT = 40;
const BASE_PX_PER_MS = 0.25; // 4s timeline ~1000px
const LABEL_WIDTH = 220;
const PROPERTY_COLORS = {
    position: '#0ea5e9',
    scale: '#a855f7',
    rotation: '#f97316',
    opacity: '#22c55e',
    color: '#ef4444',
    filter: '#6366f1',
    clipPath: '#06b6d4',
    transform3d: '#c084fc',
};

const formatTimecode = (ms) => {
    const clamped = Math.max(0, Math.round(ms || 0));
    const totalSeconds = clamped / 1000;
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, '0');
    const millis = Math.floor(clamped % 1000)
        .toString()
        .padStart(3, '0');
    return `${minutes}:${seconds}.${millis}`;
};

const formatSeconds = (ms) => (Math.max(0, ms) / 1000).toFixed(3);

export default function TimelineDock() {
    const { pages, activePageId, selectedLayers, scrubberTime, setScrubberTime, setTimelineDuration, setTimelineZoom, timeline, playTimeline, pauseTimeline, ensureTimelineForSelection, addKeyframe, updateKeyframeTime, setTimelineSpeed, setTimelineLoop } = useTemplateBuilderStore(
        useShallow((state) => ({
            pages: state.pages,
            activePageId: state.activePageId,
            selectedLayers: state.selectedLayers,
            scrubberTime: state.scrubberTime,
            setScrubberTime: state.setScrubberTime,
            setTimelineDuration: state.setTimelineDuration,
            setTimelineZoom: state.setTimelineZoom,
            timeline: state.timeline,
            playTimeline: state.playTimeline,
            pauseTimeline: state.pauseTimeline,
            ensureTimelineForSelection: state.ensureTimelineForSelection,
            addKeyframe: state.addKeyframe,
            updateKeyframeTime: state.updateKeyframeTime,
            setTimelineSpeed: state.setTimelineSpeed,
            setTimelineLoop: state.setTimelineLoop,
        }))
    );

    const containerRef = useRef(null);
    const [collapsedTracks, setCollapsedTracks] = useState(() => new Set());
    const duration = timeline?.duration || 4000;
    const zoom = timeline?.zoom || 1;
    const totalWidth = Math.max(800, duration * BASE_PX_PER_MS * zoom);
    const speed = timeline?.speed || 1;
    const loop = Boolean(timeline?.loop);

    const activePage = pages.find((p) => p.id === activePageId) || pages[0] || { layers: [] };

    const timelineLayers = useMemo(() => (activePage.layers || []).filter((l) => selectedLayers.includes(l.id)), [activePage.layers, selectedLayers]);

    // Playback loop
    useEffect(() => {
        if (!timeline?.playing) return;
        let frame;
        let prev = performance.now();

        const tick = (now) => {
            const delta = now - prev;
            prev = now;
            const current = useTemplateBuilderStore.getState().scrubberTime || 0;
            const timelineSpeed = useTemplateBuilderStore.getState().timeline?.speed || 1;
            let next = current + delta * timelineSpeed;
            if (next >= duration) {
                if (timeline.loop) {
                    next = 0;
                } else {
                    pauseTimeline();
                    next = duration;
                }
            }
            setScrubberTime(next);
            if (useTemplateBuilderStore.getState().timeline.playing) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [timeline?.playing, timeline?.loop, duration, setScrubberTime, pauseTimeline]);

    const timeToPx = (timeMs) => (timeMs / duration) * totalWidth;
    const pxToTime = (px) => Math.max(0, (px / totalWidth) * duration);

    const handleScrub = (clientX) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const clamped = Math.min(Math.max(clientX - rect.left, 0), totalWidth);
        setScrubberTime(pxToTime(clamped));
    };

    const markers = useMemo(() => {
        const interval = duration <= 2000 ? 250 : 500;
        const count = Math.ceil(duration / interval) + 1;
        return Array.from({ length: count }, (_, i) => i * interval);
    }, [duration]);

    const togglePlayback = () => {
        if (timeline?.playing) pauseTimeline();
        else playTimeline();
    };

    const addKeyframeAtPlayhead = () => {
        const state = useTemplateBuilderStore.getState();
        if (!state.selectedLayers?.length) return;
        state.ensureTimelineForSelection();
        const active = state.pages.find((p) => p.id === state.activePageId) || state.pages[0];
        const layer = active?.layers?.find((l) => state.selectedLayers.includes(l.id)) || null;
        const animation = layer?.animations?.[0];
        const track = animation?.tracks?.[0];
        if (!layer || !animation || !track) return;
        const t = state.scrubberTime || 0;
        const value = evaluateTrack(track, t) ?? track.keyframes?.[track.keyframes.length - 1]?.value ?? track.keyframes?.[0]?.value ?? 0;
        state.addKeyframe(layer.id, animation.id, track.property, t, value);
    };

    const toggleTrackCollapsed = (id) => {
        setCollapsedTracks((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className='border-t bg-slate-50'>
            <div className='h-5 flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs'>
                <div className='flex items-center gap-2'>
                    <button onClick={togglePlayback} className='flex items-center gap-2 rounded bg-slate-900 px-2.5 py-0.5 text-white hover:bg-slate-800'>
                        {timeline?.playing ? <Pause size={14} /> : <Play size={14} />}
                        <span className='text-xs font-semibold'>{timeline?.playing ? 'Pause' : 'Play'}</span>
                    </button>
                    <button onClick={() => setTimelineLoop(!loop)} className={`flex items-center gap-2 rounded border px-2.5 py-0.5 text-xs font-medium ${loop ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600 hover:bg-white'}`}>
                        <Repeat size={14} />
                        Loop
                    </button>
                    <div className='flex items-center gap-2 rounded border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700'>
                        <span className='font-semibold'>Time</span>
                        <input type='number' className='w-20 rounded border border-slate-200 px-2 py-1 text-xs' value={Math.round(scrubberTime)} onChange={(e) => setScrubberTime(Number(e.target.value))} min={0} />
                        <span className='text-[11px] text-slate-500'>({formatTimecode(scrubberTime)})</span>
                    </div>
                    <div className='flex items-center gap-2 rounded border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700'>
                        <span className='font-semibold'>Duration</span>
                        <input type='number' className='w-20 rounded border border-slate-200 px-2 py-1 text-xs' value={duration} onChange={(e) => setTimelineDuration(Number(e.target.value))} min={200} />
                        <span className='text-[11px] text-slate-500'>({formatSeconds(duration)}s)</span>
                    </div>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                    <div className='flex items-center gap-1 text-slate-600'>
                        <button onClick={() => setTimelineZoom((zoom || 1) - 0.25)} className='rounded border border-slate-300 p-1 hover:bg-white'>
                            <ZoomOut size={14} />
                        </button>
                        <span className='text-xs w-12 text-center'>{zoom.toFixed(2)}x</span>
                        <button onClick={() => setTimelineZoom((zoom || 1) + 0.25)} className='rounded border border-slate-300 p-1 hover:bg-white'>
                            <ZoomIn size={14} />
                        </button>
                    </div>
                    <label className='flex items-center gap-2 text-xs text-slate-600'>
                        Speed
                        <input type='range' min='0.25' max='3' step='0.05' value={speed} onChange={(e) => setTimelineSpeed(Number(e.target.value))} />
                        <span className='w-10 text-right'>{speed.toFixed(2)}x</span>
                    </label>
                    <button onClick={addKeyframeAtPlayhead} className='flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100'>
                        <Plus size={14} />
                        Add Keyframe
                    </button>
                    <button onClick={() => ensureTimelineForSelection()} className='flex items-center gap-2 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'>
                        <CirclePlus size={14} />
                        Add Track
                    </button>
                </div>
            </div>

            <div className='h-24 overflow-x-auto border-t border-slate-200 bg-white'>
                {!timelineLayers.length ? (
                    <div className='flex h-full items-center justify-center text-sm text-slate-500'>Select a layer to view its timeline, then click “Tracks” to initialize motion.</div>
                ) : (
                    <div ref={containerRef} className='relative' style={{ minWidth: totalWidth + LABEL_WIDTH }} onMouseDown={(e) => handleScrub(e.clientX)}>
                        {/* Playhead */}
                        <div className='pointer-events-none absolute top-0 h-full w-0.5 bg-rose-500' style={{ left: timeToPx(scrubberTime) + LABEL_WIDTH }} />
                        <div className='pointer-events-none absolute top-0 -translate-x-1/2 rounded-b bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white shadow' style={{ left: timeToPx(scrubberTime) + LABEL_WIDTH }}>
                            {formatTimecode(scrubberTime)}
                        </div>

                        {/* Time ruler */}
                        <div className='sticky left-0 z-10 flex h-8 bg-slate-100 text-[11px] text-slate-600'>
                            <div className='border-r border-slate-200 px-3 py-2 font-semibold uppercase tracking-wide' style={{ width: LABEL_WIDTH }}>
                                Timeline ({formatTimecode(scrubberTime)})
                            </div>
                            <div className='relative flex-1'>
                                {markers.map((ms) => (
                                    <div key={ms} className='absolute top-0 h-8 border-r border-slate-200 px-1' style={{ left: timeToPx(ms) }}>
                                        <span className='absolute top-0 text-[10px] text-slate-500'>{ms}ms</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tracks */}
                        <div className='relative'>
                            {timelineLayers.map((layer) => {
                                const animation = layer.animations?.[0];
                                const tracks = animation?.tracks || [];
                                const layerLabel = layer.name || layer.type || layer.id || 'Layer';
                                return (
                                    <div key={layer.id} className='border-t border-slate-100'>
                                        <div className='flex items-center justify-between bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700'>
                                            <div className='flex items-center gap-3'>
                                                <span className='rounded bg-slate-900 px-2 py-1 text-[11px] font-mono text-white'>{layer.id.slice(0, 6)}</span>
                                                <span className='truncate'>{layerLabel}</span>
                                                <span className='text-xs text-slate-500'>
                                                    {animation?.name || 'Timeline'} ({tracks.length} tracks)
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2 text-xs text-slate-500'>
                                                <span className='rounded border border-slate-200 px-2 py-1'>Solo</span>
                                                <span className='rounded border border-slate-200 px-2 py-1'>Mute</span>
                                                <span className='rounded border border-slate-200 px-2 py-1'>Lock</span>
                                            </div>
                                        </div>
                                        {tracks.map((track) => {
                                            const trackId = `${layer.id}-${track.property}`;
                                            const collapsed = collapsedTracks.has(trackId);
                                            return (
                                                <TrackRow
                                                    key={track.property}
                                                    layerId={layer.id}
                                                    animationId={animation?.id}
                                                    track={track}
                                                    trackId={trackId}
                                                    totalWidth={totalWidth}
                                                    timeToPx={timeToPx}
                                                    pxToTime={pxToTime}
                                                    scrubberTime={scrubberTime}
                                                    onAddKeyframe={(time, value) => addKeyframe(layer.id, animation?.id, track.property, time, value)}
                                                    onUpdateKeyframe={(idx, time) => updateKeyframeTime(layer.id, animation?.id, track.property, idx, time)}
                                                    isCollapsed={collapsed}
                                                    onToggleCollapse={() => toggleTrackCollapsed(trackId)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TrackRow({ track, trackId, totalWidth, timeToPx, pxToTime, scrubberTime, onAddKeyframe, onUpdateKeyframe, isCollapsed, onToggleCollapse }) {
    const laneRef = useRef(null);
    const currentValue = evaluateTrack(track, scrubberTime);
    const trackColor = PROPERTY_COLORS[track.property] || '#cbd5e1';

    const handleAdd = (clientX) => {
        const rect = laneRef.current?.getBoundingClientRect();
        if (!rect) return;
        const px = Math.min(Math.max(clientX - rect.left, 0), totalWidth);
        const time = pxToTime(px);
        const value = evaluateTrack(track, time) ?? track.keyframes?.[0]?.value ?? (typeof currentValue === 'number' ? currentValue : null);
        onAddKeyframe(time, value);
    };

    return (
        <div className='grid border-t border-slate-100' style={{ gridTemplateColumns: `${LABEL_WIDTH}px 1fr`, minHeight: ROW_HEIGHT }}>
            <div className='flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-slate-700'>
                <button onClick={onToggleCollapse} className='flex items-center gap-2 text-left' title='Toggle track visibility'>
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    <span className='h-3 w-3 rounded-full border border-slate-200' style={{ background: trackColor }} />
                    <span className='capitalize'>{track.property}</span>
                </button>
                <div className='flex items-center gap-2 text-[10px] text-slate-500'>
                    <span>{typeof currentValue === 'number' ? currentValue.toFixed(1) : typeof currentValue === 'object' ? 'obj' : ''}</span>
                    <MoreHorizontal size={14} />
                </div>
            </div>
            {isCollapsed ? (
                <div className='border-l border-slate-100 bg-white' />
            ) : (
                <div
                    ref={laneRef}
                    className='relative bg-linear-to-r from-slate-50 via-white to-slate-50'
                    style={{ minWidth: totalWidth }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleAdd(e.clientX);
                    }}>
                    {/* Grid */}
                    <div className='absolute inset-0'>
                        {Array.from({ length: Math.ceil(totalWidth / 120) }, (_, i) => (
                            <div key={i} className='absolute top-0 h-full border-r border-slate-100' style={{ left: i * 120 }} />
                        ))}
                        <div className='absolute top-1/2 left-0 right-0 h-px bg-slate-200' />
                    </div>

                    {/* Keyframes */}
                    <div className='relative h-full'>
                        {(track.keyframes || []).map((kf, idx) => (
                            <KeyframeDot
                                key={`${trackId}-${kf.time}-${idx}`}
                                left={timeToPx(kf.time)}
                                color={trackColor}
                                easing={kf.easing}
                                onMove={(clientX) => {
                                    const rect = laneRef.current?.getBoundingClientRect();
                                    if (!rect) return;
                                    const px = Math.min(Math.max(clientX - rect.left, 0), totalWidth);
                                    onUpdateKeyframe(idx, pxToTime(px));
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function KeyframeDot({ left, easing, onMove, color }) {
    const handleDrag = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const move = (ev) => {
            ev.preventDefault();
            onMove(ev.clientX);
        };
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    return <div className='absolute top-1/2 z-10 h-3 w-3 -translate-y-1/2 rotate-45 cursor-ew-resize shadow ring-1 ring-slate-900/10 hover:scale-110' style={{ left, background: color || '#fbbf24', border: '1px solid #0f172a22' }} title={easing || 'linear'} onMouseDown={handleDrag} />;
}
