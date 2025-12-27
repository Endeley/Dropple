'use client';

/**
 * ConstraintGuides
 * ----------------
 * Pure visual overlay that renders distance
 * guides between a parent and its preview children.
 *
 * - No engine logic
 * - No store access
 * - Receives computed geometry only
 */

export default function ConstraintGuides({ parent, previewNodes }) {
    if (!parent || !previewNodes || typeof previewNodes !== 'object') {
        return null;
    }

    const children = Object.values(previewNodes).filter(Boolean);

    if (!children.length) return null;

    return (
        <>
            {children.map((child) => (
                <DistanceLines key={child.id} parent={parent} child={child} />
            ))}
        </>
    );
}

/* ------------------------------------------------
   Distance computation (visual only)
------------------------------------------------ */

function DistanceLines({ parent, child }) {
    if (!parent || !child) return null;

    const px = parent.x;
    const py = parent.y;
    const pw = parent.width;
    const ph = parent.height;

    const cx = child.x;
    const cy = child.y;
    const cw = child.width;
    const ch = child.height;

    if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pw) || !Number.isFinite(ph) || !Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(cw) || !Number.isFinite(ch)) {
        return null;
    }

    const lines = [];

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

    if (!lines.length) return null;

    return (
        <>
            {lines.map((line, i) => (
                <GuideLine key={i} {...line} />
            ))}
        </>
    );
}

/* ------------------------------------------------
   Individual guide line
------------------------------------------------ */

function GuideLine({ x1, y1, x2, y2, label }) {
    const isHorizontal = y1 === y2;

    const labelX = (x1 + x2) / 2;
    const labelY = (y1 + y2) / 2;

    return (
        <>
            <svg className='absolute inset-0 pointer-events-none overflow-visible'>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className='constraint-guide-line' />
            </svg>

            <div
                className='constraint-guide-label'
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
