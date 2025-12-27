export function mergeResults(state, update) {
  if (!update) return state;
  return Object.assign(state, update);
}
