'use client';

export default function GhostNodes({ previewNodes = {} }) {
    if (!previewNodes || typeof previewNodes !== 'object') return null;

    return (
        <>
            {Object.values(previewNodes).map((n) => {
                if (!n || !n.__preview) return null;

                const h = n.__constraint?.horizontal ?? 'left';
                const v = n.__constraint?.vertical ?? 'top';

                const typeClass = getGhostTypeClass(h, v);

                return (
                    <div
                        key={n.id}
                        className={`absolute pointer-events-none ghost-node ${typeClass}`}
                        style={{
                            left: n.x,
                            top: n.y,
                            width: n.width,
                            height: n.height,
                        }}
                    />
                );
            })}
        </>
    );
}

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
