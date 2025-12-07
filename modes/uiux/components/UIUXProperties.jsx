"use client";

import { useMemo } from "react";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500";
const inputClass =
  "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";
const miniButton =
  "px-2 py-1 rounded-md border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-violet-200 hover:bg-violet-50 transition";
const pillButton = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
    active
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
  }`;

const Section = ({ title, children, description }) => (
  <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">{title}</div>
        {description ? <div className="text-[11px] text-neutral-500">{description}</div> : null}
      </div>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

export default function UIUXProperties() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const nodes = useNodeTreeStore((s) => s.nodes);

  const selection = useMemo(() => {
    if (!selectedIds.length) return null;
    const node = nodes[selectedIds[0]];
    if (!node) return null;
    return node;
  }, [selectedIds, nodes]);

  const selectionType = !selection
    ? "Nothing Selected"
    : selection.type === "text"
      ? "Text"
      : selection.type === "image"
        ? "Image"
        : selection.type === "frame"
          ? "Frame"
          : selection.type === "component"
            ? "Component"
            : "Layer";

  const isText = selection?.type === "text";
  const isImage = selection?.type === "image";
  const isFrame = selection?.type === "frame";
  const isVector = ["line", "polygon", "pen", "pencil"].includes(selection?.type);
  const isComponent = selection?.type === "component";

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-800">Properties</h2>
        <p className="text-xs text-neutral-500">Adaptive inspector for the selected layer or tool.</p>
      </div>

      <Section title="Selection">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-neutral-900">{selectionType}</div>
            <span className="text-xs text-neutral-500">{selectedIds.length ? `${selectedIds.length} selected` : ""}</span>
          </div>
          <input
            className={inputClass}
            placeholder={selection?.name || "Layer name"}
            defaultValue={selection?.name}
          />
        </div>
        {!selection ? (
          <div className="rounded-md bg-neutral-50 border border-dashed border-neutral-200 px-3 py-2 text-xs text-neutral-500">
            Select a frame, shape, or text layer to edit its properties.
          </div>
        ) : null}
      </Section>

      <Section title="Position & Size">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={labelClass}>X</div>
            <input className={inputClass} placeholder="0" />
          </div>
          <div>
            <div className={labelClass}>Y</div>
            <input className={inputClass} placeholder="0" />
          </div>
          <div>
            <div className={labelClass}>Width</div>
            <input className={inputClass} placeholder="1440" />
          </div>
          <div>
            <div className={labelClass}>Height</div>
            <input className={inputClass} placeholder="900" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className={labelClass}>Rotation</div>
            <input className={inputClass} placeholder="0°" />
          </div>
          <button className={miniButton}>Flip H</button>
          <button className={miniButton}>Flip V</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className={pillButton(false)}>Fixed</button>
          <button className={pillButton(false)}>Lock Aspect</button>
        </div>
      </Section>

      <Section title="Layout & Constraints">
        <div className="grid grid-cols-2 gap-2">
          <button className={pillButton(false)}>Auto Layout</button>
          <select className={inputClass}>
            <option>Constraints</option>
            <option>Left</option>
            <option>Center</option>
            <option>Right</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass}>
            <option>Direction</option>
            <option>Horizontal</option>
            <option>Vertical</option>
          </select>
          <select className={inputClass}>
            <option>Alignment</option>
            <option>Start</option>
            <option>Center</option>
            <option>End</option>
            <option>Space Between</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputClass} placeholder="Spacing" />
          <input className={inputClass} placeholder="Padding" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button className={pillButton(false)}>Hug</button>
          <button className={pillButton(false)}>Fill</button>
          <button className={pillButton(false)}>Fixed</button>
        </div>
      </Section>

      <Section title="Appearance">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={labelClass}>Fill</div>
            <input className={inputClass} placeholder="Solid / Gradient" />
          </div>
          <div>
            <div className={labelClass}>Stroke</div>
            <input className={inputClass} placeholder="Color / Width" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={labelClass}>Effects</div>
            <input className={inputClass} placeholder="Shadow / Blur" />
          </div>
          <div>
            <div className={labelClass}>Blend Mode</div>
            <select className={inputClass}>
              <option>Normal</option>
              <option>Multiply</option>
              <option>Screen</option>
              <option>Overlay</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputClass} placeholder="Corner Radius" />
          <input className={inputClass} placeholder="Opacity %" />
        </div>
      </Section>

      {isText && (
        <Section title="Typography">
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Font Family" />
            <select className={inputClass}>
              <option>Weight</option>
              <option>400</option>
              <option>500</option>
              <option>600</option>
              <option>700</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input className={inputClass} placeholder="Size" />
            <input className={inputClass} placeholder="Line Height" />
            <input className={inputClass} placeholder="Letter Spacing" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass}>
              <option>Align Left</option>
              <option>Center</option>
              <option>Right</option>
              <option>Justify</option>
            </select>
            <select className={inputClass}>
              <option>Auto width</option>
              <option>Auto height</option>
              <option>Fixed</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className={pillButton(false)}>H1</button>
            <button className={pillButton(false)}>Body</button>
            <button className={pillButton(false)}>Caption</button>
          </div>
        </Section>
      )}

      {isImage && (
        <Section title="Image">
          <div className="grid grid-cols-2 gap-2">
            <button className={miniButton}>Replace…</button>
            <select className={inputClass}>
              <option>Fit</option>
              <option>Fill</option>
              <option>Crop</option>
              <option>Stretch</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Border Radius" />
            <input className={inputClass} placeholder="Mask Options" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input className={inputClass} placeholder="Brightness" />
            <input className={inputClass} placeholder="Contrast" />
            <input className={inputClass} placeholder="Saturation" />
          </div>
        </Section>
      )}

      {isVector && (
        <Section title="Vector">
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass}>
              <option>Stroke Cap</option>
              <option>Butt</option>
              <option>Round</option>
              <option>Square</option>
            </select>
            <select className={inputClass}>
              <option>Stroke Join</option>
              <option>Miter</option>
              <option>Bevel</option>
              <option>Round</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Arrowheads" />
            <input className={inputClass} placeholder="Boolean" />
          </div>
        </Section>
      )}

      {isFrame && (
        <Section title="Frame">
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass}>
              <option>Preset</option>
              <option>Desktop</option>
              <option>Tablet</option>
              <option>Mobile</option>
            </select>
            <select className={inputClass}>
              <option>Orientation</option>
              <option>Portrait</option>
              <option>Landscape</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Frame Background" />
            <input className={inputClass} placeholder="Layout Grid" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className={pillButton(false)}>Mark as Start</button>
            <input className={inputClass} placeholder="Flow Name" />
          </div>
        </Section>
      )}

      {isComponent && (
        <Section title="Component">
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Variant" />
            <button className={miniButton}>Swap</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className={miniButton}>Overrides</button>
            <button className={miniButton}>Reset</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className={miniButton}>Go to Main</button>
            <button className={miniButton}>Detach</button>
          </div>
        </Section>
      )}

      <Section title="Prototype & Interaction">
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass}>
            <option>On Click</option>
            <option>Hover</option>
            <option>Press</option>
            <option>Drag</option>
            <option>After Delay</option>
          </select>
          <select className={inputClass}>
            <option>Action</option>
            <option>Navigate to Frame</option>
            <option>Open Overlay</option>
            <option>Scroll To</option>
            <option>Run Animation</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className={inputClass}>
            <option>Transition</option>
            <option>Instant</option>
            <option>Dissolve</option>
            <option>Move</option>
            <option>Slide</option>
            <option>Smart Animate</option>
          </select>
          <input className={inputClass} placeholder="Duration (ms)" />
        </div>
      </Section>

      <Section title="AI Assist">
        <div className="grid grid-cols-2 gap-2">
          <button className={pillButton(false)}>Magic Insert</button>
          <button className={pillButton(false)}>Magic Replace</button>
          <button className={pillButton(false)}>Auto Responsive</button>
          <button className={pillButton(false)}>Style Transfer</button>
          <button className={pillButton(false)}>Content Fill</button>
          <button className={pillButton(false)}>Layout Fixer</button>
          <button className={pillButton(false)}>Instant Component</button>
        </div>
      </Section>
    </div>
  );
}
