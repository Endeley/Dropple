export function findLayer(workspace, layerId) {
  if (!workspace?.pages) return null;
  for (const page of workspace.pages) {
    const found = walk(page.layers || [], layerId);
    if (found) return found;
  }
  return null;
}

function walk(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const child = walk(node.children, id);
      if (child) return child;
    }
  }
  return null;
}
