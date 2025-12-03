"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function GET() {
  const styles = await convexClient.query(api.styles.getStyles, {});
  return Response.json({ styles });
}
