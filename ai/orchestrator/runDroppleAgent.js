import * as Agents from "@/ai/agents/roles";

function camel(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export async function runDroppleAgent(agentName, input, bus = null) {
  const key = camel(agentName);
  const fn =
    Agents[key] || Agents[agentName] || Agents[agentName.replace(/\s+/g, "")];
  if (!fn) throw new Error(`Agent not found: ${agentName}`);
  const result = await fn(input, bus);
  return result;
}
