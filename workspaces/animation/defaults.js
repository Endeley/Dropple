import { animationWorkspace } from '../registry';

export const defaults = {
  id: animationWorkspace.id,
  label: animationWorkspace.label,
  description: animationWorkspace.description,
  engines: animationWorkspace.engines || [],
  nodeTypes: animationWorkspace.nodeTypes || [],
  timeline: animationWorkspace.timeline || null,
  export: animationWorkspace.export || null,
  defaultTool: animationWorkspace.defaultTool,
  extends: animationWorkspace.extends || null,
};
