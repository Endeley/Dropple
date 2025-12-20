'use client';

import FrameRenderer from './FrameRenderer';
import { resolveAsset } from '@/lib/assets/resolveAsset';
import { resolveValue } from '@/lib/tokens/resolveValue';
import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import { useSelectionStore } from '@/zustand/selectionStore';
import { NODE_TYPES } from '@/lib/nodeTypes';
import Image from 'next/image';

export default function NodeRenderer({ onNodePointerDown }) {
    const nodes = useNodeTreeStore((s) => s.nodes);
    const rootIds = useNodeTreeStore((s) => s.rootIds);
    const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);

    const renderNode = (id) => {
        const node = nodes[id];
        if (!node) return null;

        const baseStyle = {
            position: 'absolute',
            left: node.x ?? 0,
            top: node.y ?? 0,
            width: Math.max(1, node.width ?? 1),
            height: Math.max(1, node.height ?? 1),
            opacity: node.opacity ?? 1,
            pointerEvents: node.locked ? 'none' : 'auto',
        };

        const dragProps = {
            draggable: true,
            onDragStart: (e) => {
                e.stopPropagation();
                e.dataTransfer.setData('layer-drag-id', id);
                e.dataTransfer.effectAllowed = 'move';
            },
        };

        const children = (node.children || []).map((cid) => renderNode(cid));

        /* ==================================================
         * 🟦 FRAME
         * ================================================== */
        if (node.type === NODE_TYPES.FRAME) {
            return (
                <FrameRenderer
                    key={id}
                    node={node}
                    style={baseStyle}
                    {...dragProps}
                    onPointerDown={(e) => {
                        setSelectedManual([id]);
                        onNodePointerDown?.(e, id);
                    }}>
                    {children}
                </FrameRenderer>
            );
        }

        /* ==================================================
         * ⬜ SHAPE / RECT
         * ================================================== */
        if (node.type === NODE_TYPES.SHAPE || node.type === NODE_TYPES.RECT) {
            return (
                <div
                    key={id}
                    {...dragProps}
                    style={{
                        ...baseStyle,
                        backgroundColor: resolveValue(node.fill) || '#ffffff',
                        borderRadius: node.radius ?? node.borderRadius ?? 0,
                    }}
                    onMouseDown={(e) => {
                        setSelectedManual([id]);
                        onNodePointerDown?.(e, id);
                    }}>
                    {children}
                </div>
            );
        }

        /* ==================================================
         * 🖼 IMAGE
         * ================================================== */
        if (node.type === NODE_TYPES.IMAGE) {
            const src = resolveAsset(node.assetId) || node.src;

            return (
                <div
                    key={id}
                    {...dragProps}
                    style={baseStyle}
                    onMouseDown={(e) => {
                        setSelectedManual([id]);
                        onNodePointerDown?.(e, id);
                    }}>
                    <Image
                        src={src}
                        alt={node.name || ''}
                        fill
                        style={{
                            objectFit: node.objectFit || 'cover',
                            pointerEvents: 'none',
                        }}
                    />
                    {children}
                </div>
            );
        }

        /* ==================================================
         * 📝 TEXT
         * ================================================== */
        if (node.type === NODE_TYPES.TEXT) {
            return (
                <div
                    key={id}
                    {...dragProps}
                    style={{
                        ...baseStyle,
                        color: resolveValue(node.fill) || '#111',
                        fontSize: node.fontSize || 16,
                        lineHeight: node.lineHeight || 1.3,
                    }}
                    onMouseDown={(e) => {
                        setSelectedManual([id]);
                        onNodePointerDown?.(e, id);
                    }}>
                    {node.text || node.name}
                    {children}
                </div>
            );
        }

        /* ==================================================
         * 🧱 FALLBACK
         * ================================================== */
        return (
            <div
                key={id}
                {...dragProps}
                style={baseStyle}
                onMouseDown={(e) => {
                    setSelectedManual([id]);
                    onNodePointerDown?.(e, id);
                }}>
                {children}
            </div>
        );
    };

    return <>{rootIds.map((id) => renderNode(id))}</>;
}
