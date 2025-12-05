export function buildConsensus(agentOutputs = {}) {
  const unifiedStyles = merge(
    agentOutputs.uiAgent?.ui,
    agentOutputs.styleConsistencyAgent,
  );
  const unifiedUX = merge(
    agentOutputs.uxAgent,
    agentOutputs.qaDesignAgent,
    agentOutputs.contentDesignAgent,
  );
  const unifiedAnimations = merge(
    agentOutputs.motionAgent,
    agentOutputs.animationCritiqueAgent,
  );
  const unifiedCode = merge(
    agentOutputs.codeAgent,
    agentOutputs.codeQualityAgent,
    agentOutputs.performanceAgent,
  );

  return {
    unifiedStyles,
    unifiedUX,
    unifiedAnimations,
    unifiedCode,
  };
}

function merge(...parts) {
  return parts
    .filter(Boolean)
    .reduce((acc, part) => ({ ...acc, ...part }), {});
}
