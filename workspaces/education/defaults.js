import { educationWorkspace } from '../registry';

export const defaults = {
  id: educationWorkspace.id,
  label: educationWorkspace.label,
  description: educationWorkspace.description,
  engines: educationWorkspace.engines || [],
  nodeTypes: educationWorkspace.nodeTypes || [],
  timeline: educationWorkspace.timeline || null,
  export: educationWorkspace.export || null,
  defaultTool: educationWorkspace.defaultTool,
  extends: educationWorkspace.extends || null,
};
