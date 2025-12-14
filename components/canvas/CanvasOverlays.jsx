'use client';

import SelectionBox from './SelectionBox';
import SelectionOverlay from './SelectionOverlay';
import GuideRenderer from './GuideRenderer';
import GhostNodes from './GhostNodes';
import ConstraintGuides from './overlays/ConstraintGuides';

export default function CanvasOverlays({ nodeMap = {}, previewNodes, selectionBox, startResize, startRotate, pan, zoom }) {
    const previewParent = previewNodes?.__parent || null;
    const previewChildren = previewNodes?.nodes || null;

    return (
        <div className='absolute inset-0 pointer-events-none z-50'>
            {/* World-space overlays */}
            <div
                className='absolute inset-0'
                style={{
                    transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px) scale(${zoom || 1})`,
                    transformOrigin: '0 0',
                }}>
                {/* 👻 Ghost children (constraint preview) */}
                <GhostNodes previewNodes={previewChildren || {}} />

                {/* 📏 Constraint explanation lines */}
                {previewParent && previewChildren && <ConstraintGuides parent={previewParent} previewNodes={previewChildren} />}

                {/* 🧭 Snap / alignment guides */}
                <GuideRenderer />

                {/* 🔲 Selection overlay */}
                <SelectionOverlay nodeMap={nodeMap} onResizeStart={startResize} onRotateStart={startRotate} />

                {/* 🟦 Marquee selection */}
                <SelectionBox box={selectionBox} />
            </div>
        </div>
    );
}
