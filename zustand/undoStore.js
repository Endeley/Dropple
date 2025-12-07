"use client";

import { create } from "zustand";
import { useNodeTreeStore } from "./nodeTreeStore";
import { useTextEditStore } from "./textEditStore";
import { useComponentStore } from "./componentStore";
import { computeLayout } from "@/lib/text/layoutEngine";

let pendingEntry = null;

export const useUndoStore = create((set, get) => ({
  stack: [],
  pointer: -1,
  lastPushTime: 0,
  batching: false,
  startBatch: () => set({ batching: true }),
  endBatch: () => set({ batching: false }),
  push: (entry) => {
    const { stack, pointer, batching, lastPushTime } = get();
    const now = Date.now();
    const withinWindow = now - lastPushTime < 250;
    if (batching || withinWindow) {
      // replace current pointer entry
      const updated = [...stack];
      if (pointer >= 0) {
        updated[pointer] = entry;
        set({ stack: updated, lastPushTime: now });
        return;
      }
    }
    const newStack = stack.slice(0, pointer + 1);
    newStack.push(entry);
    set({ stack: newStack, pointer: pointer + 1, lastPushTime: now });
  },
  undo: () => {
    const { stack, pointer } = get();
    if (pointer < 0) return;
    const entry = stack[pointer];
    applySnapshot(entry);
    set({ pointer: pointer - 1 });
  },
  redo: () => {
    const { stack, pointer } = get();
    if (pointer >= stack.length - 1) return;
    const entry = stack[pointer + 1];
    applySnapshot(entry, true);
    set({ pointer: pointer + 1 });
  },
}));

export const captureBefore = (node, caretIndex, selectionStart, selectionEnd) => {
  pendingEntry = {
    nodeId: node.id,
    before: {
      spans: JSON.parse(JSON.stringify(node.spans || [])),
      caretIndex,
      selectionStart,
      selectionEnd,
      height: node.height,
    },
  };
};

export const captureAfterAndPush = (node, caretIndex, selectionStart, selectionEnd, type = "text-edit") => {
  if (!pendingEntry) return;
  pendingEntry.after = {
    spans: JSON.parse(JSON.stringify(node.spans || [])),
    caretIndex,
    selectionStart,
    selectionEnd,
    height: node.height,
  };
  pendingEntry.type = type;
  useUndoStore.getState().push(pendingEntry);
  pendingEntry = null;
};

const applySnapshot = (entry, useAfter = false) => {
  const snap = useAfter ? entry.after : entry.before;
  if (entry.kind === "text") {
    const nodeId = entry.nodeId;
    if (!nodeId) return;
    const updateNode = useNodeTreeStore.getState().updateNode;
    const node = useNodeTreeStore.getState().nodes[nodeId];
    if (!node) return;
    const layout = computeLayout(snap.spans || [], node.width || Infinity);
    updateNode(nodeId, { spans: snap.spans, height: layout.height });
    useTextEditStore.setState({
      caretIndex: snap.caretIndex,
      selectionStart: snap.selectionStart,
      selectionEnd: snap.selectionEnd,
    });
    return;
  }

  if (entry.kind === "tree") {
    const setTree = useNodeTreeStore.getState().setTree;
    setTree(snap.nodes || {}, snap.rootIds || []);
    if (snap.components) {
      useComponentStore.getState().setComponents(snap.components);
    }
  }
};
