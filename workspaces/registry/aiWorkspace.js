// /workspaces/registry/aiWorkspace.js

export const aiWorkspace = {
  id: "ai",
  label: "AI Suite",
  description: "AI-assisted workflows and generators",
  engines: ["ai"],
  tools: ["select"],
  nodeTypes: ["component"],
  panels: ["ai"],
  defaultTool: "select",
  timeline: {
    enabled: false,
    mode: "none",
  },
  export: {
    formats: ["json"],
  },
};
