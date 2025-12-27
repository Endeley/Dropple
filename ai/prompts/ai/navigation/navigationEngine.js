export function extractNavigationGraph(workspace = { pages: [] }) {
  const graph = {};
  if (!workspace.pages) return graph;

  workspace.pages.forEach((page) => {
    graph[page.id] = (page.layers || [])
      .filter((l) => l.type === "button" && l.link)
      .map((l) => l.link);
  });

  return graph;
}
