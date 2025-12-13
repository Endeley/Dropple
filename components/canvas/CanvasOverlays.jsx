'use client';

import SelectionBox from './SelectionBox';
import SelectionOverlay from './SelectionOverlay';
import GuideRenderer from './GuideRenderer';
import ConstraintPins from './overlays/ConstraintPins';
export default function CanvasOverlays({ nodeMap = {}, selectionBox, startResize, pan, zoom }) {
    return (
        <div className='absolute inset-0 pointer-events-none z-50'>
            {/* World-space overlays (follow pan + zoom) */}
            <div
                className='absolute inset-0'
                style={{
                    transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px) scale(${zoom || 1})`,
                    transformOrigin: '0 0',
                }}>
                {/* 🧭 Alignment / snap guides */}
                <GuideRenderer />

                {/* 🔲 Selection bounds + resize handles */}
                <SelectionOverlay nodeMap={nodeMap} onResizeStart={startResize} />
                <ConstraintPins nodeMap={nodeMap} />

                {/* 📐 Marquee selection */}
                <SelectionBox box={selectionBox} />
            </div>

            {/* Screen-space overlays (tooltips, cursors, HUD) */}
            {/* Intentionally outside transform */}
        </div>
    );
}
