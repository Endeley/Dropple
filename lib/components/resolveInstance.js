"use client";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const applyOverrides = (nodes, overrides = {}) => {
  Object.entries(overrides).forEach(([key, value]) => {
    const [nodeId, prop] = key.split(".");
    if (!nodes[nodeId]) return;
    nodes[nodeId] = { ...nodes[nodeId], [prop]: value };
  });
};

const cloneWithPrefix = (nodes, prefix) => {
  const map = {};
  Object.entries(nodes).forEach(([id, node]) => {
    map[`${prefix}${id}`] = { ...node, id: `${prefix}${id}` };
  });
  // remap children references
  Object.values(map).forEach((node) => {
    if (node.parent) node.parent = `${prefix}${node.parent}`;
    node.children = (node.children || []).map((cid) => `${prefix}${cid}`);
  });
  return map;
};

export function resolveInstance(component, instance, getComponent) {
  if (!component) return { nodes: {}, rootIds: [] };
  const baseNodes = deepClone(component.nodes || {});
  const rootIds = deepClone(component.rootIds || []);

  // Apply variant overrides
  const variant = (component.variants || []).find((v) => v.id === instance.variantId);
  if (variant?.overrides) applyOverrides(baseNodes, variant.overrides);

  // Apply instance overrides
  if (instance?.nodeOverrides) applyOverrides(baseNodes, instance.nodeOverrides);

  // Apply prop overrides (lightweight: map text overrides to ids provided in props map)
  if (instance?.propOverrides && component.props) {
    Object.entries(instance.propOverrides).forEach(([propKey, val]) => {
      const propDef = component.props[propKey];
      if (propDef?.targetId && baseNodes[propDef.targetId]) {
        baseNodes[propDef.targetId] = { ...baseNodes[propDef.targetId], [propDef.targetProp || "text"]: val };
      }
    });
  }

  // Resolve nested component instances inside the master tree
  if (getComponent) {
    Object.values(baseNodes).forEach((node) => {
      if (node.type === "component-instance" && node.componentId) {
        const nestedComp = getComponent(node.componentId);
        const nestedResolved = resolveInstance(nestedComp, node, getComponent);
        const prefix = `${node.id}_`;
        const prefixedNodes = cloneWithPrefix(nestedResolved.nodes, prefix);
        Object.assign(baseNodes, prefixedNodes);
        node.type = "group";
        node.children = nestedResolved.rootIds.map((rid) => `${prefix}${rid}`);
      }
    });
  }

  return { nodes: baseNodes, rootIds };
}

export function measureResolvedBounds(nodes, rootIds) {
  const ids = rootIds.length ? rootIds : Object.keys(nodes);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  ids.forEach((id) => walk(id));

  function walk(id) {
    const n = nodes[id];
    if (!n) return;
    minX = Math.min(minX, n.x || 0);
    minY = Math.min(minY, n.y || 0);
    maxX = Math.max(maxX, (n.x || 0) + (n.width || 0));
    maxY = Math.max(maxY, (n.y || 0) + (n.height || 0));
    (n.children || []).forEach(walk);
  }

  if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
