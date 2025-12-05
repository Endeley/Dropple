export async function runAIPipeline(prompt) {
  await fetch("/api/design-team/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
}
