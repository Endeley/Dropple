import { MessageBus } from "../messageBus/messageBus.js";
import * as Agents from "../agents/roles";
import { AGENT_PIPELINE } from "./multiAgentConfig.js";
import { mergeResults } from "../utils/mergeResults.js";
import { setAgentInstruction } from "../agents/baseAgent.js";
import { buildConsensus } from "../utils/buildConsensus.js";

export async function runDesignTeam(prompt, workspace = null) {
  const bus = new MessageBus();
  const state = { prompt, workspace, overrideInstructions: {} };

  bus.send("System", "Starting multi-agent pipeline…");

  for (const agentName of AGENT_PIPELINE) {
    const fnKey = camelCase(agentName);
    const agentFunction = Agents[fnKey];

    if (!agentFunction) {
      bus.send("System", `Agent ${agentName} not implemented yet.`);
      continue;
    }

    const instruction =
      state.overrideInstructions?.[agentName] ||
      state.productManagerAgent?.agentInstructions?.[agentName];

    if (instruction) {
      setAgentInstruction(instruction);
    }

    bus.send("System", `Running: ${agentName}`);
    const result = await agentFunction(state, bus);
    state[fnKey] = result;
    mergeResults(state, result);
  }

  // Build consensus snapshot
  state.consensus = buildConsensus(state);

  bus.send("System", "Pipeline complete.");
  return { state, messages: bus.getMessages() };
}

function camelCase(name) {
  return name
    .replace(/ ([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/ /g, "")
    .replace(/^([A-Z])/, (m) => m.toLowerCase());
}
