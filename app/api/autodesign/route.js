"use server";

import { MessageBus } from "@/lib/agents/shared/messageBus";
import {
  runBrandKitAI,
  runStructureAI,
  runWireframeAI,
  runUIAI,
  runAssetAI,
  runPrototypeAI,
  runAnimationAI,
} from "@/lib/agents";
import { assembleWorkspace } from "@/lib/agents/orchestrator/assembleWorkspace";

export async function POST(req) {
  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const bus = new MessageBus();
    bus.send("Orchestrator", "Starting auto-design flow");

    const brand = await step("Brand Agent", bus, () => runBrandKitAI(prompt));
    const structure = await step("Structure Agent", bus, () => runStructureAI(prompt));
    const wireframes = await step("Wireframe Agent", bus, () => runWireframeAI(structure));
    const ui = await step("UI Agent", bus, () => runUIAI(wireframes, brand));
    const assets = await step("Asset Agent", bus, () => runAssetAI(brand, ui));
    const prototype = await step("Prototype Agent", bus, () => runPrototypeAI(ui));
    const animations = await step("Animation Agent", bus, () => runAnimationAI(ui));

    bus.send("Orchestrator", "Auto-design flow complete");

    const workspace = assembleWorkspace({
      brand,
      structure,
      ui,
      assets,
      prototype,
      animations,
      messages: bus.getAll(),
    });

    return Response.json({ workspace });
  } catch (err) {
    console.error("Autodesign failed:", err);
    return Response.json({ error: "Autodesign failed" }, { status: 500 });
  }
}

async function step(agent, bus, fn) {
  bus.send(agent, "Starting task...");
  const result = await fn();
  bus.send(agent, "Completed task.");
  return result;
}
