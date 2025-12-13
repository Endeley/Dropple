import { applyConstraints } from './applyConstraints';

/**
 * Computes constrained child positions WITHOUT mutating store
 */
export function computeConstraintPreview(parent, nodes) {
    const preview = {};

    applyConstraints(parent, nodes, (childId, updates) => {
        preview[childId] = updates;
    });

    return preview;
}
