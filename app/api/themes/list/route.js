"use server";

export async function GET() {
  // Placeholder theme list endpoint to avoid 404s; integrate real themes later.
  return Response.json({ themes: [] });
}
