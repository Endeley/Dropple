const cloneSnapshot = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const createHistoryStack = ({ limit = 100, initial = null } = {}) => {
  let past = [];
  let future = [];
  let present = initial ? { state: cloneSnapshot(initial), label: "init" } : null;

  const push = (state, label = "") => {
    if (present) past = [...past, present];
    present = { state: cloneSnapshot(state), label };
    if (past.length > limit) {
      past = past.slice(past.length - limit);
    }
    future = [];
    return present.state;
  };

  const undo = () => {
    if (!past.length) return present?.state ?? null;
    const prev = past[past.length - 1];
    past = past.slice(0, -1);
    if (present) future = [present, ...future];
    present = prev;
    return present.state;
  };

  const redo = () => {
    if (!future.length) return present?.state ?? null;
    const next = future[0];
    future = future.slice(1);
    if (present) past = [...past, present];
    present = next;
    return present.state;
  };

  const clear = () => {
    past = [];
    future = [];
    present = null;
  };

  return {
    push,
    undo,
    redo,
    clear,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    getCurrent: () => present?.state ?? null,
    getMeta: () => present?.label ?? null,
    setLimit: (next) => {
      limit = next;
      if (past.length > limit) {
        past = past.slice(past.length - limit);
      }
    },
  };
};
