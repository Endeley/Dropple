import { aiWorkspace } from '../registry';

export const defaults = {
  id: aiWorkspace.id,
  label: aiWorkspace.label,
  description: aiWorkspace.description,
  engines: aiWorkspace.engines || [],
  nodeTypes: aiWorkspace.nodeTypes || [],
  timeline: aiWorkspace.timeline || null,
  export: aiWorkspace.export || null,
  defaultTool: aiWorkspace.defaultTool,
  extends: aiWorkspace.extends || null,
};
