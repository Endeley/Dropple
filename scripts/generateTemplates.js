"use client";

/**
 * CLI helper (run with node scripts/generateTemplates.js or `node scripts/generateTemplates.js save`).
 * Generates up to 100 templates using the batch API.
 * Usage:
 *   node scripts/generateTemplates.js           // generate defaults, do not save
 *   node scripts/generateTemplates.js save      // generate defaults and save to Convex
 */

import fs from "fs";

const BASE_URL = process.env.DROPPLE_BASE_URL || "http://localhost:3000";

async function main() {
  const save = process.argv.includes("save");
  const res = await fetch(`${BASE_URL}/api/templates/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ useDefaults: true, save, zip: false }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Batch generation failed:", res.status, text);
    process.exit(1);
  }
  const data = await res.json();
  console.log(`Generated ${data.count} templates`);
  if (!save) {
    const out = "./.tmp/generated-templates.json";
    fs.mkdirSync("./.tmp", { recursive: true });
    fs.writeFileSync(out, JSON.stringify(data.templates || data.results, null, 2));
    console.log(`Templates written to ${out}`);
  } else {
    console.log("Templates saved to Convex.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
