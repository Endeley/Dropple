"use client";

import { useNodeTreeStore } from "@/zustand/nodeTreeStore";
import { useSelectionStore } from "@/zustand/selectionStore";
import { useTextEditStore } from "@/zustand/textEditStore";
import { computeLayout } from "@/lib/text/layoutEngine";
import { backspace, forwardDelete, insertChar } from "@/lib/text/applyEdit";
import { applyStyleToRange } from "@/lib/text/applyStyleToRange";
import { useEffect, useRef } from "react";
import { captureAfterAndPush, captureBefore } from "@/zustand/undoStore";
import { useToolStore } from "@/zustand/toolStore";
import { useVectorEditStore } from "@/zustand/vectorEditStore";
import { resolveValue } from "@/lib/tokens/resolveValue";
import { useComponentStore } from "@/zustand/componentStore";
import { measureResolvedBounds, resolveInstance } from "@/lib/components/resolveInstance";

const toPathD = (segments = []) => {
  if (!segments.length) return "";
  return segments
    .map((seg, idx) => {
      if (seg.type === "move" || idx === 0) return `M ${seg.x} ${seg.y}`;
      if (seg.type === "curve")
        return `C ${seg.cx1 ?? seg.x} ${seg.cy1 ?? seg.y} ${seg.cx2 ?? seg.x} ${seg.cy2 ?? seg.y} ${seg.x} ${seg.y}`;
      return `L ${seg.x} ${seg.y}`;
    })
    .join(" ");
};

const measureTextLines = (spans = [], maxWidth = Infinity) => {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas ? canvas.getContext("2d") : null;
  const lines = [];
  if (!ctx) {
    return { lines: [{ spans }], height: spans.reduce((h, s) => Math.max(h, s.fontSize || 16), 0) };
  }

  let currentLine = [];
  let currentWidth = 0;
  let lineHeight = 0;
  const appendWord = (word, style) => {
    ctx.font = `${style.fontWeight || 400} ${style.italic ? "italic " : ""}${style.fontSize || 16}px ${style.fontFamily || "Inter"}`;
    const metrics = ctx.measureText(word);
    const wordWidth = metrics.width;
    const lh = (style.fontSize || 16) * (style.lineHeight || 1.4);
    return { wordWidth, lh };
  };

  spans.forEach((span) => {
    const words = span.text?.split(/(\s+)/) || [];
    words.forEach((word) => {
      const { wordWidth, lh } = appendWord(word, span);
      if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
        lines.push({ spans: currentLine, lineHeight: lineHeight || lh });
        currentLine = [];
        currentWidth = 0;
        lineHeight = 0;
      }
      currentLine.push({ ...span, text: word, width: wordWidth });
      currentWidth += wordWidth;
      lineHeight = Math.max(lineHeight, lh);
    });
  });

  if (currentLine.length) {
    lines.push({ spans: currentLine, lineHeight });
  }

  const totalHeight = lines.reduce((sum, l) => sum + (l.lineHeight || 0), 0);
  return { lines, height: totalHeight };
};

export default function NodeRenderer({ onNodePointerDown }) {
  const nodes = useNodeTreeStore((s) => s.nodes);
  const updateNode = useNodeTreeStore((s) => s.updateNode);
  const rootIds = useNodeTreeStore((s) => s.rootIds);
  const setSelectedManual = useSelectionStore((s) => s.setSelectedManual);
  const tool = useToolStore((s) => s.tool);
  const editingPathId = useVectorEditStore((s) => s.editingPathId);
  const setEditingPath = useVectorEditStore((s) => s.setEditingPath);
  const vectorSelection = useVectorEditStore((s) => s.selected);
  const setVectorSelection = useVectorEditStore((s) => s.setSelectedHandle);
  const editingId = useTextEditStore((s) => s.editingId);
  const caretIndex = useTextEditStore((s) => s.caretIndex);
  const selectionStart = useTextEditStore((s) => s.selectionStart);
  const selectionEnd = useTextEditStore((s) => s.selectionEnd);
  const isSelecting = useTextEditStore((s) => s.isSelecting);
  const startEditing = useTextEditStore((s) => s.startEditing);
  const setCaret = useTextEditStore((s) => s.setCaretIndex);
  const beginSelection = useTextEditStore((s) => s.beginSelection);
  const updateSelection = useTextEditStore((s) => s.updateSelection);
  const endSelection = useTextEditStore((s) => s.endSelection);
  const pendingStyle = useTextEditStore((s) => s.pendingStyle);
  const setPendingStyle = useTextEditStore((s) => s.setPendingStyle);
  const setTool = useToolStore((s) => s.setTool);
  const vectorDragRef = useRef(null);
  const getComponent = useComponentStore((s) => s.getComponent);

  const buildTransform = (node) => {
    const t3d = node.transform3d || {};
    const transforms = [];
    if (t3d.translateZ) transforms.push(`translateZ(${t3d.translateZ}px)`);
    if (t3d.rotateX) transforms.push(`rotateX(${t3d.rotateX}deg)`);
    if (t3d.rotateY) transforms.push(`rotateY(${t3d.rotateY}deg)`);
    const rotateZ = (t3d.rotateZ ?? 0) + (node.rotation || 0);
    if (rotateZ) transforms.push(`rotateZ(${rotateZ}deg)`);
    return transforms.join(" ");
  };

  const build3DStyle = (node) => {
    const t3d = node.transform3d || {};
    const style = {};
    const transformStr = buildTransform(node);
    if (transformStr) style.transform = transformStr;
    if (t3d.perspective) style.perspective = `${t3d.perspective}px`;
    if (t3d.perspectiveOrigin) {
      const { x = 0.5, y = 0.5 } = t3d.perspectiveOrigin;
      style.perspectiveOrigin = `${x * 100}% ${y * 100}%`;
    }
    if (t3d.transformStyle) style.transformStyle = t3d.transformStyle;
    return style;
  };

  const recomputePathBounds = (segments = []) => {
    const xs = [];
    const ys = [];
    segments.forEach((s) => {
      xs.push(s.x);
      ys.push(s.y);
      if (s.cx1 !== undefined) xs.push(s.cx1);
      if (s.cx2 !== undefined) xs.push(s.cx2);
      if (s.cy1 !== undefined) ys.push(s.cy1);
      if (s.cy2 !== undefined) ys.push(s.cy2);
    });
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  };

  const startVectorDrag = (e, node, anchorIndex, handle = "anchor") => {
    e.stopPropagation();
    setEditingPath(node.id);
    setVectorSelection({ anchorIndex, handleType: handle });
    vectorDragRef.current = {
      nodeId: node.id,
      handle,
      anchorIndex,
      startX: e.clientX,
      startY: e.clientY,
      initialSegments: JSON.parse(JSON.stringify(node.segments || [])),
    };
    window.addEventListener("mousemove", onVectorDrag);
    window.addEventListener("mouseup", endVectorDrag);
  };

  const onVectorDrag = (e) => {
    const drag = vectorDragRef.current;
    if (!drag) return;
    const { nodeId, handle, anchorIndex, startX, startY, initialSegments } = drag;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const node = nodes[nodeId];
    if (!node) return;
    const segs = JSON.parse(JSON.stringify(initialSegments));
    const seg = segs[anchorIndex];
    if (!seg) return;
    if (handle === "anchor") {
      seg.x += dx;
      seg.y += dy;
      if (seg.cx1 !== undefined && seg.cy1 !== undefined) {
        seg.cx1 += dx;
        seg.cy1 += dy;
      }
      if (seg.cx2 !== undefined && seg.cy2 !== undefined) {
        seg.cx2 += dx;
        seg.cy2 += dy;
      }
    } else if (handle === "cx1") {
      seg.cx1 += dx;
      seg.cy1 += dy;
    } else if (handle === "cx2") {
      seg.cx2 += dx;
      seg.cy2 += dy;
    }
    const bounds = recomputePathBounds(segs);
    updateNode(nodeId, {
      segments: segs,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
  };

  const endVectorDrag = () => {
    vectorDragRef.current = null;
    window.removeEventListener("mousemove", onVectorDrag);
    window.removeEventListener("mouseup", endVectorDrag);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onVectorDrag);
      window.removeEventListener("mouseup", endVectorDrag);
    };
  }, []);

  const renderNode = (id) => {
    const node = nodes[id];
    if (!node) return null;

    const style = {
      position: "absolute",
      left: node.x ?? 0,
      top: node.y ?? 0,
      width: node.width ?? (Math.abs(node.x2 - node.x1) || 1),
      height: node.height ?? (Math.abs(node.y2 - node.y1) || 1),
      opacity: node.opacity ?? 1,
      pointerEvents: node.locked ? "none" : "auto",
      display: node.hidden ? "none" : "block",
      ...build3DStyle(node),
    };

    let content = null;
    switch (node.type) {
      case "component-instance": {
        const component = getComponent(node.componentId);
        const resolved = resolveInstance(component, node, getComponent);
        const bounds = measureResolvedBounds(resolved.nodes, resolved.rootIds);
        const containerStyle = {
          position: "absolute",
          left: node.x ?? 0,
          top: node.y ?? 0,
          width: node.width ?? bounds.width,
          height: node.height ?? bounds.height,
          opacity: node.opacity ?? 1,
          pointerEvents: node.locked ? "none" : "auto",
          display: node.hidden ? "none" : "block",
          ...build3DStyle(node),
        };

        const renderResolved = (rid) => {
          const rnode = resolved.nodes[rid];
          if (!rnode) return null;
          const localStyle = {
            position: "absolute",
            left: rnode.x || 0,
            top: rnode.y || 0,
            width: rnode.width || 0,
            height: rnode.height || 0,
            pointerEvents: "none",
            ...build3DStyle(rnode),
          };
          let childContent = null;
          if (rnode.type === "rect" || rnode.type === "shape") {
            childContent = <div style={{ background: resolveValue(rnode.fill) || "#666", width: "100%", height: "100%" }} />;
          } else if (rnode.type === "ellipse") {
            childContent = (
              <svg width="100%" height="100%" viewBox={`0 0 ${rnode.width || 1} ${rnode.height || 1}`} className="overflow-visible">
                <ellipse
                  cx={(rnode.width || 1) / 2}
                  cy={(rnode.height || 1) / 2}
                  rx={(rnode.width || 1) / 2}
                  ry={(rnode.height || 1) / 2}
                  fill={resolveValue(rnode.fill) || "transparent"}
                  stroke={resolveValue(rnode.stroke) || "#000"}
                  strokeWidth={rnode.strokeWidth || 1}
                />
              </svg>
            );
          } else if (rnode.type === "line") {
            const x1 = (rnode.x1 ?? 0) - (rnode.x ?? 0);
            const y1 = (rnode.y1 ?? 0) - (rnode.y ?? 0);
            const x2 = (rnode.x2 ?? 0) - (rnode.x ?? 0);
            const y2 = (rnode.y2 ?? 0) - (rnode.y ?? 0);
            const w = rnode.width || Math.abs(x2 - x1) || 1;
            const h = rnode.height || Math.abs(y2 - y1) || 1;
            childContent = (
              <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={resolveValue(rnode.stroke) || "#000"}
                  strokeWidth={rnode.strokeWidth || 2}
                  strokeLinecap="round"
                />
              </svg>
            );
          } else if (rnode.type === "polygon") {
            const pts = rnode.points || [];
            if (pts.length) {
              const minX = Math.min(...pts.map((p) => p.x));
              const minY = Math.min(...pts.map((p) => p.y));
              const normalized = pts.map((p) => `${p.x - minX},${p.y - minY}`).join(" ");
              childContent = (
                <svg width="100%" height="100%" viewBox={`0 0 ${rnode.width || 1} ${rnode.height || 1}`} className="overflow-visible">
                  <polygon
                    points={normalized}
                    fill={resolveValue(rnode.fill) || "transparent"}
                    stroke={resolveValue(rnode.stroke) || "#000"}
                    strokeWidth={rnode.strokeWidth || 1}
                  />
                </svg>
              );
            }
          } else if (rnode.type === "path") {
            const segs = rnode.segments || [];
            if (segs.length) {
              const xs = segs.map((s) => s.x);
              const ys = segs.map((s) => s.y);
              const minX = Math.min(...xs);
              const minY = Math.min(...ys);
              const normalized = segs.map((s) => ({ ...s, x: s.x - minX, y: s.y - minY }));
              childContent = (
                <svg width="100%" height="100%" viewBox={`0 0 ${rnode.width || 1} ${rnode.height || 1}`} className="overflow-visible">
                  <path
                    d={toPathD(normalized) + (rnode.closed ? " Z" : "")}
                    stroke={resolveValue(rnode.stroke) || "#000"}
                    strokeWidth={rnode.strokeWidth || 2}
                    fill={resolveValue(rnode.fill) || "transparent"}
                  />
                </svg>
              );
            }
          } else if (rnode.type === "image") {
            childContent = (
              <img
                src={rnode.src}
                alt={rnode.name || ""}
                className="w-full h-full object-cover"
                style={{ pointerEvents: "none" }}
              />
            );
          } else if (rnode.type === "text") {
            childContent = (
              <div
                style={{
                  color: resolveValue(rnode.fill) || "#fff",
                  fontSize: rnode.fontSize || 16,
                  lineHeight: 1.3,
                }}
              >
                {rnode.text || rnode.name}
              </div>
            );
          }
          return (
            <div key={rid} style={localStyle}>
              {childContent}
              {(rnode.children || []).map((cid) => renderResolved(cid))}
            </div>
          );
        };

        content = (
          <div
            style={containerStyle}
            onMouseDown={(e) => {
              setSelectedManual([id]);
              onNodePointerDown?.(e, id);
            }}
          >
            {(resolved.rootIds || []).map((rid) => renderResolved(rid))}
          </div>
        );
        break;
      }
      case "rect":
      case "shape":
        content = <div style={{ background: resolveValue(node.fill) || "#666", width: "100%", height: "100%" }} />;
        break;
      case "ellipse": {
        const w = node.width || 1;
        const h = node.height || 1;
        content = (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <ellipse
              cx={w / 2}
              cy={h / 2}
              rx={w / 2}
              ry={h / 2}
              fill={resolveValue(node.fill) || "transparent"}
              stroke={resolveValue(node.stroke) || "#000"}
              strokeWidth={node.strokeWidth || 1}
            />
          </svg>
        );
        break;
      }
      case "line": {
        const x1 = (node.x1 ?? 0) - (node.x ?? 0);
        const y1 = (node.y1 ?? 0) - (node.y ?? 0);
        const x2 = (node.x2 ?? 0) - (node.x ?? 0);
        const y2 = (node.y2 ?? 0) - (node.y ?? 0);
        const w = node.width || Math.abs(x2 - x1) || 1;
        const h = node.height || Math.abs(y2 - y1) || 1;
        content = (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={resolveValue(node.stroke) || "#000"}
              strokeWidth={node.strokeWidth || 2}
              strokeLinecap="round"
            />
          </svg>
        );
        break;
      }
      case "polygon": {
        const pts = node.points || [];
        if (!pts.length) break;
        const minX = Math.min(...pts.map((p) => p.x));
        const minY = Math.min(...pts.map((p) => p.y));
        const normalized = pts.map((p) => `${p.x - minX},${p.y - minY}`).join(" ");
        const w = node.width || Math.max(...pts.map((p) => p.x)) - minX || 1;
        const h = node.height || Math.max(...pts.map((p) => p.y)) - minY || 1;
        content = (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <polygon
              points={normalized}
              fill={resolveValue(node.fill) || "transparent"}
              stroke={resolveValue(node.stroke) || "#000"}
              strokeWidth={node.strokeWidth || 1}
            />
          </svg>
        );
        break;
      }
      case "path": {
        const segments = node.segments || [];
        if (!segments.length) break;
        const xs = segments.map((s) => s.x);
        const ys = segments.map((s) => s.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const normalized = segments.map((s) => ({ ...s, x: s.x - minX, y: s.y - minY }));
        const w = node.width || Math.max(...xs) - minX || 1;
        const h = node.height || Math.max(...ys) - minY || 1;
        const showVector = tool === "vector-edit" && editingPathId === node.id;
        const anchors = showVector
          ? segments.map((s, idx) => {
              const nx = s.x - minX;
              const ny = s.y - minY;
              return (
                <g key={idx}>
                  {s.cx1 !== undefined && s.cy1 !== undefined && (
                    <>
                      <line x1={s.cx1 - minX} y1={s.cy1 - minY} x2={nx} y2={ny} stroke="#9ca3af" strokeDasharray="2 2" />
                      <circle
                        cx={s.cx1 - minX}
                        cy={s.cy1 - minY}
                        r={3}
                        fill="#f3f4f6"
                        stroke="#6b7280"
                        onMouseDown={(e) => startVectorDrag(e, node, idx, "cx1")}
                      />
                    </>
                  )}
                  {s.cx2 !== undefined && s.cy2 !== undefined && (
                    <>
                      <line x1={s.cx2 - minX} y1={s.cy2 - minY} x2={nx} y2={ny} stroke="#9ca3af" strokeDasharray="2 2" />
                      <circle
                        cx={s.cx2 - minX}
                        cy={s.cy2 - minY}
                        r={3}
                        fill="#f3f4f6"
                        stroke="#6b7280"
                        onMouseDown={(e) => startVectorDrag(e, node, idx, "cx2")}
                      />
                    </>
                  )}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={4}
                    fill="#fff"
                    stroke={vectorSelection?.anchorIndex === idx && vectorSelection?.handleType === "anchor" ? "#7c3aed" : "#111827"}
                    onMouseDown={(e) => startVectorDrag(e, node, idx, "anchor")}
                  />
                </g>
              );
            })
          : null;
        content = (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${w} ${h}`}
            className="overflow-visible"
            onDoubleClick={(e) => {
              setTool("vector-edit");
              setEditingPath(node.id);
              e.stopPropagation();
            }}
          >
            <path
              d={toPathD(normalized) + (node.closed ? " Z" : "")}
              stroke={resolveValue(node.stroke) || "#000"}
              strokeWidth={node.strokeWidth || 2}
              fill={resolveValue(node.fill) || "transparent"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {anchors}
          </svg>
        );
        break;
      }
      case "image":
        content = (
          <img
            src={node.src}
            alt={node.name || ""}
            className="w-full h-full object-cover"
            style={{ pointerEvents: "none" }}
          />
        );
        break;
      case "text":
        content = (
          <div
            style={{
              color: resolveValue(node.fill) || "#fff",
              fontSize: node.fontSize || 16,
              lineHeight: 1.3,
            }}
          >
            {node.text || node.name}
          </div>
        );
        break;
      case "richtext": {
        const maxWidth = node.autoWidth ? Infinity : node.width || 200;
        const layout = computeLayout(node.spans || [], maxWidth);
        const lineElems = [];
        layout.lines.forEach((line, idx) => {
          const spans = line.runs.map((run, i) => (
            <span
              key={`${idx}-${i}`}
              style={{
                fontFamily: run.style.fontFamily || "Inter",
                fontSize: run.style.fontSize || 16,
                fontWeight: run.style.fontWeight || 400,
                color: resolveValue(run.style.color) || "#fff",
                letterSpacing: run.style.letterSpacing || 0,
                fontStyle: run.style.italic ? "italic" : "normal",
                textDecoration: run.style.underline ? "underline" : "none",
                whiteSpace: "pre",
              }}
            >
              {run.text}
            </span>
          ));
          lineElems.push(
            <div key={idx} style={{ height: line.lineHeight || "auto", lineHeight: `${line.lineHeight}px` }}>
              {spans}
            </div>,
          );
        });

        const charMap = layout.charMap;
        const getCaretFromClick = (offsetX, offsetY) => {
          if (!charMap.length) return 0;
          // find char by line proximity first
          let closest = 0;
          let minDist = Infinity;
          charMap.forEach((c, idx) => {
            const inY = offsetY >= c.y && offsetY <= c.y + c.height;
            const dx = Math.abs(offsetX - c.x);
            const dy = inY ? 0 : Math.min(Math.abs(offsetY - c.y), Math.abs(offsetY - (c.y + c.height)));
            const dist = dx + dy;
            if (dist < minDist) {
              minDist = dist;
              closest = idx;
            }
          });
          return closest;
        };

        const handleMouseDown = (e) => {
          if (editingId !== node.id) {
            startEditing(node.id, charMap.length);
          }
          const idx = getCaretFromClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          beginSelection(idx);
          e.stopPropagation();
        };

        const handleMouseMove = (e) => {
          if (editingId !== node.id || !isSelecting) return;
          const idx = getCaretFromClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          updateSelection(idx);
        };

        const handleMouseUp = (e) => {
          if (editingId === node.id) endSelection();
        };

        const selStart = Math.min(selectionStart ?? 0, selectionEnd ?? 0);
        const selEnd = Math.max(selectionStart ?? 0, selectionEnd ?? 0);

        const selectionBlocks =
          editingId === node.id && selectionStart !== null && selectionEnd !== null
            ? charMap.slice(selStart, selEnd + 1).map((c, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: c.x,
                    top: c.y,
                    width: c.width,
                    height: c.height,
                    background: "rgba(80, 150, 255, 0.25)",
                    pointerEvents: "none",
                  }}
                />
              ))
            : null;

        const caretChar = charMap[Math.min(caretIndex, Math.max(charMap.length - 1, 0))] || { x: 0, y: 0, height: layout.height || 20 };

        const editorRef = useRef(null);
        useEffect(() => {
          if (editingId === node.id && editorRef.current) {
            editorRef.current.focus();
          }
        }, [editingId, node.id]);

        const handleKeyDown = (e) => {
          if (editingId !== node.id) return;
          const spansCopy = (node.spans || []).map((s) => ({ ...s }));
          const selection =
            selectionStart !== null && selectionEnd !== null
              ? { start: selectionStart, end: selectionEnd }
              : { start: caretIndex, end: caretIndex };

          const hasSelectionRange = selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd;

          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
            e.preventDefault();
            if (hasSelectionRange) {
              captureBefore(node, caretIndex, selectionStart, selectionEnd);
              const newSpans = applyStyleToRange(spansCopy, selectionStart, selectionEnd, { fontWeight: 700 });
              const nextLayout = computeLayout(newSpans, maxWidth);
              updateNode(node.id, { spans: newSpans, height: nextLayout.height });
              setCaret(Math.max(selectionStart, selectionEnd));
              captureAfterAndPush(node, Math.max(selectionStart, selectionEnd), selectionStart, selectionEnd, "format");
            } else {
              setPendingStyle({ fontWeight: 700 });
            }
            return;
          }

          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
            e.preventDefault();
            if (hasSelectionRange) {
              captureBefore(node, caretIndex, selectionStart, selectionEnd);
              const newSpans = applyStyleToRange(spansCopy, selectionStart, selectionEnd, { italic: true });
              const nextLayout = computeLayout(newSpans, maxWidth);
              updateNode(node.id, { spans: newSpans, height: nextLayout.height });
              setCaret(Math.max(selectionStart, selectionEnd));
              captureAfterAndPush(node, Math.max(selectionStart, selectionEnd), selectionStart, selectionEnd, "format");
            } else {
              setPendingStyle({ italic: true });
            }
            return;
          }

          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "u") {
            e.preventDefault();
            if (hasSelectionRange) {
              captureBefore(node, caretIndex, selectionStart, selectionEnd);
              const newSpans = applyStyleToRange(spansCopy, selectionStart, selectionEnd, { underline: true });
              const nextLayout = computeLayout(newSpans, maxWidth);
              updateNode(node.id, { spans: newSpans, height: nextLayout.height });
              setCaret(Math.max(selectionStart, selectionEnd));
              captureAfterAndPush(node, Math.max(selectionStart, selectionEnd), selectionStart, selectionEnd, "format");
            } else {
              setPendingStyle({ underline: true });
            }
            return;
          }

          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            captureBefore(node, caretIndex, selectionStart, selectionEnd);
            const styleToApply = selection && selection.start !== selection.end ? {} : pendingStyle || {};
            const { spans: newSpans, newCaret } = insertChar(
              spansCopy,
              caretIndex,
              selection,
              e.key,
              styleToApply,
            );
            const nextLayout = computeLayout(newSpans, maxWidth);
            updateNode(node.id, { spans: newSpans, height: nextLayout.height });
            setCaret(newCaret);
            captureAfterAndPush(node, newCaret, newCaret, newCaret, "text-insert");
            return;
          }

          if (e.key === "Backspace") {
            e.preventDefault();
            captureBefore(node, caretIndex, selectionStart, selectionEnd);
            const { spans: newSpans, newCaret } = backspace(spansCopy, caretIndex, selection);
            const nextLayout = computeLayout(newSpans, maxWidth);
            updateNode(node.id, { spans: newSpans, height: nextLayout.height });
            setCaret(newCaret);
            captureAfterAndPush(node, newCaret, newCaret, newCaret, "text-delete");
            return;
          }

          if (e.key === "Delete") {
            e.preventDefault();
            captureBefore(node, caretIndex, selectionStart, selectionEnd);
            const { spans: newSpans, newCaret } = forwardDelete(spansCopy, caretIndex, selection);
            const nextLayout = computeLayout(newSpans, maxWidth);
            updateNode(node.id, { spans: newSpans, height: nextLayout.height });
            setCaret(newCaret);
            captureAfterAndPush(node, newCaret, newCaret, newCaret, "text-delete");
          }
        };

        content = (
          <div
            style={{
              width: node.autoWidth ? "fit-content" : "100%",
              height: node.autoHeight ? "auto" : "100%",
              color: resolveValue(node.fill) || "#fff",
              position: "relative",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={(e) => {
              startEditing(node.id, charMap.length);
              e.stopPropagation();
            }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            ref={editorRef}
          >
            {selectionBlocks}
            <div>{lineElems}</div>
            {editingId === node.id && (
              <div
                style={{
                  position: "absolute",
                  left: caretChar.x,
                  top: caretChar.y,
                  width: 2,
                  height: caretChar.height || 18,
                  background: "#4efcff",
                }}
              />
            )}
          </div>
        );
        break;
      }
      default:
        content = <div className="bg-neutral-700 w-full h-full" />;
    }

    return (
      <div
        key={id}
        style={style}
        onMouseDown={(e) => {
          setSelectedManual([id]);
          onNodePointerDown?.(e, id);
        }}
      >
        {content}
        {node.children?.map((childId) => renderNode(childId))}
      </div>
    );
  };

  return <>{rootIds.map((id) => renderNode(id))}</>;
}
