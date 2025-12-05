import { useEditorStore } from "./useEditorStore";

export function useNodes() {
  const { nodes, addNode, updateNode, deleteNode } = useEditorStore();
  return { nodes, addNode, updateNode, deleteNode };
}
