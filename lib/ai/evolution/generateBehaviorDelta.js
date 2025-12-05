export function generateBehaviorDelta(selfReview = {}, metrics = {}) {
  const deltas = {};

  if (Array.isArray(selfReview.mistakes)) {
    if (selfReview.mistakes.some((m) => /spacing/i.test(m))) {
      deltas.spacingSensitivity = (metrics.spacingSensitivity || 0) + 0.1;
    }
    if (selfReview.mistakes.some((m) => /hierarchy/i.test(m))) {
      deltas.attentionToHierarchy = (metrics.attentionToHierarchy || 0) + 0.1;
    }
    if (selfReview.mistakes.some((m) => /contrast|accessibility/i.test(m))) {
      deltas.contrastAwareness = (metrics.contrastAwareness || 0) + 0.1;
    }
  }

  if (metrics.animationComplaints) {
    deltas.animationSmoothness = (metrics.animationSmoothness || 0) - 0.05;
  }

  return deltas;
}
