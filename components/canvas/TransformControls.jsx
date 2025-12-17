'use client';

/**
 * TransformControls
 * ------------------
 * Pure UI component.
 * - Renders resize & rotate handles
 * - Emits handle identity ONLY
 * - Contains NO layout or constraint logic
 *
 * Resize semantics (edge vs corner) are
 * resolved by the canvas engine.
 */

import { EDGE_HANDLES, CORNER_HANDLES } from '@/lib/canvas-core/transforms';

export default function TransformControls({ bounds, onResizeStart, onRotateStart }) {
    if (!bounds) return null;

    const isFiniteBounds = Number.isFinite(bounds.x) && Number.isFinite(bounds.y) && Number.isFinite(bounds.width) && Number.isFinite(bounds.height);

    if (!isFiniteBounds) return null;

    /**
     * Render order matters visually.
     * We keep the classic clockwise order.
     */
    const HANDLE_ORDER = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left'];

    return (
        <div
            id='transform-overlay'
            className='absolute border border-fuchsia-400 pointer-events-none'
            style={{
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
            }}>
            {/* Resize handles */}
            {HANDLE_ORDER.map((handle) => (
                <div
                    key={handle}
                    data-resize-handle={handle}
                    className='absolute w-3 h-3 bg-white rounded-sm border border-fuchsia-400 pointer-events-auto'
                    style={{
                        ...handleStyle(handle, bounds),
                        cursor: handleCursor(handle),
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onResizeStart?.(e, handle);
                    }}
                />
            ))}

            {/* Rotate handle */}
            <div
                data-rotate-handle
                className='absolute w-4 h-4 bg-yellow-300 rounded-full border border-yellow-500 pointer-events-auto cursor-grab'
                style={{
                    left: bounds.width / 2 - 8,
                    top: -32,
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRotateStart?.(e);
                }}
            />
        </div>
    );
}

/* ---------------------------------------------
   Handle positioning
--------------------------------------------- */

function handleStyle(handle, bounds) {
    const map = {
        'top-left': { left: -4, top: -4 },
        top: { left: bounds.width / 2 - 4, top: -4 },
        'top-right': { left: bounds.width - 4, top: -4 },
        right: {
            left: bounds.width - 4,
            top: bounds.height / 2 - 4,
        },
        'bottom-right': {
            left: bounds.width - 4,
            top: bounds.height - 4,
        },
        bottom: {
            left: bounds.width / 2 - 4,
            top: bounds.height - 4,
        },
        'bottom-left': {
            left: -4,
            top: bounds.height - 4,
        },
        left: {
            left: -4,
            top: bounds.height / 2 - 4,
        },
    };

    return map[handle];
}

/* ---------------------------------------------
   Cursor semantics
--------------------------------------------- */

function handleCursor(handle) {
    const map = {
        'top-left': 'nwse-resize',
        'top-right': 'nesw-resize',
        'bottom-right': 'nwse-resize',
        'bottom-left': 'nesw-resize',
        top: 'ns-resize',
        bottom: 'ns-resize',
        left: 'ew-resize',
        right: 'ew-resize',
    };

    return map[handle] || 'default';
}
