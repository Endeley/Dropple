import { materialWorkspace } from '../registry';

export const defaults = {
  id: materialWorkspace.id,
  label: materialWorkspace.label,
  description: materialWorkspace.description,
  engines: materialWorkspace.engines || [],
  nodeTypes: materialWorkspace.nodeTypes || [],
  timeline: materialWorkspace.timeline || null,
  export: materialWorkspace.export || null,
  defaultTool: materialWorkspace.defaultTool,
  extends: materialWorkspace.extends || null,
};
