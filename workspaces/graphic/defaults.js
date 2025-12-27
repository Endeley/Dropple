import { graphicWorkspace } from '../registry';

export const defaults = {
  id: graphicWorkspace.id,
  label: graphicWorkspace.label,
  description: graphicWorkspace.description,
  engines: graphicWorkspace.engines || [],
  nodeTypes: graphicWorkspace.nodeTypes || [],
  timeline: graphicWorkspace.timeline || null,
  export: graphicWorkspace.export || null,
  defaultTool: graphicWorkspace.defaultTool,
  extends: graphicWorkspace.extends || null,
};
