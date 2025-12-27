import { brandingWorkspace } from '../registry';

export const defaults = {
  id: brandingWorkspace.id,
  label: brandingWorkspace.label,
  description: brandingWorkspace.description,
  engines: brandingWorkspace.engines || [],
  nodeTypes: brandingWorkspace.nodeTypes || [],
  timeline: brandingWorkspace.timeline || null,
  export: brandingWorkspace.export || null,
  defaultTool: brandingWorkspace.defaultTool,
  extends: brandingWorkspace.extends || null,
};
