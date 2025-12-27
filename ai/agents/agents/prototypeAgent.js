import { runPrototypeAI as existingPrototypeAI } from "@/ai/agents/prototypeExisting";

export async function runPrototypeAI(ui) {
  // Delegate to existing prototype AI if available; otherwise return empty flows.
  if (existingPrototypeAI) {
    return await existingPrototypeAI(ui);
  }
  return { flows: [], microInteractions: [], flowMap: [] };
}
