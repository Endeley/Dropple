// PURE FUNCTION — no stores, no side effects
export function blendConstraints(nodes) {
    if (!nodes.length) return null;

    const h = nodes.map((n) => n.constraints?.horizontal ?? 'left');
    const v = nodes.map((n) => n.constraints?.vertical ?? 'top');

    return {
        horizontal: blendAxis(h),
        vertical: blendAxis(v),
    };
}

function blendAxis(values) {
    const unique = Array.from(new Set(values));
    return unique.length === 1 ? unique[0] : 'mixed';
}
