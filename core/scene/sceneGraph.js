// core/scene/sceneGraph.js
// Minimal scene graph utilities to keep hierarchy operations centralized.

/**
 * Creates a scene graph snapshot.
 * @param {Object} nodes
 * @param {string[]} rootIds
 */
export function createSceneGraph(nodes = {}, rootIds = []) {
  return {
    nodes,
    rootIds: Array.from(new Set(rootIds)),
  };
}

/**
 * Replaces nodes and rootIds immutably.
 */
export function updateSceneGraph(graph, nextNodes = graph.nodes, nextRootIds = graph.rootIds) {
  return {
    nodes: { ...nextNodes },
    rootIds: Array.from(new Set(nextRootIds)),
  };
}

export function addRoot(graph, nodeId) {
  if (!nodeId) return graph;
  const roots = new Set(graph.rootIds || []);
  roots.add(nodeId);
  return { ...graph, rootIds: Array.from(roots) };
}

export function removeRoot(graph, nodeId) {
  if (!nodeId) return graph;
  const roots = (graph.rootIds || []).filter((id) => id !== nodeId);
  return { ...graph, rootIds: roots };
}
