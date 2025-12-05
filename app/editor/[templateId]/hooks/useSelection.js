import { useEditorStore } from "./useEditorStore";

export function useSelection() {
  const { selectedNodeIds, setSelectedNodes } = useEditorStore();
  return { selectedNodeIds, setSelectedNodes };
}
