"use server";

import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex/client";

export async function POST(req) {
  const body = await req.json();

  const { id, title, description, price, tags, category } = body;

  const result = await convexClient.mutation(api.templates.publishTemplate, {
    id,
    title,
    description,
    price,
    tags,
    category,
  });

  return Response.json({ success: true, result });
}
