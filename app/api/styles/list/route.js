"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  try {
    const styles = (await convexClient.query(api.styles.getStyles, {})) || [];
    return Response.json({ styles });
  } catch (err) {
    console.error("Failed to list styles", err);
    const status = err?.message === "Not authenticated" ? 401 : 500;
    return Response.json({ styles: [], error: err?.message || "Failed to load styles" }, { status });
  }
}
