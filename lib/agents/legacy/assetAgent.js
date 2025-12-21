import { runAssetGeneration } from "@/lib/agents/shared/sharedAssetGen";

export async function runAssetAI(brand, ui) {
  // For now, delegate to a shared generator stub that returns empty list.
  return await runAssetGeneration(brand, ui);
}
