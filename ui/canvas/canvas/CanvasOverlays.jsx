'use client';

import SelectionBox from './SelectionBox';
import SelectionOverlay from './SelectionOverlay';
import GuideRenderer from './GuideRenderer';
import GhostNodes from './GhostNodes';
import ConstraintGuides from './overlays/ConstraintGuides';
import BreakpointPins from './overlays/BreakpointPins';
import ConstraintPins from './overlays/ConstraintPins';
import AutoLayoutHandles from './overlays/AutoLayoutHandles';

import { useNodeTreeStore } from '@/runtime/stores/nodeTreeStore';

export default function CanvasOverlays({ nodeMap = {}, previewNodes, selectionBox, startResize, startRotate, pan, zoom, bounds = null }) {
    const previewParent = previewNodes?.__parent || null;
    const previewChildren = previewNodes?.nodes || null;

    const nodes = useNodeTreeStore((s) => s.nodes);
    const setPadding = useNodeTreeStore((s) => s.setAutoLayoutPadding);
    const setGap = useNodeTreeStore((s) => s.setAutoLayoutGap);

    const parent = previewParent ? (nodes[previewParent.id] ?? previewParent) : null;

    const parentBounds = parent
        ? {
              x: parent.x,
              y: parent.y,
              width: parent.width,
              height: parent.height,
          }
        : null;

    return (
        <div className='absolute inset-0 z-50'>
            {/* World-space overlays */}
            <BreakpointPins bounds={bounds} />

            <div
                className='absolute inset-0 pointer-events-none'
                style={{
                    transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px) scale(${zoom || 1})`,
                    transformOrigin: '0 0',
                }}>
                {/* 👻 Ghost children (constraint / auto-layout preview) */}
                <GhostNodes previewNodes={previewChildren || {}} />

                {/* 📌 Constraint pins */}
                {bounds && <ConstraintPins bounds={bounds} />}

                {/* 🔧 Auto-layout padding & gap handles */}
                {parent?.layout === 'flex' && parentBounds && (
                    <div className='pointer-events-auto'>
                        <AutoLayoutHandles bounds={parentBounds} direction={parent.autoLayout?.direction} padding={parent.autoLayout?.padding ?? 8} gap={parent.autoLayout?.gap ?? 8} onPaddingChange={(v) => setPadding(parent.id, v)} onGapChange={(v) => setGap(parent.id, v)} />
                    </div>
                )}

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
