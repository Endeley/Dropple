import { uiuxWorkspace } from '../registry';

export const defaults = {
  id: uiuxWorkspace.id,
  label: uiuxWorkspace.label,
  description: uiuxWorkspace.description,
  engines: uiuxWorkspace.engines || [],
  nodeTypes: uiuxWorkspace.nodeTypes || [],
  timeline: uiuxWorkspace.timeline || null,
  export: uiuxWorkspace.export || null,
  defaultTool: uiuxWorkspace.defaultTool,
  extends: uiuxWorkspace.extends || null,
};
