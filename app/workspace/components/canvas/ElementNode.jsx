'use client';

import clsx from 'clsx';
import { useCanvasStore } from './context/CanvasStore';

const baseClass = 'absolute select-none';

export default function ElementNode({ element, frameId }) {
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const setSelectedElement = useCanvasStore((state) => state.setSelectedElement);

    if (!element) return null;
    const isSelected = selectedFrameId === frameId && selectedElementId === element.id;

    const handleSelect = (event) => {
        event.stopPropagation();
        if (frameId && element.id) {
            setSelectedElement(frameId, element.id);
        }
    };

    const props = element.props ?? {};
    const style = {
        left: props.x ?? 0,
        top: props.y ?? 0,
        width: props.width,
        height: props.height,
        transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
        opacity: props.opacity ?? 1,
        background: props.fill,
        borderRadius: props.cornerRadius,
        border: props.stroke ? `1px solid ${props.stroke}` : undefined,
        color: props.fill,
        fontSize: props.fontSize,
        fontWeight: props.fontStyle?.includes('bold') ? '600' : undefined,
        fontStyle: props.fontStyle?.includes('italic') ? 'italic' : undefined,
        lineHeight: props.lineHeight,
        letterSpacing: props.letterSpacing,
        textAlign: props.align,
    };

    switch (element.type) {
        case 'rect':
            return (
                <div
                    className={clsx(baseClass, 'rounded-2xl border border-transparent transition-shadow', {
                        'shadow-[0_0_0_2px_rgba(139,92,246,0.75)]': isSelected,
                    })}
                    style={style}
                    onMouseDown={handleSelect}
                />
            );
        case 'text':
            return (
                <div
                    className={clsx(baseClass, 'whitespace-pre-wrap font-sans text-[rgba(236,233,254,0.92)]', {
                        'shadow-[0_0_0_2px_rgba(139,92,246,0.6)]': isSelected,
                    })}
                    style={style}
                    onMouseDown={handleSelect}
                >
                    {props.text}
                </div>
            );
        default:
            return null;
    }
}
