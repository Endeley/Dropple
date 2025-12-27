import { videoWorkspace } from '../registry';

export const defaults = {
  id: videoWorkspace.id,
  label: videoWorkspace.label,
  description: videoWorkspace.description,
  engines: videoWorkspace.engines || [],
  nodeTypes: videoWorkspace.nodeTypes || [],
  timeline: videoWorkspace.timeline || null,
  export: videoWorkspace.export || null,
  defaultTool: videoWorkspace.defaultTool,
  extends: videoWorkspace.extends || null,
};
