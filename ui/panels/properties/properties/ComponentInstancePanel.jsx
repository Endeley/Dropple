"use client";

import { useState } from "react";
import { useComponentStore } from "@/runtime/stores/componentStore";
import { useNodeTreeStore } from "@/runtime/stores/nodeTreeStore";
import { useSelectionStore } from "@/runtime/stores/selectionStore";
import { useUndoStore } from "@/runtime/stores/undoStore";

const inputClass =
  "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";
const pillButton = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
    active
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
  }`;

export function ComponentInstancePanel({ node }) {
  const comp = useComponentStore((s) => s.components[node.componentId]);
  const addNode = useNodeTreeStore((s) => s.addNode);
  const removeNode = useNodeTreeStore((s) => s.removeNode);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const nodes = useNodeTreeStore((s) => s.nodes);
  const updateNode = useNodeTreeStore((s) => s.updateNode);
  const pushHistory = useUndoStore((s) => s.push);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const components = useComponentStore((s) => s.components);
  const editingSession = useComponentStore((s) => s.editingSession);
  const setEditingSession = useComponentStore((s) => s.setEditingSession);
  const [overrideTarget, setOverrideTarget] = useState("");
  const [overrideProp, setOverrideProp] = useState("text");
  const [overrideValue, setOverrideValue] = useState("");
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropType, setNewPropType] = useState("string");
  const [newPropDefault, setNewPropDefault] = useState("");
  const [newPropTarget, setNewPropTarget] = useState("");
  const [newPropTargetProp, setNewPropTargetProp] = useState("text");

  const buildSnapshot = () => ({
    nodes: JSON.parse(JSON.stringify(useNodeTreeStore.getState().nodes)),
    rootIds: [...useNodeTreeStore.getState().rootIds],
    components: JSON.parse(JSON.stringify(useComponentStore.getState().components)),
  });

  const pushTreeSnapshot = (before) => {
    const after = buildSnapshot();
    pushHistory({ kind: "tree", before, after });
  };

  const parseValuesInput = (valueStr = "") => {
    const result = {};
    valueStr
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [k, v] = pair.split("=").map((p) => p.trim());
        if (k && v !== undefined) result[k] = v;
      });
    return result;
  };

  const formatValuesInput = (values = {}) =>
    Object.entries(values || {})
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");

  if (!comp) {
    return <div className="text-xs text-neutral-500">Component not found.</div>;
  }

  const variants = comp.variants || [];
  const props = comp.props || {};
  const allComponents = Object.values(components || {});
  const componentNodes = comp.nodes || {};

  const setVariant = (variantId) => {
    const before = buildSnapshot();
    updateNode(node.id, { variantId });
    pushTreeSnapshot(before);
  };

  const setPropOverride = (key, value) => {
    const before = buildSnapshot();
    updateNode(node.id, {
      propOverrides: { ...(node.propOverrides || {}), [key]: value },
    });
    pushTreeSnapshot(before);
  };

  const resetOverrides = () => {
    const before = buildSnapshot();
    updateNode(node.id, { propOverrides: {}, nodeOverrides: {} });
    pushTreeSnapshot(before);
  };

  const setNodeOverride = (targetId, prop, value) => {
    if (!targetId || !prop) return;
    const before = buildSnapshot();
    updateNode(node.id, {
      nodeOverrides: { ...(node.nodeOverrides || {}), [`${targetId}.${prop}`]: value },
    });
    pushTreeSnapshot(before);
  };

  const resetNodeOverride = (key) => {
    if (!key) return;
    const before = buildSnapshot();
    const nextOverrides = { ...(node.nodeOverrides || {}) };
    delete nextOverrides[key];
    updateNode(node.id, { nodeOverrides: nextOverrides });
    pushTreeSnapshot(before);
  };

  const coerceValue = (value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    const num = Number(value);
    if (!Number.isNaN(num) && value !== "") return num;
    return value;
  };

  const updateVariantMeta = (variantId, updates) => {
    const before = buildSnapshot();
    useComponentStore.getState().updateVariant(comp.id, variantId, updates);
    pushTreeSnapshot(before);
  };

  const updatePropsSchema = (nextProps) => {
    const before = buildSnapshot();
    useComponentStore.getState().updateComponent(comp.id, { props: nextProps });
    pushTreeSnapshot(before);
  };

  const updatePropField = (propKey, field, value) => {
    const nextProps = { ...(comp.props || {}) };
    nextProps[propKey] = { ...(nextProps[propKey] || {}), [field]: value };
    updatePropsSchema(nextProps);
  };

  const removePropFromSchema = (key) => {
    const next = { ...(comp.props || {}) };
    delete next[key];
    updatePropsSchema(next);
  };

  const detachInstance = () => {
    if (!comp) return;
    const before = buildSnapshot();
    const masterNodes = comp.nodes || {};
    const rootIds = comp.rootIds || [];
    const idMap = new Map();

    const cloneNode = (nid, parentId = null) => {
      const master = masterNodes[nid];
      if (!master) return;
      const newId = crypto.randomUUID();
      idMap.set(nid, newId);
      addNode(
        {
          ...master,
          id: newId,
          parent: parentId,
          children: [],
        },
        parentId,
      );
      (master.children || []).forEach((childId) => cloneNode(childId, newId));
    };

    rootIds.forEach((rid) => cloneNode(rid, null));
    removeNode(node.id);
    setSelectedManual(rootIds.map((rid) => idMap.get(rid)).filter(Boolean));
    pushTreeSnapshot(before);
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Component</div>
        <div className="text-sm font-semibold text-neutral-900">{comp.name || comp.id}</div>
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <button className={pillButton(false)} onClick={resetOverrides}>
            Reset Overrides
          </button>
          <button className={pillButton(false)} onClick={detachInstance}>
            Detach
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.08em] text-neutral-500">Swap</span>
            <select
              className="border border-neutral-200 rounded-md text-xs px-2 py-1"
              value={node.componentId}
              onChange={(e) => {
                const nextId = e.target.value;
                const before = buildSnapshot();
                updateNode(node.id, { componentId: nextId, variantId: null, propOverrides: {}, nodeOverrides: {} });
                pushTreeSnapshot(before);
              }}
            >
              {allComponents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>
          </div>
          {editingSession?.componentId === comp.id ? (
            <>
              <button
                className={pillButton(true)}
                onClick={() => {
                  const before = buildSnapshot();
                  const compRoots = editingSession.rootIds || [];
                  const collected = {};
                  const walk = (nid) => {
                    const n = useNodeTreeStore.getState().nodes[nid];
                    if (!n) return;
                    collected[nid] = { ...n };
                    (n.children || []).forEach(walk);
                  };
                  compRoots.forEach(walk);
                  useComponentStore.getState().updateComponent(comp.id, {
                    nodes: collected,
                    rootIds: compRoots,
                  });
                  useNodeTreeStore.getState().removeSubtree(compRoots);
                  setEditingSession(null);
                  setSelectedManual([node.id]);
                  pushTreeSnapshot(before);
                }}
              >
                Save Master
              </button>
              <button
                className={pillButton(false)}
                onClick={() => {
                  const compRoots = editingSession.rootIds || [];
                  const before = buildSnapshot();
                  useNodeTreeStore.getState().removeSubtree(compRoots);
                  setEditingSession(null);
                  setSelectedManual([node.id]);
                  pushTreeSnapshot(before);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className={pillButton(false)}
              onClick={() => {
                if (editingSession && editingSession.componentId && editingSession.componentId !== comp.id) {
                  alert("Finish the current master edit session before editing another component.");
                  return;
                }
                const before = buildSnapshot();
                const masterNodes = comp.nodes || {};
                const compRoots = comp.rootIds || [];
                useNodeTreeStore.getState().insertSubtree(masterNodes, compRoots);
                setEditingSession({ componentId: comp.id, rootIds: [...compRoots], instanceId: node.id, sessionId: crypto.randomUUID() });
                setSelectedManual([...compRoots]);
                pushTreeSnapshot(before);
              }}
            >
              Edit Master
            </button>
          )}
        </div>
      </div>

      {variants.length > 0 && (
        <>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Variant</div>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  className={pillButton(node.variantId === v.id)}
                  onClick={() => setVariant(v.id)}
                >
                  {v.name || v.id}
                </button>
              ))}
            </div>
            <button
              className={pillButton(false)}
              onClick={() => {
                const newVar = {
                  id: "variant_" + crypto.randomUUID(),
                  name: "Variant " + (variants.length + 1),
                  values: {},
                  overrides: {},
                };
                const before = buildSnapshot();
                useComponentStore.getState().addVariant(comp.id, newVar);
                pushTreeSnapshot(before);
              }}
            >
              + Add Variant
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v) => (
              <div key={`${v.id}-meta`} className="rounded-md border border-neutral-200 bg-white px-3 py-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    defaultValue={v.name || ""}
                    onBlur={(e) => updateVariantMeta(v.id, { name: e.target.value })}
                    placeholder="Variant name"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 font-semibold uppercase tracking-[0.06em]">Dimensions</div>
                  <input
                    className={inputClass}
                    defaultValue={formatValuesInput(v.values || {})}
                    onBlur={(e) => updateVariantMeta(v.id, { values: parseValuesInput(e.target.value) })}
                    placeholder="type=primary, state=default"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {Object.keys(props).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Props</div>
          <div className="space-y-2">
            {Object.entries(props).map(([key, def]) => (
              <div key={key} className="space-y-1">
                <div className="text-xs text-neutral-600">{key}</div>
                <input
                  className={inputClass}
                  defaultValue={node.propOverrides?.[key] ?? def.default ?? ""}
                  onBlur={(e) => setPropOverride(key, e.target.value)}
                  placeholder={def.type || "string"}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Node Overrides</div>
        <div className="space-y-2">
          {Object.entries(node.nodeOverrides || {}).length === 0 && (
            <div className="text-xs text-neutral-500">No overrides yet.</div>
          )}
          {Object.entries(node.nodeOverrides || {}).map(([key, val]) => {
            const [targetId, prop] = key.split(".");
            const targetName = componentNodes[targetId]?.name || targetId;
            return (
              <div key={key} className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-800">
                    {targetName} · {prop}
                  </span>
                  <span className="text-xs text-neutral-500 break-all">{String(val)}</span>
                </div>
                <button className={pillButton(false)} onClick={() => resetNodeOverride(key)}>
                  Reset
                </button>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="col-span-2 border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-700"
            value={overrideTarget}
            onChange={(e) => setOverrideTarget(e.target.value)}
          >
            <option value="">Select node…</option>
            {Object.values(componentNodes).map((n) => (
              <option key={n.id} value={n.id}>
                {n.name || n.id}
              </option>
            ))}
          </select>
          <select
            className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-700"
            value={overrideProp}
            onChange={(e) => setOverrideProp(e.target.value)}
          >
            <option value="text">text</option>
            <option value="fill">fill</option>
            <option value="stroke">stroke</option>
            <option value="opacity">opacity</option>
            <option value="hidden">hidden</option>
            <option value="src">image src</option>
            <option value="width">width</option>
            <option value="height">height</option>
            <option value="x">x</option>
            <option value="y">y</option>
            <option value="rotation">rotation</option>
            <option value="strokeWidth">stroke width</option>
            <option value="fontSize">font size</option>
          </select>
          <input
            className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
            value={overrideValue}
            onChange={(e) => setOverrideValue(e.target.value)}
            placeholder="Override value"
          />
          <button
            className="col-span-2 px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 transition"
            onClick={() => {
              setNodeOverride(overrideTarget, overrideProp, coerceValue(overrideValue));
              setOverrideValue("");
            }}
          >
            Apply Override
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Component Props Schema</div>
        <div className="space-y-2">
          {Object.entries(props).length === 0 && <div className="text-xs text-neutral-500">No props defined.</div>}
          {Object.entries(props).map(([key, def]) => (
            <div key={`${key}-schema`} className="rounded-md border border-neutral-200 bg-white px-3 py-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-800">{key}</div>
                <button className={pillButton(false)} onClick={() => removePropFromSchema(key)}>
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-700"
                  value={def.type || "string"}
                  onChange={(e) => updatePropField(key, "type", e.target.value)}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="color">color</option>
                  <option value="image">image</option>
                </select>
                <input
                  className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
                  defaultValue={def.default ?? ""}
                  onBlur={(e) => updatePropField(key, "default", e.target.value)}
                  placeholder="Default"
                />
                <input
                  className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
                  defaultValue={def.targetId || ""}
                  onBlur={(e) => updatePropField(key, "targetId", e.target.value)}
                  placeholder="Target node id"
                />
                <input
                  className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
                  defaultValue={def.targetProp || "text"}
                  onBlur={(e) => updatePropField(key, "targetProp", e.target.value)}
                  placeholder="Target prop (text/fill/...)"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3 space-y-2">
          <div className="text-xs font-semibold text-neutral-700">Add Prop</div>
          <input
            className={inputClass}
            value={newPropKey}
            onChange={(e) => setNewPropKey(e.target.value)}
            placeholder="propKey (e.g. label)"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-700"
              value={newPropType}
              onChange={(e) => setNewPropType(e.target.value)}
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="color">color</option>
              <option value="image">image</option>
            </select>
            <input
              className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
              value={newPropDefault}
              onChange={(e) => setNewPropDefault(e.target.value)}
              placeholder="Default value"
            />
            <input
              className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
              value={newPropTarget}
              onChange={(e) => setNewPropTarget(e.target.value)}
              placeholder="Target node id (optional)"
            />
            <input
              className="border border-neutral-200 rounded-md px-2 py-2 text-sm text-neutral-800"
              value={newPropTargetProp}
              onChange={(e) => setNewPropTargetProp(e.target.value)}
              placeholder="Target prop (text/fill/...)"
            />
          </div>
          <button
            className="w-full px-3 py-2 rounded-md bg-violet-500 text-white text-sm font-semibold shadow-sm hover:bg-violet-600 transition"
            onClick={() => {
              if (!newPropKey.trim()) return;
              const next = { ...(comp.props || {}) };
              next[newPropKey.trim()] = {
                type: newPropType,
                default: newPropDefault,
                targetId: newPropTarget || undefined,
                targetProp: newPropTargetProp || "text",
              };
              updatePropsSchema(next);
              setNewPropKey("");
              setNewPropDefault("");
              setNewPropTarget("");
              setNewPropTargetProp("text");
            }}
          >
            Add Prop
          </button>
        </div>
      </div>
    </div>
  );
}
