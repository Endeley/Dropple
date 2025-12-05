import { api, internal } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  const { storageId } = params;
  try {
    const url = await fetchMutation(api.files.getUrl, { storageId });
    if (!url) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.redirect(url);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}
