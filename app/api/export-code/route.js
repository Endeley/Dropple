"use server";

import { buildCodeBlueprint } from "@/lib/buildCodeBlueprint";
import { generateProjectFiles } from "@/lib/generateProjectFiles";
import { createZip } from "@/lib/createZip";

export async function POST(req) {
  const { workspace } = await req.json();
  if (!workspace) {
    return Response.json({ error: "workspace is required" }, { status: 400 });
  }

  try {
    const blueprint = buildCodeBlueprint(workspace);
    const files = await generateProjectFiles(blueprint);
    const zipBuffer = await createZip(files);

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=dropple-export.zip",
      },
    });
  } catch (err) {
    console.error("Export code failed", err);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
