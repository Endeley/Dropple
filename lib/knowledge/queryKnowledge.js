import { convexClient } from "@/lib/convex/client";
import { api } from "@/convex/_generated/api";

export async function queryKnowledge({ category, prompt }) {
  // prompt embedding stub could be added later; currently filter by category.
  const nodes = await convexClient.query(api.knowledge.search, {
    category: category || undefined,
    limit: 20,
  });
  return nodes;
}
