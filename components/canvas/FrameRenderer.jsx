'use client';

import { resolveValue } from '@/lib/tokens/resolveValue';
import { usePageStore } from '@/zustand/pageStore';
import { useSelectionStore } from '@/zustand/selectionStore';
import { usePrototypeStore } from '@/zustand/prototypeStore';

/* --------------------------------------------------
 * FRAME RENDERER
 * -------------------------------------------------- */
export default function FrameRenderer({ node, style, children, onPointerDown }) {
    const workspaceMode = usePageStore((s) => s.workspaceMode);
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const triggerInteractions = usePrototypeStore((s) => s.triggerInteractions);

    const isSelected = selectedIds.includes(node.id);
    const backgroundStyle = resolveFrameBackground(node, workspaceMode);

    return (
        <div
            data-node-id={node.id}
            style={{
                ...style,
                position: 'absolute',
            }}
            onMouseDown={(e) => {
                onPointerDown?.(e, node.id);
                triggerInteractions(node.id, 'onClick');
            }}>
            {/* ---------------- BACKGROUND LAYER ---------------- */}
            <div
                className='absolute inset-0 pointer-events-none'
                style={{
                    ...backgroundStyle,
                    borderRadius: node.borderRadius || 0,
                    borderStyle: 'solid',
                    borderWidth: node.strokeWidth ?? 1,
                    borderColor: resolveValue(node.stroke) || '#cbd5e1',
                }}
            />

            {/* ---------------- CONTENT LAYER ---------------- */}
            <div
                className='absolute inset-0'
                style={{
                    position: 'relative',
                    overflowX: node.scroll?.overflowX || 'visible',
                    overflowY: node.scroll?.overflowY || 'visible',
                    borderRadius: node.borderRadius || 0,
                }}>
                {children}
            </div>

            {/* ---------------- SELECTION OVERLAY ---------------- */}
            {isSelected && (
                <div
                    className='absolute inset-0 pointer-events-none'
                    style={{
                        border: '2px solid #6366f1',
                        borderRadius: node.borderRadius || 0,
                        boxShadow: '0 0 0 4px rgba(99,102,241,0.25)',
                    }}
                />
            )}
        </div>
    );
}

/* --------------------------------------------------
 * FRAME BACKGROUND RESOLVER (PURE + FUTURE-PROOF)
 * -------------------------------------------------- */
function resolveFrameBackground(node, workspaceMode) {
    const bg = node.background || {};
    const fallback = '#f3f4f6';

    if (bg.type === 'image' && bg.value) {
        return {
            backgroundImage: `url(${bg.value})`,
            backgroundSize: bg.size || 'cover',
            backgroundPosition: bg.position || 'center',
            backgroundRepeat: 'no-repeat',
        };
    }

    if (bg.type === 'gradient' && bg.value) {
        const resolved = resolveValue(bg.value) || bg.value;
        return {
            backgroundImage: resolved,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }

    if (bg.type === 'color' && bg.value) {
        return {
            backgroundColor: resolveValue(bg.value),
        };
    }

    if (bg.type === 'none') {
        return {
            backgroundColor: workspaceMode === 'layout' ? 'transparent' : fallback,
        };
    }

    return {
        backgroundColor: fallback,
    };
}
