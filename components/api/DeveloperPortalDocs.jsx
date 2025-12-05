"use client";

export default function DeveloperPortalDocs() {
  return (
    <div className="bg-white border rounded p-4 h-96 overflow-auto space-y-3">
      <p className="font-semibold text-lg">Dropple API (Agents)</p>
      <p className="text-sm text-gray-600">
        Call any Dropple agent via REST:
      </p>
      <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded border">
{`POST /api/agent
{
  "agent": "UX Agent",
  "input": { "prompt": "Improve onboarding" },
  "apiKey": "YOUR_KEY"
}`}
      </pre>
      <p className="text-sm text-gray-600">
        Use SDK (future):
      </p>
      <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded border">
{`import { Dropple } from "dropple-sdk";
const dropple = new Dropple({ apiKey: process.env.DROPPLE_KEY });
const res = await dropple.agents.ux({ prompt: "..." });`}
      </pre>
    </div>
  );
}
