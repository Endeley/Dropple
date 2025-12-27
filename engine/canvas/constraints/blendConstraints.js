/* =========================================
   CONSTRAINT BLENDING
   Pure helpers for multi-select UI state
   (NO store access, NO side effects)
========================================= */

/**
 * Blends constraints across multiple nodes.
 * Used to determine:
 * - uniform value
 * - or "mixed" state in UI
 */
export function blendConstraints(nodes, breakpoint = 'base') {
    if (!Array.isArray(nodes) || nodes.length === 0) return null;

    const validNodes = nodes.filter(Boolean);
    if (!validNodes.length) return null;

    const horizontals = validNodes.map((n) => normalizeConstraint(n.constraints?.[breakpoint]?.horizontal ?? n.constraints?.base?.horizontal ?? n.constraints?.horizontal ?? 'left'));

    const verticals = validNodes.map((n) => normalizeConstraint(n.constraints?.[breakpoint]?.vertical ?? n.constraints?.base?.vertical ?? n.constraints?.vertical ?? 'top'));

    return {
        horizontal: blendAxis(horizontals),
        vertical: blendAxis(verticals),
    };
}

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

function blendAxis(values) {
    const unique = Array.from(new Set(values));
    return unique.length === 1 ? unique[0] : 'mixed';
}

/**
 * Normalizes equivalent constraint values
 * so blending does not falsely report "mixed".
 */
function normalizeConstraint(value) {
    if (value === 'stretch') return 'left-right';
    return value;
}
