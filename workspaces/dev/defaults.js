import { devWorkspace } from '../registry';

export const defaults = {
  id: devWorkspace.id,
  label: devWorkspace.label,
  description: devWorkspace.description,
  engines: devWorkspace.engines || [],
  nodeTypes: devWorkspace.nodeTypes || [],
  timeline: devWorkspace.timeline || null,
  export: devWorkspace.export || null,
  defaultTool: devWorkspace.defaultTool,
  extends: devWorkspace.extends || null,
};
