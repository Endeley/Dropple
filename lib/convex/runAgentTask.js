import * as Agents from "../agents/roles";
import { MessageBus } from "../messageBus/messageBus";

export async function runAgentTask(task) {
  const bus = new MessageBus();
  const agentName = camel(task?.agent || "");
  const agentFn =
    Agents[agentName] ||
    Agents[pascal(agentName)] ||
    (task?.agent ? Agents[task.agent] : null);

  if (!agentFn) {
    throw new Error(`Agent not found: ${task?.agent}`);
  }

  const initialState = task?.state || {};
  const result = await agentFn(initialState, bus);

  const mergedState = applyWorkspaceUpdate(initialState, result?.workspaceUpdate);

  if (result?.liveEdits && Array.isArray(result.liveEdits)) {
    for (const edit of result.liveEdits) {
      applyLiveEdit(mergedState, edit);
    }
  }

  const busMessages =
    typeof bus.getMessages === "function"
      ? bus.getMessages()
      : typeof bus.getAll === "function"
        ? bus.getAll()
        : [];

  return {
    agent: task?.agent,
    output: result,
    messages: busMessages,
    state: mergedState,
  };
}

function camel(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

function pascal(name = "") {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function applyWorkspaceUpdate(state, update) {
  if (!update) return state;
  const next = { ...state };
  if (update.workspace) {
    next.workspace = { ...(next.workspace || {}), ...update.workspace };
  }
  if (update.updateLayer && next.workspace?.pages) {
    const { id, updates } = update.updateLayer;
    next.workspace = applyLayerUpdate(next.workspace, id, updates || {});
  }
  return next;
}

function applyLayerUpdate(ws, id, updates) {
  if (!ws?.pages) return ws;

  function walk(nodes = []) {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: walk(node.children) };
      }
      return node;
    });
  }

  return {
    ...ws,
    pages: ws.pages.map((p) => ({
      ...p,
      layers: p.layers ? walk(p.layers) : [],
    })),
  };
}

function applyLiveEdit(state, edit) {
  if (!edit || !state?.workspace) return;
  const { action, layerId, x, y, width, height, property, value } = edit;
  if (action === "move") {
    state.workspace = applyLayerUpdate(state.workspace, layerId, { x, y });
  } else if (action === "resize") {
    state.workspace = applyLayerUpdate(state.workspace, layerId, { width, height });
  } else if (action === "change" && property) {
    state.workspace = applyLayerUpdate(state.workspace, layerId, { [property]: value });
  }
}
