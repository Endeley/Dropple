export function buildPrompt(basePrompt, memory = {}) {
  const styleMemory = memory.styleMemory || {};
  const agentMemory = memory.agentMemory || {};
  const behaviorDeltas = memory.behaviorDeltas || {};

  return `
${basePrompt}

User Style Memory:
${JSON.stringify(styleMemory)}

Agent Performance Profile:
${JSON.stringify(agentMemory)}

Behavior Modifiers:
${JSON.stringify(behaviorDeltas)}

Follow the above while keeping system constraints and brand/style alignment.`;
}
