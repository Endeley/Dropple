'use client';

/**
 * GhostNodes
 * ----------
 * Pure visual preview renderer for constraint-based layout.
 * - Receives computed preview geometry ONLY
 * - No engine logic
 * - No store access
 * - No side effects
 */

export default function GhostNodes({ previewNodes = {} }) {
    if (!previewNodes || typeof previewNodes !== 'object') return null;

    return (
        <>
            {Object.values(previewNodes).map((node) => {
                if (!node) return null;

                const { x, y, width, height, constraints = {} } = node;

                if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
                    return null;
                }

                const horizontal = constraints.horizontal ?? 'left';
                const vertical = constraints.vertical ?? 'top';

                const typeClass = getGhostTypeClass(horizontal, vertical);

                return (
                    <div
                        key={node.id}
                        className={`absolute pointer-events-none ghost-node ${typeClass}`}
                        style={{
                            left: x,
                            top: y,
                            width,
                            height,
                        }}
                    />
                );
            })}
        </>
    );
}

/* ---------------------------------------------
   Ghost visual semantics
--------------------------------------------- */

function getGhostTypeClass(horizontal, vertical) {
    // stretch
    if (horizontal === 'left-right' && vertical === 'top-bottom') return 'ghost-both-stretch';

    if (horizontal === 'left-right') return 'ghost-h-stretch';

    if (vertical === 'top-bottom') return 'ghost-v-stretch';

    // anchored
    if (horizontal === 'right') return 'ghost-right';

    if (horizontal === 'center') return 'ghost-h-center';

    if (vertical === 'bottom') return 'ghost-bottom';

    if (vertical === 'center') return 'ghost-v-center';

    return 'ghost-left-top';
}
