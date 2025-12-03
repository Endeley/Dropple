export default function createTemplate() {
  return {
    id: crypto.randomUUID(),
    name: "Untitled Template",
    mode: "uiux",
    thumbnail: "",
    width: 1440,
    height: 1024,
    layers: [],
    tags: [],
    createdAt: Date.now(),
  };
}
