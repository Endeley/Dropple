'use client';

export default function ConstraintGuides({ parent, previewNodes }) {
    if (!parent || !previewNodes) return null;

    if (!previewNodes.nodes || typeof previewNodes.nodes !== 'object') return null;

    return (
        <>
            {children.map((child) => (
                <DistanceLines key={child.id} parent={parent} child={child} />
            ))}
        </>
    );
}

/* ------------------------------------------------ */

function DistanceLines({ parent, child }) {
    const lines = [];

    const px = parent.x;
    const py = parent.y;
    const pw = parent.width;
    const ph = parent.height;

    const cx = child.x;
    const cy = child.y;
    const cw = child.width;
    const ch = child.height;

    // LEFT
    if (cx > px) {
        lines.push({
            x1: px,
            y1: cy + ch / 2,
            x2: cx,
            y2: cy + ch / 2,
            label: Math.round(cx - px),
        });
    }

    // RIGHT
    if (cx + cw < px + pw) {
        lines.push({
            x1: cx + cw,
            y1: cy + ch / 2,
            x2: px + pw,
            y2: cy + ch / 2,
            label: Math.round(px + pw - (cx + cw)),
        });
    }

    // TOP
    if (cy > py) {
        lines.push({
            x1: cx + cw / 2,
            y1: py,
            x2: cx + cw / 2,
            y2: cy,
            label: Math.round(cy - py),
        });
    }

    // BOTTOM
    if (cy + ch < py + ph) {
        lines.push({
            x1: cx + cw / 2,
            y1: cy + ch,
            x2: cx + cw / 2,
            y2: py + ph,
            label: Math.round(py + ph - (cy + ch)),
        });
    }

    return (
        <>
            {lines.map((l, i) => (
                <GuideLine key={i} {...l} />
            ))}
        </>
    );
}

/* ------------------------------------------------ */

function GuideLine({ x1, y1, x2, y2, label }) {
    const isHorizontal = y1 === y2;

    const labelX = (x1 + x2) / 2;
    const labelY = (y1 + y2) / 2;

    return (
        <>
            <svg className='absolute inset-0 pointer-events-none' style={{ overflow: 'visible' }}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke='#3b82f6' strokeDasharray='4 4' strokeWidth='1' />
            </svg>

            <div
                className='absolute text-[10px] px-1 rounded bg-blue-600 text-white pointer-events-none'
                style={{
                    left: labelX + (isHorizontal ? 0 : 6),
                    top: labelY + (isHorizontal ? -14 : 0),
                    transform: 'translate(-50%, -50%)',
                }}>
                {label}
            </div>
        </>
    );
}
