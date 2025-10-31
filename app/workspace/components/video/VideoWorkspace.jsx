'use client';

import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { useCanvasStore } from '../canvas/context/CanvasStore';
import TimelineBar from '../canvas/TimelineBar';
import { MODE_CANVAS_BEHAVIOR } from '../canvas/modeConfig';

const inspectorSections = [
    {
        id: 'compositing',
        title: 'Compositing',
        enabled: true,
        controls: [
            { type: 'select', label: 'Type', value: 'Normal' },
            { type: 'toggle', label: 'Auto Texture Surface', value: false },
            { type: 'slider', label: 'Left', value: '0 px' },
            { type: 'slider', label: 'Opacity', value: '100%' },
        ],
    },
    {
        id: 'transform',
        title: 'Transform',
        enabled: true,
        controls: [
            { type: 'vector', label: 'Position', value: 'X 500 px  |  Y 500 px' },
            { type: 'slider', label: 'Scale (All)', value: '100%' },
            { type: 'slider', label: 'Scale X', value: '100%' },
            { type: 'slider', label: 'Scale Y', value: '100%' },
            { type: 'angle', label: 'Rotation', value: '0º' },
        ],
    },
    {
        id: 'crop',
        title: 'Crop',
        enabled: true,
        controls: [
            { type: 'select', label: 'Type', value: 'Trim' },
            { type: 'slider', label: 'Left', value: '0 px' },
            { type: 'slider', label: 'Right', value: '0 px' },
            { type: 'slider', label: 'Top', value: '0 px' },
            { type: 'slider', label: 'Bottom', value: '0 px' },
        ],
    },
    {
        id: 'distort',
        title: 'Distort',
        enabled: false,
        controls: [{ type: 'toggle', label: 'Enable Bezier Handles', value: false }],
    },
];

const formatSecondsValue = (value) => {
    const seconds = Math.max(0, Number.isFinite(value) ? value : 0);
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds - minutes * 60;
        return `${minutes}:${remainder.toFixed(1).padStart(4, '0')}`;
    }
    return seconds.toFixed(2);
};

export default function VideoWorkspace() {
    const frames = useCanvasStore((state) => state.frames);
    const selectedFrameId =
        useCanvasStore((state) => state.selectedFrameId) ?? frames[0]?.id ?? null;
    const setSelectedFrame = useCanvasStore((state) => state.setSelectedFrame);
    const timelineAssets = useCanvasStore((state) => state.timelineAssets);
    const timelinePlayback = useCanvasStore((state) => state.timelinePlayback);
    const playTimeline = useCanvasStore((state) => state.playTimeline);
    const pauseTimeline = useCanvasStore((state) => state.pauseTimeline);
    const setTimelinePlayhead = useCanvasStore((state) => state.setTimelinePlayhead);
    const setTimelineLoop = useCanvasStore((state) => state.setTimelineLoop);
    const setTimelineSpeed = useCanvasStore((state) => state.setTimelineSpeed);
    const isSceneHydrating = useCanvasStore((state) => state.isSceneHydrating);
    const finishSceneHydration = useCanvasStore((state) => state.finishSceneHydration);

    const resolvedFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? frames[0] ?? null,
        [frames, selectedFrameId],
    );

    useEffect(() => {
        if (!isSceneHydrating || !resolvedFrame) return undefined;
        const timeoutId = window.setTimeout(() => {
            finishSceneHydration();
        }, 200);
        return () => window.clearTimeout(timeoutId);
    }, [isSceneHydrating, resolvedFrame, finishSceneHydration]);

    useEffect(() => {
        const preventExternalNavigation = (event) => {
            if (event.defaultPrevented) return;
            const types = Array.from(event.dataTransfer?.types ?? []);
            if (types.includes('Files')) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        window.addEventListener('dragover', preventExternalNavigation);
        window.addEventListener('drop', preventExternalNavigation);
        return () => {
            window.removeEventListener('dragover', preventExternalNavigation);
            window.removeEventListener('drop', preventExternalNavigation);
        };
    }, []);

    const frameAssets = useMemo(() => {
        if (!resolvedFrame) return [];
        return timelineAssets.filter((asset) => asset.frameId === resolvedFrame.id);
    }, [timelineAssets, resolvedFrame]);

    const totalDuration = useMemo(() => {
        if (!resolvedFrame) return 1;
        if (resolvedFrame.timelineDuration) return resolvedFrame.timelineDuration;
        return frameAssets.reduce(
            (acc, asset) => Math.max(acc, (asset.offset ?? 0) + (asset.duration ?? 0)),
            1,
        );
    }, [frameAssets, resolvedFrame]);

    const playbackLabel = `${formatSecondsValue(timelinePlayback.playhead ?? 0)} / ${formatSecondsValue(totalDuration)}`;

    const timelineBehavior = MODE_CANVAS_BEHAVIOR.video;

    return (
        <div
            className='flex flex-1 flex-col overflow-hidden'
            style={{ background: 'var(--mode-panel-bg)' }}
        >
            <div className='flex flex-1 overflow-hidden px-6 py-5'>
                <div className='flex w-80 shrink-0 flex-col pr-5'>
                    <VideoInspectorPanel sections={inspectorSections} accent='var(--mode-accent)' />
                </div>
                <div className='flex min-w-0 flex-1 flex-col gap-6 overflow-hidden'>
                    <VideoPreview
                        frame={resolvedFrame}
                        assets={frameAssets}
                        playbackLabel={playbackLabel}
                    />
                    <div className='flex min-h-0 flex-1 flex-col gap-6 overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+12px)]'>
                        <div className='flex-1 min-h-0 overflow-auto pr-1'>
                            <VideoTimeline
                                frames={frames}
                                frame={resolvedFrame}
                                frameAssets={frameAssets}
                                totalDuration={totalDuration}
                                timelineBehavior={timelineBehavior}
                                timelinePlayback={timelinePlayback}
                                playTimeline={playTimeline}
                                pauseTimeline={pauseTimeline}
                                setTimelinePlayhead={setTimelinePlayhead}
                                setTimelineLoop={setTimelineLoop}
                                setTimelineSpeed={setTimelineSpeed}
                                onSelectFrame={setSelectedFrame}
                            />
                        </div>
                        <VideoTransportBar
                            isPlaying={timelinePlayback.isPlaying}
                            onPlayPause={() => {
                                if (resolvedFrame) {
                                    if (timelinePlayback.frameId === resolvedFrame.id && timelinePlayback.isPlaying) {
                                        pauseTimeline();
                                    } else {
                                        playTimeline(resolvedFrame.id);
                                    }
                                }
                            }}
                            onRenderPreview={() => console.info('Render preview…')}
                        />
                    </div>
                </div>
                <div className='ml-6 w-60 shrink-0'>
                    <VideoMediaBin
                        assets={frameAssets}
                        accent='var(--mode-accent)'
                        frames={frames}
                        activeFrameId={resolvedFrame?.id ?? null}
                        onSelectFrame={setSelectedFrame}
                    />
                </div>
            </div>
        </div>
    );
}

function VideoPreview({ frame, assets, playbackLabel }) {
    const clipAsset = useMemo(
        () =>
            assets.find(
                (asset) =>
                    asset.timelineType === 'clip' ||
                    asset.type === 'clip' ||
                    asset.type === 'timeline-clip',
            ) ?? null,
        [assets],
    );

    const poster =
        clipAsset?.thumbnailUrl ??
        (clipAsset?.preview?.kind === 'image' ? clipAsset.preview.value : null) ??
        clipAsset?.metadata?.posterUrl ??
        clipAsset?.metadata?.thumbnail ??
        null;

    const playbackSource =
        clipAsset?.metadata?.videoUrl ??
        clipAsset?.metadata?.sourceUrl ??
        clipAsset?.metadata?.mediaUrl ??
        clipAsset?.props?.videoUrl ??
        clipAsset?.props?.sourceUrl ??
        null;

    const backgroundImage = poster ?? null;

    return (
        <div
            className='rounded-2xl border px-5 py-4 shadow-[0_24px_60px_rgba(5,8,18,0.25)]'
            style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-canvas-bg)' }}
        >
            {playbackSource ? (
                <video
                    className='mx-auto aspect-video w-full overflow-hidden rounded-xl border'
                    style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-canvas-bg)' }}
                    src={playbackSource}
                    poster={poster ?? undefined}
                    controls
                />
            ) : (
                <div
                    className='relative mx-auto aspect-video w-full overflow-hidden rounded-xl border'
                    style={{
                        borderColor: 'var(--mode-border)',
                        background: backgroundImage
                            ? `url(${backgroundImage}) center/cover`
                            : 'linear-gradient(135deg, rgba(180,192,255,0.08), rgba(43,56,89,0.18))',
                    }}
                >
                    {!backgroundImage ? (
                        <div className='absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.3em] text-[color:var(--mode-text-muted)]'>
                            {frame?.name ?? 'No Preview'}
                        </div>
                    ) : null}
                </div>
            )}
            <VideoPlaybackHUD title={frame?.name ?? 'Video Preview'} label={playbackLabel} />
        </div>
    );
}

function VideoPlaybackHUD({ title, label }) {
    return (
        <div
            className='mt-3 rounded-xl border px-4 py-2 text-[11px] shadow-[0_8px_20px_rgba(8,11,20,0.25)]'
            style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
        >
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[color:var(--mode-text-muted)]'>
                    <span
                        className='rounded-full border px-3 py-1 text-[color:var(--mode-text)]'
                        style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-sidebar-bg)' }}
                    >
                        {title}
                    </span>
                    <div className='flex items-center gap-3'>
                        {['Start 1', 'End 250', 'Range 0 - 250'].map((chip) => (
                            <span
                                key={chip}
                                className='rounded-md border px-2 py-1'
                                style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text-muted)' }}
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>
                <span className='font-semibold tracking-[0.28em] text-[color:var(--mode-text-muted)]'>{label}</span>
            </div>
        </div>
    );
}

function VideoInspectorPanel({ sections, accent }) {
    return (
        <div
            className='flex h-full flex-col rounded-3xl border p-4 shadow-[0_24px_50px_rgba(3,5,12,0.25)]'
            style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-sidebar-bg)', color: 'var(--mode-text)' }}
        >
            <header className='flex flex-col gap-1 border-b pb-4' style={{ borderColor: 'var(--mode-border)' }}>
                <span className='text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--mode-text-muted)]'>Inspector</span>
                <span className='text-xs text-[color:var(--mode-text-muted)]'>Fine-tune clip adjustments and compositing settings.</span>
            </header>
            <div className='mt-4 flex-1 space-y-4 overflow-y-auto pr-2'>
                {sections.map((section) => (
                    <section
                        key={section.id}
                        className='rounded-2xl border p-3 shadow-[0_12px_24px_rgba(5,8,18,0.2)]'
                        style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)' }}
                    >
                        <div className='flex items-center justify-between gap-2'>
                            <label className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--mode-text)]'>
                                <input
                                    type='checkbox'
                                    defaultChecked={section.enabled}
                                    className='h-4 w-4 rounded border border-[color:var(--mode-border)] bg-[color:var(--mode-canvas-bg)] text-[var(--mode-accent)] focus:ring-[var(--mode-accent)]'
                                />
                                {section.title}
                            </label>
                            <button
                                type='button'
                                className='rounded-full border px-2 py-[2px] text-[10px] uppercase tracking-[0.3em] transition-colors'
                                style={{ borderColor: 'var(--mode-border)', color: 'var(--mode-text-muted)' }}
                            >
                                Reset
                            </button>
                        </div>
                        <div className='mt-3 space-y-3 text-[11px] text-[color:var(--mode-text-muted)]'>
                            {section.controls.map((control, index) => (
                                <VideoInspectorControl key={`${section.id}-${index}`} control={control} accent={accent} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

function VideoInspectorControl({ control, accent }) {
    if (control.type === 'select') {
        return (
            <div className='flex items-center justify-between gap-3'>
                <span className='text-[10px] uppercase tracking-[0.25em]'>{control.label}</span>
                <span
                    className='rounded-lg border px-2 py-1 text-[11px] font-medium'
                    style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
                >
                    {control.value}
                </span>
            </div>
        );
    }
    if (control.type === 'toggle') {
        return (
            <button
                type='button'
                className='flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[11px] font-medium tracking-[0.15em] transition-colors'
                style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
            >
                {control.label}
                <span
                    className='rounded-full border px-2 py-[2px] text-[10px] uppercase tracking-[0.3em]'
                    style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-canvas-bg)', color: 'var(--mode-text-muted)' }}
                >
                    {control.value ? 'On' : 'Off'}
                </span>
            </button>
        );
    }
    if (control.type === 'slider') {
        const percentMatch = typeof control.value === 'string' && control.value.includes('%')
            ? Number.parseFloat(control.value) || 0
            : 80;
        const sliderPercent = Math.max(0, Math.min(100, percentMatch));
        return (
            <div className='space-y-2'>
                <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.25em]'>
                    <span>{control.label}</span>
                    <span>{control.value}</span>
                </div>
                <div
                    className='h-1.5 w-full overflow-hidden rounded-full'
                    style={{ background: 'var(--mode-canvas-overlay)' }}
                >
                    <div
                        className='h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.25)]'
                        style={{ width: `${sliderPercent}%`, background: accent }}
                    />
                </div>
            </div>
        );
    }
    if (control.type === 'vector') {
        return (
            <div
                className='rounded-lg border px-3 py-2 text-[10px] uppercase tracking-[0.3em]'
                style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text-muted)' }}
            >
                {control.label}&nbsp;<span className='text-[color:var(--mode-text)]'>{control.value}</span>
            </div>
        );
    }
    if (control.type === 'angle') {
        return (
            <div className='flex items-center justify-between gap-3'>
                <span className='text-[10px] uppercase tracking-[0.25em]'>{control.label}</span>
                <span
                    className='rounded-lg border px-2 py-1 text-[11px]'
                    style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
                >
                    {control.value}
                </span>
            </div>
        );
    }
    return null;
}

function VideoMediaBin({ assets, accent, frames, activeFrameId, onSelectFrame }) {
    const items = assets.length
        ? assets
        : frames.map((frame, index) => ({
              id: frame.id,
              label: frame.name ?? `Shot ${index + 1}`,
              duration: frame.timelineDuration ?? 30,
              fallback: true,
          }));

    return (
        <div
            className='flex h-full flex-col rounded-3xl border p-4 shadow-[0_24px_50px_rgba(3,5,12,0.25)]'
            style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-sidebar-bg)', color: 'var(--mode-text)' }}
        >
            <header className='flex items-start justify-between gap-2 border-b pb-4' style={{ borderColor: 'var(--mode-border)' }}>
                <div>
                    <p className='text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--mode-text-muted)]'>Media Browser</p>
                    <p className='text-xs text-[color:var(--mode-text-muted)]'>Drop footage or choose a shot to focus.</p>
                </div>
                <button
                    type='button'
                    className='rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors'
                    style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
                >
                    Import
                </button>
            </header>
            <div className='mt-4 flex-1 space-y-3 overflow-y-auto pr-1'>
                {items.map((item, index) => {
                    const durationLabel = formatSecondsValue(item.duration ?? 0);
                    const isActive = item.frameId ? item.frameId === activeFrameId : item.id === activeFrameId;
                    return (
                        <button
                            key={item.id ?? index}
                            type='button'
                            onClick={() => {
                                if (item.frameId) onSelectFrame?.(item.frameId);
                                else if (item.id) onSelectFrame?.(item.id);
                            }}
                            className={clsx(
                                'flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-colors',
                                isActive
                                    ? 'border-[var(--mode-accent)] bg-[var(--mode-accent-soft)]/60 text-[color:var(--mode-text)]'
                                    : 'hover:border-[var(--mode-accent)] hover:text-[color:var(--mode-text)]',
                            )}
                            style={{
                                borderColor: isActive ? 'var(--mode-accent)' : 'var(--mode-border)',
                                background: isActive ? 'var(--mode-accent-soft)' : 'var(--mode-panel-bg)',
                                color: 'var(--mode-text)',
                            }}
                        >
                            <div
                                className='relative h-16 w-24 overflow-hidden rounded-xl border'
                                style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-canvas-bg)' }}
                            >
                                <div
                                    className='absolute inset-0'
                                    style={{ background: `linear-gradient(135deg, ${accent}33, rgba(255,255,255,0.06))` }}
                                />
                                <span className='absolute bottom-1 right-1 rounded-full bg-black/50 px-2 py-[2px] text-[10px] font-medium text-white/80'>
                                    {durationLabel}
                                </span>
                            </div>
                            <div className='flex-1'>
                                <p className='text-sm font-semibold tracking-wide'>{item.label ?? `Clip ${index + 1}`}</p>
                                <p className='text-[11px] uppercase tracking-[0.2em] text-[color:var(--mode-text-muted)]'>
                                    {item.timelineType ? item.timelineType : item.fallback ? 'Frame Placeholder' : 'Clip'}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function VideoTimeline({
    frames,
    frame,
    frameAssets,
    totalDuration,
    timelineBehavior,
    timelinePlayback,
    playTimeline,
    pauseTimeline,
    setTimelinePlayhead,
    setTimelineLoop,
    setTimelineSpeed,
    onSelectFrame,
}) {
    const isActive = timelinePlayback.frameId === frame?.id;
    const isPlaying = isActive && timelinePlayback.isPlaying;

    const trackConfig = {
        order: timelineBehavior?.tracks,
        labels: timelineBehavior?.labels,
    };

    return (
        <div
            className='rounded-2xl border p-4 shadow-[0_18px_36px_rgba(5,8,18,0.25)]'
            style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-sidebar-bg)' }}
        >
            <div className='flex flex-wrap items-center justify-between gap-3 text-[color:var(--mode-text)]'>
                <div className='flex items-center gap-3'>
                    <button
                        type='button'
                        onClick={() => {
                            if (!frame) return;
                            const currentIndex = frames.findIndex((item) => item.id === frame.id);
                            if (currentIndex > 0) {
                                onSelectFrame(frames[currentIndex - 1].id);
                            }
                        }}
                        className='rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.25em] transition-colors'
                        style={{ borderColor: 'var(--mode-border)' }}
                    >
                        Prev
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            if (!frame) return;
                            const currentIndex = frames.findIndex((item) => item.id === frame.id);
                            if (currentIndex < frames.length - 1) {
                                onSelectFrame(frames[currentIndex + 1].id);
                            }
                        }}
                        className='rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.25em] transition-colors'
                        style={{ borderColor: 'var(--mode-border)' }}
                    >
                        Next
                    </button>
                    <span
                        className='rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]'
                        style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
                    >
                        {frame?.name ?? 'Frame'}
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    <span>{formatSecondsValue(timelinePlayback.playhead ?? 0)}</span>
                    <span>/</span>
                    <span>{formatSecondsValue(totalDuration)}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() => {
                            if (!frame) return;
                            if (isPlaying) {
                                pauseTimeline();
                            } else {
                                playTimeline(frame.id);
                            }
                        }}
                        className='rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors'
                        style={{
                            borderColor: 'var(--mode-accent)',
                            background: 'var(--mode-accent-soft)',
                            color: 'var(--mode-text)',
                        }}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            if (!frame) return;
                            setTimelinePlayhead(frame.id, 0, { resetTick: true });
                            pauseTimeline();
                        }}
                        className='rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors'
                        style={{ borderColor: 'var(--mode-border)', color: 'var(--mode-text)' }}
                    >
                        Stop
                    </button>
                    <button
                        type='button'
                        onClick={() => setTimelineLoop(!timelinePlayback.loop)}
                        className='rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition-colors'
                        style={{
                            borderColor: 'var(--mode-border)',
                            background: timelinePlayback.loop ? 'var(--mode-accent-soft)' : 'transparent',
                            color: 'var(--mode-text)',
                        }}
                    >
                        Loop {timelinePlayback.loop ? 'On' : 'Off'}
                    </button>
                    <select
                        value={timelinePlayback.speed ?? 1}
                        onChange={(event) => setTimelineSpeed(Number(event.target.value) || 1)}
                        className='rounded-md border px-2 py-1 text-[10px] focus:outline-none'
                        style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)', color: 'var(--mode-text)' }}
                    >
                        {[0.5, 1, 1.5, 2].map((speed) => (
                            <option key={speed} value={speed}>
                                {speed.toFixed(1)}×
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='mt-4 rounded-xl border' style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-panel-bg)' }}>
                <TimelineBar
                    frameId={frame?.id ?? ''}
                    assets={frameAssets}
                    totalDuration={totalDuration}
                    getTimelineStyles={(asset) => ({
                        background:
                            asset.type === 'audio'
                                ? 'linear-gradient(90deg, rgba(99,102,241,0.35), rgba(59,130,246,0.35))'
                                : 'linear-gradient(90deg, rgba(244,114,182,0.35), rgba(96,165,250,0.35))',
                        borderColor: 'var(--mode-border)',
                        waveformColor: 'var(--mode-text)',
                    })}
                    trackConfig={trackConfig}
                />
            </div>
        </div>
    );
}

function VideoTransportBar({ isPlaying, onPlayPause, onRenderPreview }) {
    const actions = [
        { id: 'tracks', label: 'Timeline Tracks' },
        { id: 'keyframes', label: 'Keyframes' },
        { id: 'play', label: isPlaying ? 'Pause' : 'Play / Pause', onClick: onPlayPause },
        { id: 'render', label: 'Render Preview', onClick: onRenderPreview },
    ];

    return (
        <div
            className='mt-4 flex items-center justify-between rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em]'
            style={{ borderColor: 'var(--mode-border)', background: 'var(--mode-sidebar-bg)', color: 'var(--mode-text)' }}
        >
            <div className='flex items-center gap-3'>
                {actions.map((action) => (
                    <button
                        key={action.id}
                        type='button'
                        onClick={action.onClick}
                        className='rounded-full border px-3 py-1 transition-colors'
                        style={{
                            borderColor: 'var(--mode-border)',
                            background: action.id === 'play' ? 'var(--mode-accent-soft)' : 'transparent',
                            color: action.id === 'play' ? 'var(--mode-text)' : 'var(--mode-text-muted)',
                        }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
            <div className='flex items-center gap-3 text-[color:var(--mode-text-muted)]'>
                <span>Zoom 100%</span>
                <span>Pan 0 × 0</span>
            </div>
        </div>
    );
}
