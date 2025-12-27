import { podcastWorkspace } from '../registry';

export const defaults = {
  id: podcastWorkspace.id,
  label: podcastWorkspace.label,
  description: podcastWorkspace.description,
  engines: podcastWorkspace.engines || [],
  nodeTypes: podcastWorkspace.nodeTypes || [],
  timeline: podcastWorkspace.timeline || null,
  export: podcastWorkspace.export || null,
  defaultTool: podcastWorkspace.defaultTool,
  extends: podcastWorkspace.extends || null,
};
