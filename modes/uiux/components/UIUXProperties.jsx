"use client";

import { useMemo } from "react";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { Section } from "@/components/properties/Section";
import { useTextEditStore } from "@/zustand/textEditStore";
import { SpanTypographyPanel } from "@/components/properties/typography/SpanTypographyPanel";
import { ComponentInstancePanel } from "@/components/properties/ComponentInstancePanel";
import { usePrototypeStore } from "@/zustand/prototypeStore";
import { usePageStore } from "@/zustand/pageStore";

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

const isVectorType = (type) => ["line", "polygon", "pen", "pencil", "path"].includes(type);
const finiteOrEmpty = (v, empty = "") => (Number.isFinite(v) ? v : empty);

export default function UIUXProperties() {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const nodes = useNodeTreeStore((s) => s.nodes);
  const updateNode = useNodeTreeStore((s) => s.updateNode);
  const textEditingId = useTextEditStore((s) => s.editingId);
  const selectionStart = useTextEditStore((s) => s.selectionStart);
  const selectionEnd = useTextEditStore((s) => s.selectionEnd);
  const setPendingStyle = useTextEditStore((s) => s.setPendingStyle);
  const currentBreakpointId = usePageStore((s) => s.currentBreakpointId);

  const selection = useMemo(() => {
    if (!selectedIds.length) return null;
    return nodes[selectedIds[0]] || null;
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

  const isText = selection?.type === "text" || selection?.type === "richtext";
  const isImage = selection?.type === "image";
  const isFrame = selection?.type === "frame";
  const isVector = isVectorType(selection?.type);
  const isComponentInstance = selection?.type === "component-instance";
  const layout = selection?.layout || {};
  const constraints = selection?.constraints || {};
  const responsive = selection?.responsive || {};
  const transform3d = selection?.transform3d || {};
  const triggerList = ["onClick", "onHover", "onPress"];
  const frames = useMemo(
    () => Object.values(nodes).filter((n) => n.type === "frame"),
    [nodes],
  );
  const hasTextSelection =
    selection?.type === "richtext" &&
    textEditingId === selection?.id &&
    selectionStart !== null &&
    selectionEnd !== null &&
    selectionStart !== selectionEnd;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-800">Properties</h2>
        <p className="text-xs text-neutral-500">Adaptive inspector for the selected layer or tool.</p>
      </div>

      <Section title="Selection" defaultOpen>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-neutral-900">{selectionType}</div>
            <span className="text-xs text-neutral-500">{selectedIds.length ? `${selectedIds.length} selected` : ""}</span>
          </div>
          <input
            className={inputClass}
            placeholder={selection?.name || "Layer name"}
            defaultValue={selection?.name}
            onBlur={(e) => selection && updateNode(selection.id, { name: e.target.value })}
          />
        </div>
        {!selection ? (
          <div className="rounded-md bg-neutral-50 border border-dashed border-neutral-200 px-3 py-2 text-xs text-neutral-500">
            Select a frame, shape, or text layer to edit its properties.
          </div>
        ) : null}
      </Section>

      <Section title="Position & Size" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={labelClass}>X</div>
          <input
            className={inputClass}
            placeholder="0"
            value={finiteOrEmpty(selection?.x)}
            onChange={(e) => selection && updateNode(selection.id, { x: parseFloat(e.target.value || "0") })}
          />
        </div>
        <div>
          <div className={labelClass}>Y</div>
          <input
            className={inputClass}
            placeholder="0"
            value={finiteOrEmpty(selection?.y)}
            onChange={(e) => selection && updateNode(selection.id, { y: parseFloat(e.target.value || "0") })}
          />
        </div>
        <div>
          <div className={labelClass}>Width</div>
          <input
            className={inputClass}
            placeholder="1440"
            value={finiteOrEmpty(selection?.width)}
            onChange={(e) => selection && updateNode(selection.id, { width: parseFloat(e.target.value || "0") })}
          />
        </div>
        <div>
          <div className={labelClass}>Height</div>
          <input
            className={inputClass}
            placeholder="900"
            value={finiteOrEmpty(selection?.height)}
            onChange={(e) => selection && updateNode(selection.id, { height: parseFloat(e.target.value || "0") })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className={labelClass}>Rotation</div>
          <input
            className={inputClass}
            placeholder="0°"
            value={finiteOrEmpty(selection?.rotation, 0)}
            onChange={(e) => selection && updateNode(selection.id, { rotation: parseFloat(e.target.value || "0") })}
          />
        </div>
        <button className={miniButton}>Flip H</button>
        <button className={miniButton}>Flip V</button>
      </div>
        {isFrame ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <div className={labelClass}>Aspect Ratio</div>
              <input
                className={inputClass}
                placeholder="e.g. 1.777"
                value={selection?.aspectRatio ?? ""}
                onChange={(e) =>
                  selection &&
                  updateNode(selection.id, {
                    aspectRatio: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
            </div>
            <div>
              <div className={labelClass}>Min Width</div>
              <input
                className={inputClass}
                placeholder="320"
                value={responsive?.minWidth ?? ""}
                onChange={(e) =>
                  selection &&
                  updateNode(selection.id, {
                    responsive: { ...(selection.responsive || {}), minWidth: parseFloat(e.target.value || "320") },
                  })
                }
              />
            </div>
            <div>
              <div className={labelClass}>Max Width</div>
              <input
                className={inputClass}
                placeholder="1920"
                value={responsive?.maxWidth ?? ""}
                onChange={(e) =>
                  selection &&
                  updateNode(selection.id, {
                    responsive: { ...(selection.responsive || {}), maxWidth: parseFloat(e.target.value || "1920") },
                  })
                }
              />
            </div>
          </div>
        ) : null}
        {isFrame ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className={labelClass}>Background Image</div>
              <input
                className={inputClass}
                placeholder="https://..."
                value={selection?.backgroundImage || ""}
                onChange={(e) => updateNode(selection.id, { backgroundImage: e.target.value })}
              />
            </div>
            <div>
              <div className={labelClass}>Background Fit</div>
              <select
                className={inputClass}
                value={selection?.backgroundSize || "cover"}
                onChange={(e) => updateNode(selection.id, { backgroundSize: e.target.value })}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        ) : null}
      </Section>

      {!isImage && selection ? (
        <Section title="Fill & Stroke" defaultOpen>
          <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={labelClass}>Fill</div>
            <input
              type="color"
              className="w-full h-10 border border-neutral-200 rounded-md"
              value={selection?.fill || "#ffffff"}
              onChange={(e) => updateNode(selection.id, { fill: e.target.value })}
            />
          </div>
          <div>
            <div className={labelClass}>Stroke</div>
            <input
              type="color"
              className="w-full h-10 border border-neutral-200 rounded-md"
              value={selection?.stroke || "#000000"}
              onChange={(e) => updateNode(selection.id, { stroke: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-2">
          <div className={labelClass}>Stroke Width</div>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.5"
            value={selection?.strokeWidth ?? 1}
            onChange={(e) => updateNode(selection.id, { strokeWidth: parseFloat(e.target.value || "0") })}
          />
        </div>
      </Section>
    ) : null}

      {isImage && selection ? (
        <Section title="Image" defaultOpen>
          <div className="space-y-2">
            <div>
              <div className={labelClass}>Image URL</div>
              <input
                className={inputClass}
                placeholder="https://..."
                value={selection?.src || selection?.url || ""}
                onChange={(e) => updateNode(selection.id, { src: e.target.value, url: e.target.value })}
              />
            </div>
            <div>
              <div className={labelClass}>Fit</div>
              <select
                className={inputClass}
                value={selection?.objectFit || "cover"}
                onChange={(e) => updateNode(selection.id, { objectFit: e.target.value })}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="scale-down">Scale Down</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={labelClass}>Opacity</div>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selection?.opacity ?? 1}
                  onChange={(e) => updateNode(selection.id, { opacity: parseFloat(e.target.value || "1") })}
                />
              </div>
              <div>
                <div className={labelClass}>Radius</div>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="2"
                  value={selection?.borderRadius ?? 0}
                  onChange={(e) => updateNode(selection.id, { borderRadius: parseFloat(e.target.value || "0") })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={labelClass}>Tint</div>
                <input
                  type="color"
                  className="w-full h-10 border border-neutral-200 rounded-md"
                  value={selection?.tint || "#ffffff"}
                  onChange={(e) => updateNode(selection.id, { tint: e.target.value })}
                />
              </div>
              <div>
                <div className={labelClass}>Blur</div>
                <input
                  className={inputClass}
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={selection?.blur || 0}
                  onChange={(e) => updateNode(selection.id, { blur: parseFloat(e.target.value || "0") })}
                />
                <div className="text-[11px] text-neutral-500">{selection?.blur || 0}px</div>
              </div>
            </div>
            <div>
              <div className={labelClass}>Replace Image</div>
              <input
                type="file"
                accept="image/*"
                className="w-full text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append("file", file);
                  fetch("/api/assets/upload", { method: "POST", body: form })
                    .then((res) => res.json().then((data) => ({ res, data })))
                    .then(({ res, data }) => {
                      if (res.ok && (data.url || data.fileUrl)) {
                        const url = data.url || data.fileUrl;
                        updateNode(selection.id, { src: url, url });
                      }
                    })
                    .catch((err) => console.warn("Upload failed", err));
                }}
              />
            </div>
          </div>
        </Section>
      ) : null}

      {isText && selection ? (
        <Section title="Text" defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className={labelClass}>Font Family</div>
              <input
                className={inputClass}
                value={selection?.fontFamily || "Inter"}
                onChange={(e) => {
                  if (textEditingId === selection.id) {
                    setPendingStyle({ fontFamily: e.target.value });
                  }
                  updateNode(selection.id, { fontFamily: e.target.value });
                }}
              />
            </div>
            <div>
              <div className={labelClass}>Font Size</div>
              <input
                className={inputClass}
                type="number"
                min="8"
                max="200"
                value={selection?.fontSize || 16}
                onChange={(e) => {
                  const val = parseFloat(e.target.value || "16");
                  if (textEditingId === selection.id) {
                    setPendingStyle({ fontSize: val });
                  }
                  updateNode(selection.id, { fontSize: val });
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <div className={labelClass}>Weight</div>
              <input
                className={inputClass}
                type="number"
                min="100"
                max="900"
                step="100"
                value={selection?.fontWeight || 400}
                onChange={(e) => {
                  const val = parseInt(e.target.value || "400", 10);
                  if (textEditingId === selection.id) {
                    setPendingStyle({ fontWeight: val });
                  }
                  updateNode(selection.id, { fontWeight: val });
                }}
              />
            </div>
            <div>
              <div className={labelClass}>Line Height</div>
              <input
                className={inputClass}
                type="number"
                min="0.5"
                max="3"
                step="0.05"
                value={selection?.lineHeight || 1.3}
                onChange={(e) => {
                  const val = parseFloat(e.target.value || "1.3");
                  if (textEditingId === selection.id) {
                    setPendingStyle({ lineHeight: val });
                  }
                  updateNode(selection.id, { lineHeight: val });
                }}
              />
            </div>
            <div>
              <div className={labelClass}>Letter Spacing</div>
              <input
                className={inputClass}
                type="number"
                step="0.5"
                value={selection?.letterSpacing || 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value || "0");
                  if (textEditingId === selection.id) {
                    setPendingStyle({ letterSpacing: val });
                  }
                  updateNode(selection.id, { letterSpacing: val });
                }}
              />
            </div>
          </div>
          <div className="mt-2">
            <div className={labelClass}>Color</div>
            <input
              type="color"
              className="w-full h-10 border border-neutral-200 rounded-md"
              value={selection?.fill || "#ffffff"}
              onChange={(e) => {
                if (textEditingId === selection.id) {
                  setPendingStyle({ color: e.target.value, fill: e.target.value });
                }
                updateNode(selection.id, { fill: e.target.value, color: e.target.value });
              }}
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {["left", "center", "right", "justify"].map((align) => (
              <button
                key={align}
                className={pillButton(selection?.textAlign === align)}
                onClick={() => {
                  if (textEditingId === selection.id) {
                    setPendingStyle({ textAlign: align });
                  }
                  updateNode(selection.id, { textAlign: align });
                }}
              >
                {align}
              </button>
            ))}
          </div>
        </Section>
      ) : null}

      {isVector && selection ? (
        <Section title="Vector" defaultOpen>
          {selection.type === "polygon" ? (
            <div className="mb-2">
              <div className={labelClass}>Sides</div>
              <input
                className={inputClass}
                type="number"
                min="3"
                step="1"
                value={selection?.sides ?? selection?.points?.length ?? 3}
                onChange={(e) =>
                  updateNode(selection.id, {
                    sides: parseInt(e.target.value || "3", 10),
                  })
                }
              />
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className={labelClass}>Stroke Cap</div>
              <select
                className={inputClass}
                value={selection?.strokeLinecap || "round"}
                onChange={(e) => updateNode(selection.id, { strokeLinecap: e.target.value })}
              >
                <option value="butt">Butt</option>
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div>
              <div className={labelClass}>Stroke Join</div>
              <select
                className={inputClass}
                value={selection?.strokeLinejoin || "round"}
                onChange={(e) => updateNode(selection.id, { strokeLinejoin: e.target.value })}
              >
                <option value="miter">Miter</option>
                <option value="round">Round</option>
                <option value="bevel">Bevel</option>
              </select>
            </div>
          </div>
          <div className="mt-2">
            <div className={labelClass}>Dash</div>
            <input
              className={inputClass}
              placeholder="e.g. 4 2"
              value={selection?.strokeDasharray || ""}
              onChange={(e) => updateNode(selection.id, { strokeDasharray: e.target.value })}
            />
          </div>
        </Section>
      ) : null}

      <Section title="Constraints & Layout" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={pillButton(layout.enabled)}
            onClick={() => selection && updateNode(selection.id, { layout: { ...(selection.layout || {}), enabled: !layout.enabled } })}
          >
            Auto Layout {layout.enabled ? "On" : "Off"}
          </button>
          {isFrame ? (
            <select
              className={inputClass}
              value={responsive?.mode || "fixed"}
              onChange={(e) =>
                selection &&
                updateNode(selection.id, {
                  responsive: { ...(selection.responsive || {}), mode: e.target.value },
                })
              }
            >
              <option value="fixed">Fixed</option>
              <option value="responsive">Responsive</option>
              <option value="fluid">Fluid</option>
              <option value="adaptive">Adaptive</option>
            </select>
          ) : (
            <select
              className={inputClass}
              value={constraints.horizontal || "left"}
              onChange={(e) =>
                selection && updateNode(selection.id, { constraints: { ...(constraints || {}), horizontal: e.target.value } })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="left-right">Left & Right</option>
              <option value="scale">Scale</option>
            </select>
          )}
        </div>
        {layout.enabled ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <select
              className={inputClass}
              value={layout.direction || "vertical"}
              onChange={(e) =>
                selection &&
                updateNode(selection.id, {
                  layout: { ...(selection.layout || {}), direction: e.target.value },
                })
              }
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
            <select
              className={inputClass}
              value={layout.directionByBreakpoint?.[currentBreakpointId] || layout.direction || "vertical"}
              onChange={(e) =>
                selection &&
                updateNode(selection.id, {
                  layout: {
                    ...(selection.layout || {}),
                    directionByBreakpoint: {
                      ...(selection.layout?.directionByBreakpoint || {}),
                      [currentBreakpointId]: e.target.value,
                    },
                  },
                })
              }
            >
              <option value="horizontal">Direction @ {currentBreakpointId}: Horizontal</option>
              <option value="vertical">Direction @ {currentBreakpointId}: Vertical</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={layout.wrap || false}
                onChange={(e) =>
                  selection &&
                  updateNode(selection.id, { layout: { ...(selection.layout || {}), wrap: e.target.checked } })
                }
              />
              <span className="text-neutral-700">Wrap children</span>
            </label>
            <div>
              <div className={labelClass}>Gap (px, %, or token:md)</div>
              <input
                className={inputClass}
                placeholder="8"
                defaultValue={layout.spacing}
                onBlur={(e) =>
                  selection &&
                  updateNode(selection.id, {
                    layout: { ...(selection.layout || {}), spacing: e.target.value || 0 },
                  })
                }
              />
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <select
            className={inputClass}
            value={constraints.vertical || "top"}
            onChange={(e) =>
              selection && updateNode(selection.id, { constraints: { ...(constraints || {}), vertical: e.target.value } })
            }
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
            <option value="top-bottom">Top & Bottom</option>
            <option value="scale">Scale</option>
          </select>
          <div />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className={inputClass}
            value={layout.direction || "vertical"}
            onChange={(e) =>
              selection &&
              updateNode(selection.id, { layout: { ...(selection.layout || {}), enabled: true, direction: e.target.value } })
            }
            disabled={!layout.enabled}
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
          <select
            className={inputClass}
            value={layout.alignment || "start"}
            onChange={(e) =>
              selection &&
              updateNode(selection.id, { layout: { ...(selection.layout || {}), enabled: true, alignment: e.target.value } })
            }
            disabled={!layout.enabled}
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputClass}
            placeholder="Spacing"
            value={layout.spacing ?? 8}
            onChange={(e) =>
              selection &&
              updateNode(selection.id, {
                layout: { ...(selection.layout || {}), enabled: true, spacing: parseInt(e.target.value || "0", 10) },
              })
            }
            disabled={!layout.enabled}
          />
          <div className="grid grid-cols-4 gap-1">
            {["top", "right", "bottom", "left"].map((side) => (
              <input
                key={side}
                className="w-full bg-white border border-neutral-200 rounded-md px-2 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition"
                placeholder={side[0].toUpperCase()}
                value={layout.padding?.[side] ?? 0}
                onChange={(e) =>
                  selection &&
                  updateNode(selection.id, {
                    layout: {
                      ...(selection.layout || {}),
                      enabled: true,
                      padding: {
                        ...(selection.layout?.padding || {}),
                        [side]: parseInt(e.target.value || "0", 10),
                      },
                    },
                  })
                }
                disabled={!layout.enabled}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={pillButton(layout.primaryAxisSizing === "hug")}
            onClick={() =>
              selection &&
              updateNode(selection.id, { layout: { ...(selection.layout || {}), enabled: true, primaryAxisSizing: "hug" } })
            }
            disabled={!layout.enabled}
          >
            Hug
          </button>
          <button
            className={pillButton(layout.primaryAxisSizing === "fill")}
            onClick={() =>
              selection &&
              updateNode(selection.id, { layout: { ...(selection.layout || {}), enabled: true, primaryAxisSizing: "fill" } })
            }
            disabled={!layout.enabled}
          >
            Fill
          </button>
          <button
            className={pillButton(layout.primaryAxisSizing === "fixed" || !layout.primaryAxisSizing)}
            onClick={() =>
              selection &&
              updateNode(selection.id, { layout: { ...(selection.layout || {}), enabled: true, primaryAxisSizing: "fixed" } })
            }
            disabled={!layout.enabled}
          >
            Fixed
          </button>
        </div>
      </Section>

      <Section title="Appearance" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className={labelClass}>Fill</div>
            <input
              className={inputClass}
              placeholder="Solid / Gradient"
              defaultValue={selection?.fill}
              onBlur={(e) => selection && updateNode(selection.id, { fill: e.target.value })}
            />
          </div>
          <div>
            <div className={labelClass}>Stroke</div>
            <input
              className={inputClass}
              placeholder="Color"
              defaultValue={selection?.stroke}
              onBlur={(e) => selection && updateNode(selection.id, { stroke: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputClass}
            placeholder="Stroke Width"
            defaultValue={selection?.strokeWidth}
            onBlur={(e) =>
              selection && updateNode(selection.id, { strokeWidth: parseFloat(e.target.value || "0") || 0 })
            }
          />
          <input
            className={inputClass}
            placeholder="Opacity %"
            defaultValue={selection?.opacity ? selection.opacity * 100 : 100}
            onBlur={(e) =>
              selection && updateNode(selection.id, { opacity: Math.max(0, Math.min(1, (parseFloat(e.target.value) || 100) / 100)) })
            }
          />
        </div>
      </Section>

      <Section title="3D Transform" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputClass}
            placeholder="Rotate X"
            defaultValue={transform3d.rotateX ?? 0}
            onBlur={(e) =>
              selection &&
              updateNode(selection.id, {
                transform3d: { ...transform3d, rotateX: parseFloat(e.target.value || "0") },
              })
            }
          />
          <input
            className={inputClass}
            placeholder="Rotate Y"
            defaultValue={transform3d.rotateY ?? 0}
            onBlur={(e) =>
              selection &&
              updateNode(selection.id, {
                transform3d: { ...transform3d, rotateY: parseFloat(e.target.value || "0") },
              })
            }
          />
          <input
            className={inputClass}
            placeholder="Rotate Z"
            defaultValue={(transform3d.rotateZ ?? 0) + (selection?.rotation || 0)}
            onBlur={(e) =>
              selection &&
              updateNode(selection.id, {
                transform3d: { ...transform3d, rotateZ: parseFloat(e.target.value || "0") },
              })
            }
          />
          <input
            className={inputClass}
            placeholder="Translate Z"
            defaultValue={transform3d.translateZ ?? 0}
            onBlur={(e) =>
              selection &&
              updateNode(selection.id, {
                transform3d: { ...transform3d, translateZ: parseFloat(e.target.value || "0") },
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inputClass}
            placeholder="Perspective"
            defaultValue={transform3d.perspective ?? 0}
            onBlur={(e) =>
              selection &&
              updateNode(selection.id, {
                transform3d: { ...transform3d, perspective: parseFloat(e.target.value || "0") },
              })
            }
          />
          <div className="grid grid-cols-2 gap-1">
            <input
              className={inputClass}
              placeholder="Origin X (0-1)"
              defaultValue={transform3d.perspectiveOrigin?.x ?? 0.5}
              onBlur={(e) =>
                selection &&
                updateNode(selection.id, {
                  transform3d: {
                    ...transform3d,
                    perspectiveOrigin: {
                      ...(transform3d.perspectiveOrigin || {}),
                      x: parseFloat(e.target.value || "0.5"),
                    },
                  },
                })
              }
            />
            <input
              className={inputClass}
              placeholder="Origin Y (0-1)"
              defaultValue={transform3d.perspectiveOrigin?.y ?? 0.5}
              onBlur={(e) =>
                selection &&
                updateNode(selection.id, {
                  transform3d: {
                    ...transform3d,
                    perspectiveOrigin: {
                      ...(transform3d.perspectiveOrigin || {}),
                      y: parseFloat(e.target.value || "0.5"),
                    },
                  },
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className={inputClass}
            value={transform3d.transformStyle || "flat"}
            onChange={(e) =>
              selection &&
              updateNode(selection.id, { transform3d: { ...transform3d, transformStyle: e.target.value } })
            }
          >
            <option value="flat">Flat</option>
            <option value="preserve-3d">Preserve 3D</option>
          </select>
          <input
            className={inputClass}
            placeholder="Scale Z"
            defaultValue={transform3d.scaleZ ?? 1}
            onBlur={(e) =>
              selection &&
              updateNode(selection.id, {
                transform3d: { ...transform3d, scaleZ: parseFloat(e.target.value || "1") },
              })
            }
          />
        </div>
      </Section>

      {isText && hasTextSelection && selection ? (
        <SpanTypographyPanel node={selection} />
      ) : isText ? (
        <Section title="Typography" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              placeholder="Font Family"
              defaultValue={selection?.fontFamily}
              onBlur={(e) => selection && updateNode(selection.id, { fontFamily: e.target.value })}
            />
            <select
              className={inputClass}
              defaultValue={selection?.fontWeight || "400"}
              onChange={(e) => selection && updateNode(selection.id, { fontWeight: e.target.value })}
            >
              {["300", "400", "500", "600", "700", "800"].map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              className={inputClass}
              placeholder="Size"
              defaultValue={selection?.fontSize || 16}
              onBlur={(e) => selection && updateNode(selection.id, { fontSize: parseFloat(e.target.value || "0") })}
            />
            <input className={inputClass} placeholder="Line Height" />
            <input className={inputClass} placeholder="Letter Spacing" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass} defaultValue="left">
              <option value="left">Align Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
            <select className={inputClass} defaultValue="auto-width">
              <option value="auto-width">Auto width</option>
              <option value="auto-height">Auto height</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
        </Section>
      ) : null}

      {isImage && (
        <Section title="Image" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <button className={miniButton}>Replace…</button>
            <select className={inputClass} defaultValue="fit">
              <option value="fit">Fit</option>
              <option value="fill">Fill</option>
              <option value="crop">Crop</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Border Radius" />
            <input className={inputClass} placeholder="Mask Options" />
          </div>
        </Section>
      )}

      {isVector && (
        <Section title="Vector" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass} defaultValue="round">
              <option value="butt">Cap: Butt</option>
              <option value="round">Cap: Round</option>
              <option value="square">Cap: Square</option>
            </select>
            <select className={inputClass} defaultValue="miter">
              <option value="miter">Join: Miter</option>
              <option value="bevel">Join: Bevel</option>
              <option value="round">Join: Round</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Arrowheads" />
            <input className={inputClass} placeholder="Polygon sides / path edit" />
          </div>
        </Section>
      )}

      {isFrame && (
        <Section title="Frame" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass} defaultValue="custom">
              <option value="custom">Preset</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
            <select className={inputClass} defaultValue="portrait">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
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

      {isComponentInstance && selection && (
        <Section title="Component" defaultOpen={false}>
          <ComponentInstancePanel node={selection} />
        </Section>
      )}

      {selection && (
        <Section title="Interactions" defaultOpen={false}>
          <div className="space-y-2">
            {(selection.interactions || []).map((interaction, idx) => (
              <div key={`${interaction.trigger}-${idx}`} className="rounded-md border border-neutral-200 bg-white px-3 py-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className={inputClass}
                    value={interaction.trigger}
                    onChange={(e) =>
                      updateNode(selection.id, {
                        interactions: (selection.interactions || []).map((i, ii) =>
                          ii === idx ? { ...i, trigger: e.target.value } : i,
                        ),
                      })
                    }
                  >
                    {triggerList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputClass}
                    value={interaction.actions?.[0]?.type || "navigate"}
                    onChange={(e) =>
                      updateNode(selection.id, {
                        interactions: (selection.interactions || []).map((i, ii) =>
                          ii === idx
                            ? {
                                ...i,
                                actions: [{ ...(i.actions?.[0] || {}), type: e.target.value }],
                              }
                            : i,
                        ),
                      })
                    }
                  >
                    <option value="navigate">Navigate</option>
                    <option value="openOverlay">Open Overlay</option>
                    <option value="closeOverlay">Close Overlay</option>
                    <option value="setVariable">Set Variable</option>
                  </select>
                </div>
                <div className="space-y-2">
                  {interaction.actions?.[0]?.type === "navigate" && (
                    <select
                      className={inputClass}
                      value={interaction.actions?.[0]?.target || ""}
                      onChange={(e) =>
                        updateNode(selection.id, {
                          interactions: (selection.interactions || []).map((i, ii) =>
                            ii === idx
                              ? {
                                  ...i,
                                  actions: [{ ...(i.actions?.[0] || {}), target: e.target.value }],
                                }
                              : i,
                          ),
                        })
                      }
                    >
                      <option value="">Select frame</option>
                      {frames.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name || f.id}
                        </option>
                      ))}
                    </select>
                  )}
                  {interaction.actions?.[0]?.type === "openOverlay" && (
                    <select
                      className={inputClass}
                      value={interaction.actions?.[0]?.target || ""}
                      onChange={(e) =>
                        updateNode(selection.id, {
                          interactions: (selection.interactions || []).map((i, ii) =>
                            ii === idx
                              ? {
                                  ...i,
                                  actions: [{ ...(i.actions?.[0] || {}), target: e.target.value }],
                                }
                              : i,
                          ),
                        })
                      }
                    >
                      <option value="">Select overlay</option>
                      {frames.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name || f.id}
                        </option>
                      ))}
                    </select>
                  )}
                  {interaction.actions?.[0]?.type === "setVariable" && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className={inputClass}
                        placeholder="Variable key"
                        defaultValue={interaction.actions?.[0]?.key || ""}
                        onBlur={(e) =>
                          updateNode(selection.id, {
                            interactions: (selection.interactions || []).map((i, ii) =>
                              ii === idx
                                ? {
                                    ...i,
                                    actions: [{ ...(i.actions?.[0] || {}), key: e.target.value }],
                                  }
                                : i,
                            ),
                          })
                        }
                      />
                      <input
                        className={inputClass}
                        placeholder="Value"
                        defaultValue={interaction.actions?.[0]?.value || ""}
                        onBlur={(e) =>
                          updateNode(selection.id, {
                            interactions: (selection.interactions || []).map((i, ii) =>
                              ii === idx
                                ? {
                                    ...i,
                                    actions: [{ ...(i.actions?.[0] || {}), value: e.target.value }],
                                  }
                                : i,
                            ),
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                <button
                  className={miniButton}
                  onClick={() =>
                    updateNode(selection.id, {
                      interactions: (selection.interactions || []).filter((_, ii) => ii !== idx),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className={miniButton}
              onClick={() =>
                updateNode(selection.id, {
                  interactions: [
                    ...(selection.interactions || []),
                    { trigger: "onClick", actions: [{ type: "navigate", target: frames[0]?.id || "" }] },
                  ],
                })
              }
            >
              + Add Interaction
            </button>
          </div>
        </Section>
      )}

      <Section title="Prototype & Interaction" defaultOpen={false}>
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

      <Section title="AI Assist" defaultOpen={false}>
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
