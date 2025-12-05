export function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
}
