'use client';

import { useCallback, useMemo, useRef } from 'react';
import { buildElementTree } from './FrameNode';
import { useCanvasStore } from './context/CanvasStore';

function getElementStyles(element) {
    const props = element?.props ?? {};
    return {
        position: 'absolute',
        left: props.x ?? 0,
        top: props.y ?? 0,
        width: props.width,
        height: props.height,
        transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
        opacity: props.opacity ?? 1,
        borderRadius: props.cornerRadius,
        border:
            props.stroke && props.strokeWidth !== 0
                ? `${props.strokeWidth ?? 1}px solid ${props.stroke}`
                : undefined,
        backgroundColor: props.fill && !props.imageUrl ? props.fill : undefined,
        backgroundImage: props.imageUrl ? `url(${props.imageUrl})` : undefined,
        backgroundSize: props.backgroundFit ?? 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: props.imageUrl ? 'no-repeat' : undefined,
        color: props.fill,
        lineHeight: props.lineHeight,
        letterSpacing: props.letterSpacing,
        textAlign: props.align,
        fontSize: props.fontSize,
        fontWeight: props.fontWeight ?? (props.fontStyle?.includes('bold') ? '600' : undefined),
        fontStyle: props.fontStyle?.includes('italic') ? 'italic' : undefined,
    };
}

function PrototypeElement({ element, childrenNodes, onNavigate }) {
    const styles = useMemo(() => getElementStyles(element), [element]);
    const props = element?.props ?? {};
    const hasLink = Boolean(props.linkTarget);

    const handleClick = useCallback(
        (event) => {
            event.stopPropagation();
            if (hasLink) {
                onNavigate?.(props.linkTarget);
            }
        },
        [hasLink, onNavigate, props.linkTarget],
    );

    if (element.type === 'text') {
        return (
            <div
                className={`absolute whitespace-pre-wrap font-sans text-[rgba(236,233,254,0.9)] ${
                    hasLink ? 'cursor-pointer underline decoration-[rgba(139,92,246,0.6)]' : ''
                }`}
                style={{ ...styles, backgroundColor: 'transparent' }}
                onClick={handleClick}
            >
                {props.text}
            </div>
        );
    }

    if (element.type === 'group') {
        return (
            <div
                className={`absolute rounded-2xl border border-dashed border-[rgba(148,163,184,0.25)] ${
                    hasLink ? 'cursor-pointer' : ''
                }`}
                style={styles}
                onClick={handleClick}
            >
                {childrenNodes.map(({ element: child, children }) => (
                    <PrototypeElement key={child.id} element={child} childrenNodes={children} onNavigate={onNavigate} />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`absolute rounded-2xl border border-transparent ${
                hasLink ? 'cursor-pointer outline outline-1 outline-[rgba(139,92,246,0.5)]' : ''
            }`}
            style={styles}
            onClick={handleClick}
        >
            {childrenNodes.map(({ element: child, children }) => (
                <PrototypeElement key={child.id} element={child} childrenNodes={children} onNavigate={onNavigate} />
            ))}
        </div>
    );
}

function PrototypeFrame({ frame, onNavigate }) {
    const tree = useMemo(() => buildElementTree(frame.elements ?? []), [frame.elements]);
    const scale = frame.width > 1080 ? 1080 / frame.width : 1;
    const scaledWidth = frame.width * scale;

    return (
        <div
            id={`dropple-prototype-frame-${frame.id}`}
            className='relative mx-auto mb-16 flex max-w-[1080px] justify-center'
            style={{ width: scaledWidth }}
        >
            <div
                className='relative rounded-[28px] border border-[rgba(148,163,184,0.2)] shadow-[0_18px_50px_rgba(15,23,42,0.4)]'
                style={{
                    width: frame.width,
                    height: frame.height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundColor: frame.backgroundColor ?? '#0F172A',
                    backgroundImage: frame.backgroundImage ? `url(${frame.backgroundImage})` : undefined,
                    backgroundSize: frame.backgroundFit ?? 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: frame.backgroundImage ? 'no-repeat' : 'no-repeat',
                    overflow: 'hidden',
                }}
            >
                <div className='absolute left-6 top-4 text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(148,163,184,0.65)]'>
                    {frame.name}
                </div>
                <div className='relative h-full w-full pt-8'>
                    {tree.map(({ element, children }) => (
                        <PrototypeElement key={element.id} element={element} childrenNodes={children} onNavigate={onNavigate} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PrototypeOverlay() {
    const prototypeMode = useCanvasStore((state) => state.prototypeMode);
    const frames = useCanvasStore((state) => state.frames);
    const setPrototypeMode = useCanvasStore((state) => state.setPrototypeMode);

    const viewportRef = useRef(null);

    const handleNavigate = useCallback((frameId) => {
        if (!frameId) return;
        const target = document.getElementById(`dropple-prototype-frame-${frameId}`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    if (!prototypeMode) return null;

    return (
        <div className='fixed inset-0 z-50 flex flex-col bg-[rgba(8,11,19,0.85)] backdrop-blur'>
            <header className='flex items-center justify-between border-b border-[rgba(148,163,184,0.25)] px-6 py-4 text-sm text-[rgba(226,232,240,0.8)]'>
                <div>
                    <p className='text-lg font-semibold text-white'>Prototype Preview</p>
                    <p className='text-xs text-[rgba(148,163,184,0.75)]'>Scroll to explore frames • Click linked hotspots to navigate.</p>
                </div>
                <button
                    type='button'
                    onClick={() => setPrototypeMode(false)}
                    className='rounded-full border border-[rgba(239,68,68,0.45)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(254,226,226,0.9)] transition-colors hover:border-[rgba(254,226,226,0.85)] hover:text-white'
                >
                    Exit preview
                </button>
            </header>
            <div ref={viewportRef} className='flex-1 overflow-y-auto px-10 py-12'>
                {frames.length === 0 ? (
                    <div className='mx-auto max-w-lg rounded-2xl border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.6)] px-6 py-10 text-center text-sm text-[rgba(226,232,240,0.75)]'>
                        Add a frame to the workspace to preview it here.
                    </div>
                ) : (
                    frames.map((frame) => <PrototypeFrame key={frame.id} frame={frame} onNavigate={handleNavigate} />)
                )}
            </div>
        </div>
    );
}
