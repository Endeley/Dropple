"use client";

import { useEffect } from "react";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useHistoryStore } from "@/zustand/historyStore";
import { createGroup, ungroup } from "@/lib/canvas-core/grouping";

export default function KeyboardShortcuts() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const setSelected = useSelectionStore((s) => s.setSelectedManual);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  const nodes = useNodeTreeStore((s) => s.nodes);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const addNode = useNodeTreeStore((s) => s.addNode);
  const updateNode = useNodeTreeStore((s) => s.updateNode);
  const removeNode = useNodeTreeStore((s) => s.removeNode);
  const setTree = useNodeTreeStore((s) => s.setTree);

  const record = useHistoryStore((s) => s.recordSnapshot);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const meta = e.metaKey || e.ctrlKey;

      // DELETE / BACKSPACE
      if (key === "delete" || key === "backspace") {
        if (!selectedIds.length) return;
        record("before-delete");
        selectedIds.forEach((id) => removeNode(id));
        clearSelection();
        record("after-delete");
        e.preventDefault();
        return;
      }

      // DUPLICATE (Cmd/Ctrl + D)
      if (meta && key === "d") {
        if (!selectedIds.length) return;
        record("before-duplicate");
        let lastId = null;
        selectedIds.forEach((id) => {
          const node = nodes[id];
          if (!node) return;
          const cloneId = crypto.randomUUID();
          addNode({
            ...node,
            id: cloneId,
            x: node.x + 20,
            y: node.y + 20,
            name: (node.name || "Node") + " Copy",
            parent: null,
          });
          lastId = cloneId;
        });
        if (lastId) setSelected([lastId], true);
        record("after-duplicate");
        e.preventDefault();
        return;
      }

      // MOVE (arrows)
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        if (!selectedIds.length) return;
        const offset = e.shiftKey ? 10 : 1;
        record("before-move");
        selectedIds.forEach((id) => {
          const node = nodes[id];
          if (!node) return;
          const delta = { x: node.x, y: node.y };
          if (key === "arrowup") delta.y = node.y - offset;
          if (key === "arrowdown") delta.y = node.y + offset;
          if (key === "arrowleft") delta.x = node.x - offset;
          if (key === "arrowright") delta.x = node.x + offset;
          updateNode(id, delta);
        });
        record("after-move");
        e.preventDefault();
        return;
      }

      // GROUP (Cmd/Ctrl + G)
      if (meta && key === "g" && !e.shiftKey) {
        if (selectedIds.length > 1) {
          record("before-group");
          const result = createGroup(nodes, selectedIds);
          if (result?.groupId && result.updated) {
            setTree(result.updated, [
              ...new Set([
                ...rootIds.filter((r) => !selectedIds.includes(r)),
                result.groupId,
              ]),
            ]);
            setSelected([result.groupId], true);
            record("after-group");
          }
        }
        e.preventDefault();
        return;
      }

      // UNGROUP (Cmd/Ctrl + Shift + G)
      if (meta && e.shiftKey && key === "g") {
        if (!selectedIds.length) return;
        record("before-ungroup");
        let last = null;
        let updatedNodes = { ...nodes };
        selectedIds.forEach((id) => {
          const res = ungroup(updatedNodes, id);
          if (res.updated) {
            updatedNodes = res.updated;
            last = res.children?.[0] || last;
          }
        });
        setTree(updatedNodes, Object.values(updatedNodes)
          .filter((n) => !n.parent)
          .map((n) => n.id));
        if (last) setSelected([last], true);
        record("after-ungroup");
        e.preventDefault();
        return;
      }

      // UNDO (Cmd/Ctrl + Z)
      if (meta && key === "z" && !e.shiftKey) {
        undo();
        e.preventDefault();
        return;
      }

      // REDO (Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y)
      if ((meta && e.shiftKey && key === "z") || (meta && key === "y")) {
        redo();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, nodes, rootIds, addNode, updateNode, removeNode, setTree, clearSelection, setSelected, record, undo, redo]);

  return null;
}
