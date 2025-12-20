'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Plus, ZoomIn, ZoomOut, Repeat, CirclePlus, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTemplateBuilderStore } from '@/store/useTemplateBuilderStore';
import { evaluateTrack } from '@/lib/motion/timelineEngine';

const ROW_HEIGHT = 40;
const BASE_PX_PER_MS = 0.25;
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

const formatTimecode = (ms = 0) => {
    const clamped = Math.max(0, Math.round(ms));
    const totalSeconds = clamped / 1000;
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    const millis = String(clamped % 1000).padStart(3, '0');
    return `${minutes}:${seconds}.${millis}`;
};

const formatSeconds = (ms = 0) => (Math.max(0, ms) / 1000).toFixed(3);

export default function TimelineDock() {
    const { pages, activePageId, selectedLayers, scrubberTime, setScrubberTime, setTimelineDuration, setTimelineZoom, timeline, playTimeline, pauseTimeline, ensureTimelineForSelection, addKeyframe, updateKeyframeTime, setTimelineSpeed, setTimelineLoop } = useTemplateBuilderStore(
        useShallow((s) => ({
            pages: s.pages || [],
            activePageId: s.activePageId,
            selectedLayers: s.selectedLayers || [],
            scrubberTime: s.scrubberTime ?? 0,
            setScrubberTime: s.setScrubberTime,
            setTimelineDuration: s.setTimelineDuration,
            setTimelineZoom: s.setTimelineZoom,
            timeline: s.timeline,
            playTimeline: s.playTimeline,
            pauseTimeline: s.pauseTimeline,
            ensureTimelineForSelection: s.ensureTimelineForSelection,
            addKeyframe: s.addKeyframe,
            updateKeyframeTime: s.updateKeyframeTime,
            setTimelineSpeed: s.setTimelineSpeed,
            setTimelineLoop: s.setTimelineLoop,
        }))
    );

    const containerRef = useRef(null);
    const [collapsedTracks, setCollapsedTracks] = useState(() => new Set());

    const safeDuration = Number.isFinite(timeline?.duration) ? timeline.duration : 4000;
    const safeZoom = Number.isFinite(timeline?.zoom) ? timeline.zoom : 1;
    const safeSpeed = Number.isFinite(timeline?.speed) ? timeline.speed : 1;
    const safeScrubberTime = Number.isFinite(scrubberTime) ? scrubberTime : 0;

    const totalWidth = Math.max(800, safeDuration * BASE_PX_PER_MS * safeZoom);
    const loop = Boolean(timeline?.loop);

    const activePage = pages.find((p) => p.id === activePageId) || pages[0] || { layers: [] };

    const timelineLayers = useMemo(() => {
        const layers = activePage.layers || [];
        const selected = Array.isArray(selectedLayers) ? selectedLayers : [];
        return layers.filter((l) => selected.includes(l.id));
    }, [activePage.layers, selectedLayers]);

    /* ---------------- PLAYBACK LOOP ---------------- */

    useEffect(() => {
        if (!timeline?.playing) return;

        const getState = useTemplateBuilderStore.getState;
        let raf;
        let prev = performance.now();

        const tick = (now) => {
            const delta = now - prev;
            prev = now;

            const { scrubberTime, timeline } = getState();
            const speed = Number.isFinite(timeline?.speed) ? timeline.speed : 1;

            let next = (scrubberTime ?? 0) + delta * speed;

            if (next >= safeDuration) {
                if (timeline?.loop) next = 0;
                else {
                    pauseTimeline();
                    next = safeDuration;
                }
            }

            setScrubberTime(next);

            if (getState().timeline?.playing) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [timeline?.playing, timeline?.loop, safeDuration, pauseTimeline, setScrubberTime]);

    const timeToPx = (ms) => (ms / safeDuration) * totalWidth;
    const pxToTime = (px) => Math.max(0, (px / totalWidth) * safeDuration);

    const markers = useMemo(() => {
        const interval = safeDuration <= 2000 ? 250 : 500;
        const count = Math.ceil(safeDuration / interval) + 1;
        return Array.from({ length: count }, (_, i) => i * interval);
    }, [safeDuration]);

    const togglePlayback = () => {
        timeline?.playing ? pauseTimeline() : playTimeline();
    };

    const toggleTrackCollapsed = (id) => {
        setCollapsedTracks((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    /* ---------------- RENDER ---------------- */

    return (
        <div className='border-t bg-slate-50'>
            {/* CONTROLS */}
            <div className='flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs'>
                <div className='flex items-center gap-2'>
                    <button onClick={togglePlayback} className='flex items-center gap-2 rounded bg-slate-900 px-2.5 py-0.5 text-white'>
                        {timeline?.playing ? <Pause size={14} /> : <Play size={14} />}
                        {timeline?.playing ? 'Pause' : 'Play'}
                    </button>

                    <button onClick={() => setTimelineLoop(!loop)} className='flex items-center gap-2 rounded border px-2.5 py-0.5'>
                        <Repeat size={14} /> Loop
                    </button>

                    <input
                        type='number'
                        value={Math.round(safeScrubberTime)}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setScrubberTime(Number.isFinite(v) ? v : 0);
                        }}
                        min={0}
                        className='w-24 rounded border px-2 py-1'
                    />

                    <input
                        type='number'
                        value={safeDuration}
                        min={200}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setTimelineDuration(Number.isFinite(v) && v >= 200 ? v : 200);
                        }}
                        className='w-24 rounded border px-2 py-1'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <button onClick={() => setTimelineZoom(safeZoom - 0.25)}>
                        <ZoomOut size={14} />
                    </button>
                    <span>{safeZoom.toFixed(2)}x</span>
                    <button onClick={() => setTimelineZoom(safeZoom + 0.25)}>
                        <ZoomIn size={14} />
                    </button>

                    <input
                        type='range'
                        min='0.25'
                        max='3'
                        step='0.05'
                        value={safeSpeed}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setTimelineSpeed(Number.isFinite(v) ? v : 1);
                        }}
                    />

                    <button onClick={ensureTimelineForSelection}>
                        <CirclePlus size={14} /> Add Track
                    </button>
                </div>
            </div>

            {/* TRACKS */}
            <div className='overflow-x-auto border-t bg-white'>
                {!timelineLayers.length ? (
                    <div className='flex h-24 items-center justify-center text-sm text-slate-500'>Select a layer to view its timeline</div>
                ) : (
                    <div ref={containerRef} style={{ minWidth: totalWidth + LABEL_WIDTH }}>
                        {timelineLayers.map((layer) => {
                            const animation = layer.animations?.[0];
                            const tracks = animation?.tracks || [];

                            return (
                                <div key={layer.id}>
                                    {tracks.map((track) => {
                                        const id = `${layer.id}-${track.property}`;
                                        return (
                                            <TrackRow
                                                key={id}
                                                track={track}
                                                trackId={id}
                                                totalWidth={totalWidth}
                                                timeToPx={timeToPx}
                                                pxToTime={pxToTime}
                                                scrubberTime={safeScrubberTime}
                                                isCollapsed={collapsedTracks.has(id)}
                                                onToggleCollapse={() => toggleTrackCollapsed(id)}
                                                onAddKeyframe={(t, v) => addKeyframe(layer.id, animation.id, track.property, t, v)}
                                                onUpdateKeyframe={(i, t) => updateKeyframeTime(layer.id, animation.id, track.property, i, t)}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------------- TRACK ROW ---------------- */

function TrackRow({ track, trackId, totalWidth, timeToPx, pxToTime, scrubberTime, onAddKeyframe, onUpdateKeyframe, isCollapsed, onToggleCollapse }) {
    const laneRef = useRef(null);
    const currentValue = evaluateTrack(track, scrubberTime);
    const color = PROPERTY_COLORS[track.property] || '#94a3b8';

    return (
        <div className='grid border-t' style={{ gridTemplateColumns: `${LABEL_WIDTH}px 1fr` }}>
            <div className='flex items-center gap-2 px-3 py-2 text-xs'>
                <button onClick={onToggleCollapse}>{isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}</button>
                <span className='capitalize'>{track.property}</span>
            </div>

            {!isCollapsed && (
                <div ref={laneRef} className='relative' style={{ minWidth: totalWidth }}>
                    {(track.keyframes || []).map((kf, idx) => (
                        <KeyframeDot
                            key={`${trackId}-${idx}`}
                            left={timeToPx(kf.time)}
                            color={color}
                            onMove={(x) => {
                                const rect = laneRef.current?.getBoundingClientRect();
                                if (!rect) return;
                                onUpdateKeyframe(idx, pxToTime(x - rect.left));
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---------------- KEYFRAME DOT ---------------- */

function KeyframeDot({ left, color, onMove }) {
    const handleDrag = (e) => {
        e.preventDefault();
        const move = (ev) => onMove(ev.clientX);
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    return <div onMouseDown={handleDrag} className='absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 cursor-ew-resize' style={{ left, background: color }} />;
}
