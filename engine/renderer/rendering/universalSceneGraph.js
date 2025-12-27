// Minimal placeholder for a universal scene graph representation the agents can share.
// This can be expanded with nodes, materials, animations, audio, and spatial anchors.
export function createSceneGraph({ nodes = [], cameras = [], lights = [], materials = [], animations = [], audio = [], metadata = {} } = {}) {
  return {
    nodes,
    cameras,
    lights,
    materials,
    animations,
    audio,
    metadata,
  };
}

export function mergeSceneGraphs(base = {}, patch = {}) {
  return {
    ...base,
    ...patch,
    nodes: patch.nodes || base.nodes || [],
    cameras: patch.cameras || base.cameras || [],
    lights: patch.lights || base.lights || [],
    materials: patch.materials || base.materials || [],
    animations: patch.animations || base.animations || [],
    audio: patch.audio || base.audio || [],
    metadata: { ...(base.metadata || {}), ...(patch.metadata || {}) },
  };
}
