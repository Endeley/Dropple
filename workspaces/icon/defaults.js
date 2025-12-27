import { iconWorkspace } from '../registry';

export const defaults = {
  id: iconWorkspace.id,
  label: iconWorkspace.label,
  description: iconWorkspace.description,
  engines: iconWorkspace.engines || [],
  nodeTypes: iconWorkspace.nodeTypes || [],
  timeline: iconWorkspace.timeline || null,
  export: iconWorkspace.export || null,
  defaultTool: iconWorkspace.defaultTool,
  extends: iconWorkspace.extends || null,
};
