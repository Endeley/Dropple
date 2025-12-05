export function exportTemplate(store) {
  const { width, height, background, nodes } = store;
  return JSON.stringify({ width, height, background, nodes });
}
