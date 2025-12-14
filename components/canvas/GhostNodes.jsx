'use client';

export default function GhostNodes({ previewNodes = {} }) {
    if (!previewNodes || Object.keys(previewNodes).length === 0) return null;

    return (
        <>
            {Object.values(previewNodes).map((n) => (
                <div
                    key={n.id}
                    className='ghost-node'
                    style={{
                        left: n.x,
                        top: n.y,
                        width: n.width,
                        height: n.height,
                    }}
                />
            ))}
        </>
    );
}
