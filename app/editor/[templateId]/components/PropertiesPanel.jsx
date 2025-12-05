"use client";

import { useEditorStore } from "../hooks/useEditorStore";
import ColorPicker from "./ui/ColorPicker";
import { componentLibrary } from "./library";
import { useMemo } from "react";

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <label className="flex flex-col text-xs">
      {label}
      <input
        type="number"
        className="border px-2 py-1 rounded text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TextProperties({ node }) {
  const updateNode = useEditorStore((s) => s.updateNode);
  return (
    <Section title="Text">
      <label className="col-span-2 text-xs">
        Content
        <textarea
          className="border w-full p-2 rounded text-sm"
          rows={3}
          value={node.content}
          onChange={(e) => updateNode(node.id, { content: e.target.value })}
        />
      </label>
      <NumberInput
        label="Font Size"
        value={node.fontSize}
        onChange={(v) => updateNode(node.id, { fontSize: v })}
      />
      <label className="text-xs col-span-2">
        Color
        <ColorPicker value={node.color} onChange={(v) => updateNode(node.id, { color: v })} />
      </label>
    </Section>
  );
}

function ImageProperties({ node }) {
  const updateNode = useEditorStore((s) => s.updateNode);
  return (
    <Section title="Image">
      <label className="col-span-2 text-xs">
        Fit
        <select
          className="border p-1 w-full rounded text-sm"
          value={node.fit}
          onChange={(e) => updateNode(node.id, { fit: e.target.value })}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
        </select>
      </label>
      <NumberInput
        label="Opacity"
        value={node.opacity ?? 1}
        onChange={(v) => updateNode(node.id, { opacity: v })}
      />
    </Section>
  );
}

function ShapeProperties({ node }) {
  const updateNode = useEditorStore((s) => s.updateNode);
  return (
    <Section title="Shape">
      <label className="col-span-2 text-xs">
        Fill
        <ColorPicker value={node.fill} onChange={(v) => updateNode(node.id, { fill: v })} />
      </label>
      <label className="col-span-2 text-xs">
        Stroke
        <ColorPicker value={node.stroke} onChange={(v) => updateNode(node.id, { stroke: v })} />
      </label>
      <NumberInput
        label="Stroke Width"
        value={node.strokeWidth}
        onChange={(v) => updateNode(node.id, { strokeWidth: v })}
      />
      <NumberInput
        label="Corners"
        value={node.radius ?? 0}
        onChange={(v) => updateNode(node.id, { radius: v })}
      />
    </Section>
  );
}

function AutoLayoutProperties({ node }) {
  const updateNode = useEditorStore((s) => s.updateNode);
  const layout = node.layout || {};
  return (
    <Section title="Auto Layout">
      <label className="col-span-2 text-xs">
        Direction
        <select
          value={layout.direction}
          className="border rounded p-1 w-full"
          onChange={(e) => updateNode(node.id, { layout: { ...layout, direction: e.target.value } })}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
      </label>

      <NumberInput
        label="Gap"
        value={layout.gap ?? 0}
        onChange={(v) => updateNode(node.id, { layout: { ...layout, gap: v } })}
      />

      <NumberInput
        label="Padding"
        value={layout.padding ?? 0}
        onChange={(v) => updateNode(node.id, { layout: { ...layout, padding: v } })}
      />

      <label className="col-span-2 text-xs">
        Alignment
        <select
          value={layout.alignment}
          className="border rounded p-1 w-full"
          onChange={(e) => updateNode(node.id, { layout: { ...layout, alignment: e.target.value } })}
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
          <option value="stretch">Stretch</option>
        </select>
      </label>
    </Section>
  );
}

function ComponentNodeProperties({ node }) {
  const updateNode = useEditorStore((s) => s.updateNode);
  const overrides = node.overrides || {};
  const comp = componentLibrary.find((c) => c.id === node.componentId);
  return (
    <>
      {comp && comp.variants && (
        <Section title="Variants">
          {Object.keys(comp.variants).map((key) => (
            <label key={key} className="col-span-2 text-xs">
              {key.toUpperCase()}
              <select
                className="border p-1 rounded w-full text-sm"
                value={node.variant?.[key] || comp.defaultVariant?.[key] || ""}
                onChange={(e) =>
                  updateNode(node.id, {
                    variant: {
                      ...(node.variant || {}),
                      [key]: e.target.value,
                    },
                  })
                }
              >
                {comp.variants[key].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </Section>
      )}

      <Section title="Overrides">
        {Object.keys(overrides).map((key) => (
          <label key={key} className="col-span-2 text-xs">
            {key}
            <input
              type="text"
              className="border p-1 rounded text-sm w-full"
              value={overrides[key]}
              onChange={(e) =>
                updateNode(node.id, {
                  overrides: { ...overrides, [key]: e.target.value },
                })
              }
            />
          </label>
        ))}
      </Section>
    </>
  );
}

function AnimationSection({ node }) {
  const addAnimation = useEditorStore((s) => s.addAnimation);
  const nodeId = node.id;
  const animations = useMemo(() => node.animations || [], [node.animations]);

  return (
    <Section title="Animations">
      <button
        className="col-span-2 px-3 py-1 bg-purple-600 text-white rounded"
        onClick={() =>
          addAnimation(nodeId, {
            id: `${Date.now()}`,
            property: "opacity",
            from: 0,
            to: 1,
            duration: 500,
            delay: 0,
            easing: "ease-in-out",
          })
        }
      >
        + Add Animation
      </button>

      {animations.map((anim) => (
        <AnimationEditor key={anim.id} anim={anim} node={node} />
      ))}
    </Section>
  );
}

function AnimationEditor({ anim, node }) {
  const updateAnimation = useEditorStore((s) => s.updateAnimation);
  const deleteAnimation = useEditorStore((s) => s.deleteAnimation);

  return (
    <div className="border p-2 rounded col-span-2 space-y-2 bg-gray-50">
      <select
        className="border rounded w-full p-1 text-sm"
        value={anim.property}
        onChange={(e) => updateAnimation(node.id, anim.id, { property: e.target.value })}
      >
        <option value="opacity">Opacity</option>
        <option value="x">Move X</option>
        <option value="y">Move Y</option>
        <option value="scale">Scale</option>
        <option value="rotate">Rotate</option>
      </select>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="From" value={anim.from} onChange={(v) => updateAnimation(node.id, anim.id, { from: v })} />
        <NumberInput label="To" value={anim.to} onChange={(v) => updateAnimation(node.id, anim.id, { to: v })} />
      </div>

      <NumberInput
        label="Duration (ms)"
        value={anim.duration}
        onChange={(v) => updateAnimation(node.id, anim.id, { duration: v })}
      />

      <NumberInput
        label="Delay (ms)"
        value={anim.delay}
        onChange={(v) => updateAnimation(node.id, anim.id, { delay: v })}
      />

      <select
        className="border rounded w-full p-1 text-sm"
        value={anim.easing}
        onChange={(e) => updateAnimation(node.id, anim.id, { easing: e.target.value })}
      >
        <option value="ease-in-out">Ease In Out</option>
        <option value="ease-in">Ease In</option>
        <option value="ease-out">Ease Out</option>
        <option value="linear">Linear</option>
      </select>

      <button onClick={() => deleteAnimation(node.id, anim.id)} className="text-red-600 text-xs">
        Delete Animation
      </button>
    </div>
  );
}

export default function PropertiesPanel() {
  const nodes = useEditorStore((s) => s.nodes);
  const selected = useEditorStore((s) => s.selectedNodeIds);
  const updateNode = useEditorStore((s) => s.updateNode);

  if (selected.length !== 1) {
    return (
      <div className="w-80 bg-white border-l p-4 text-gray-500">Select a layer to edit its properties</div>
    );
  }

  const node = nodes.find((n) => n.id === selected[0]);
  if (!node) {
    return (
      <div className="w-80 bg-white border-l p-4 text-gray-500">Select a layer to edit its properties</div>
    );
  }

  return (
    <div className="w-80 bg-white border-l p-4 space-y-6 overflow-y-auto">
      <Section title="Transform">
        <NumberInput label="X" value={node.x} onChange={(v) => updateNode(node.id, { x: v })} />
        <NumberInput label="Y" value={node.y} onChange={(v) => updateNode(node.id, { y: v })} />
        <NumberInput label="Width" value={node.width} onChange={(v) => updateNode(node.id, { width: v })} />
        <NumberInput
          label="Height"
          value={node.height}
          onChange={(v) => updateNode(node.id, { height: v })}
        />
        <NumberInput
          label="Rotation"
          value={node.rotation || 0}
          onChange={(v) => updateNode(node.id, { rotation: v })}
        />
      </Section>

      {node.type === "text" && <TextProperties node={node} />}
      {node.type === "image" && <ImageProperties node={node} />}
      {node.type === "shape" && <ShapeProperties node={node} />}
      {node.type === "frame" && <AutoLayoutProperties node={node} />}
      {node.type === "component-node" && <ComponentNodeProperties node={node} />}
      <AnimationSection node={node} />
    </div>
  );
}
