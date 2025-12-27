import { MessageBus } from "./messageBus";
import {
  runBrandKitAI,
  runStructureAI,
  runWireframeAI,
  runUIAI,
  runAssetAI,
  runPrototypeAI,
  runAnimationAI,
} from "./index";
import { assembleWorkspace } from "@/lib/assembleWorkspace";

export async function runDesignTeam(prompt) {
  const bus = new MessageBus();
  bus.send("Orchestrator", "Starting auto-design run.");

  const brand = await step("Brand Agent", bus, () => runBrandKitAI(prompt));
  const structure = await step("Structure Agent", bus, () => runStructureAI(prompt));
  const wireframes = await step("Wireframe Agent", bus, () => runWireframeAI(structure));
  const ui = await step("UI Agent", bus, () => runUIAI(wireframes, brand));
  const assets = await step("Asset Agent", bus, () => runAssetAI(brand, ui));
  const prototype = await step("Prototype Agent", bus, () => runPrototypeAI(ui));
  const animations = await step("Animation Agent", bus, () => runAnimationAI(ui));

  const workspace = assembleWorkspace({
    brand,
    structure,
    ui,
    assets,
    prototype,
    animations,
    messages: bus.getAll(),
  });

  bus.send("Orchestrator", "Auto-design run complete.");
  return workspace;
}

async function step(agentName, bus, fn) {
  bus.send(agentName, "Starting task...");
  const result = await fn();
  bus.send(agentName, "Completed task.");
  return result;
}
