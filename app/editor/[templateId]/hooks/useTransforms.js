import { useEditorStore } from "./useEditorStore";

export function useTransforms() {
  const { updateNode } = useEditorStore();
  const move = (id, x, y) => updateNode(id, { x, y });
  const resize = (id, width, height) => updateNode(id, { width, height });
  const rotate = (id, rotation) => updateNode(id, { rotation });
  return { move, resize, rotate };
}
