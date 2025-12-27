import { documentsWorkspace } from '../registry';

export const defaults = {
  id: documentsWorkspace.id,
  label: documentsWorkspace.label,
  description: documentsWorkspace.description,
  engines: documentsWorkspace.engines || [],
  nodeTypes: documentsWorkspace.nodeTypes || [],
  timeline: documentsWorkspace.timeline || null,
  export: documentsWorkspace.export || null,
  defaultTool: documentsWorkspace.defaultTool,
  extends: documentsWorkspace.extends || null,
};
