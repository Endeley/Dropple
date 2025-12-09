/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation, useScroll, useTransform } from "motion/react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { useComponentRegistry } from "@/zustand/useComponentRegistry";
import { useSceneGraph } from "@/zustand/useSceneGraph";
import { useStateMachine } from "@/zustand/useStateMachine";
import { useBehaviorsStore } from "@/zustand/useBehaviorsStore";

export default function CanvasLayer({
  layer,
  isInstanceChild = false,
  offset: parentOffset = { x: 0, y: 0 },
  isComponentMaster = false,
  parentVariant = null,
}) {
  const {
    selectedLayerId,
    selectedLayers,
    setSelectedLayers,
    addSelectedLayer,
    removeSelectedLayer,
    clearSelection,
    selectLayer,
    updateLayer,
    writeNodePatch: writePatchFn,
    editingTextId,
    setEditingTextId,
    stopEditingText,
    currentTemplate,
    snapThreshold,
    setActiveGuides,
    components,
    editingComponentId,
    editingVariantId,
    styles,
    themes,
    activeThemeId,
    activeBreakpoint,
  } = useTemplateBuilderStore();
  const instanceRegistry = useTemplateBuilderStore((s) => s.instanceRegistry || {});

  const ref = useRef(null);
  const register = useComponentRegistry((state) => state.register);
  const unregister = useComponentRegistry((state) => state.unregister);
  const upsertNode = useSceneGraph((state) => state.upsertNode);
  const removeNode = useSceneGraph((state) => state.removeNode);
  const triggerEvent = useStateMachine((state) => state.triggerEvent);
  const loadMachine = useStateMachine((state) => state.loadMachine);
  const triggerBehavior = useBehaviorsStore((state) => state.trigger);
  const loadBehaviors = useBehaviorsStore((state) => state.loadBehaviors);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedOverIdx, setDraggedOverIdx] = useState(null);
  const [reorderGuide, setReorderGuide] = useState(null);
  const renderX = (parentOffset?.x || 0) + layer.x;
  const renderY = (parentOffset?.y || 0) + layer.y;
  const isHidden = layer.hidden;

  useEffect(() => {
    if (editingTextId === layer.id && ref.current) {
      ref.current.focus();
    }
  }, [editingTextId, layer.id]);

  useEffect(() => {
    if (!layer?.id) return;
    register(layer.id, ref);
    return () => unregister(layer.id);
  }, [layer?.id, register, unregister]);

  useEffect(() => {
    if (!layer?.id) return;
    upsertNode(layer.id, layer.parentId || null);
    return () => removeNode(layer.id);
  }, [layer?.id, layer?.parentId, upsertNode, removeNode]);

  useEffect(() => {
    if (!layer?.id) return;
    loadMachine(layer.id);
  }, [layer?.id, loadMachine]);

  useEffect(() => {
    if (!layer?.id) return;
    loadBehaviors(layer.id);
  }, [layer?.id, loadBehaviors]);

  const isSelected = selectedLayerId === layer.id || selectedLayers.includes(layer.id);
  const parent = isComponentMaster
    ? null
    : currentTemplate.layers.find((l) => (l.children || []).includes(layer.id));
  const autoLayout = useMemo(
    () =>
      layer.autoLayout || {
        enabled: false,
        direction: "vertical",
        padding: 16,
        gap: 12,
        align: "start",
        hugging: false,
      },
    [layer.autoLayout],
  );

  const getComponentNode = (id) => {
    if (!isComponentMaster) return null;
    const comp = components.find((c) => c._id === editingComponentId);
    if (!comp) return null;
    const nodes =
      editingVariantId && comp.variants?.length
        ? comp.variants.find((v) => v.id === editingVariantId)?.nodes
        : comp.nodes;
    return nodes?.find((n) => n.id === id) || null;
  };

  // Do not early return before hooks; hide via visibility later if needed.

  const responsiveOverride = useMemo(
    () => layer.responsive?.[activeBreakpoint] || {},
    [layer.responsive, activeBreakpoint],
  );
  const directionOverride = responsiveOverride.autoLayout?.direction;
  const width = responsiveOverride.width ?? layer.width;
  const height = responsiveOverride.height ?? layer.height;
  const visibility = responsiveOverride.visibility || "inherit";

  const controls = useAnimation();
  const instanceMeta =
    layer.componentInstanceId && instanceRegistry[layer.componentInstanceId]
      ? instanceRegistry[layer.componentInstanceId]
      : null;
  const writeNodePatch = writePatchFn || updateLayer;
  const override = instanceMeta?.overrides?.[layer.id] || {};
  const useMasterMotion = instanceMeta?.useMasterMotion !== false;
  const resolvedAnimations = useMasterMotion
    ? override.animations ?? layer.animations
    : override.animations ?? [];
  const mergedLayer = { ...layer, ...override, animations: resolvedAnimations };

  const { motionProps, motionTriggers, motionStates, scrollDef, outboundVariant } = buildMotionProps(
    mergedLayer,
    controls,
    parentVariant,
  );

  const offsetLine = (children, targetIdx, isVertical) => {
    const sizes = children.map((c) => (isVertical ? c.height : c.width));
    const gaps = (layer.autoLayout?.gap || 0) * targetIdx;
    const padding = layer.autoLayout?.padding || 0;
    const sumBefore = sizes.slice(0, targetIdx).reduce((a, b) => a + b, 0);
    return padding + sumBefore + gaps;
  };
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scrollStyle = buildScrollStyle(scrollDef, scrollYProgress);
  const selectedAnim =
    (layer?.animations || []).find((a) => a.id === (layer.motionAnimationId || layer.animations?.[0]?.id)) ||
    layer?.animations?.[0];
  const timelineTracks = useMemo(() => selectedAnim?.tracks || [], [selectedAnim?.tracks]);
  const timelineLoop = selectedAnim?.timelineLoop || false;
  const timelineLoopCount = selectedAnim?.timelineLoopCount ?? 0;

  useEffect(() => {
    if (!selectedAnim?.playTimelineOnLoad) return;
    if (!timelineTracks?.length) return;
    if (!ref.current) return;
    const seq = buildTimelineSequence(timelineTracks);
    if (!seq.length) return;
    let cancelled = false;
    let mounted = true;
    const run = async () => {
      let remaining = timelineLoop ? (timelineLoopCount || -1) : 1;
      while (!cancelled && mounted && remaining !== 0) {
        for (const step of seq) {
          if (cancelled || !mounted) break;
          await controls.start(step);
        }
        if (remaining > 0) remaining -= 1;
      }
    };
    run();
    return () => {
      cancelled = true;
      mounted = false;
    };
  }, [timelineTracks, timelineLoop, timelineLoopCount, controls, selectedAnim?.playTimelineOnLoad, ref]);

  function handleMouseDown(e) {
    if (editingTextId === layer.id) return;
    // Prevent direct edits on component-instance roots unless detached
    if (layer.type === "component-instance" && instanceRegistry[layer.id]?.detached === false) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();

    if (e.shiftKey) {
      if (selectedLayers?.includes(layer.id)) {
        removeSelectedLayer(layer.id);
      } else {
        addSelectedLayer(layer.id);
      }
    } else {
      setSelectedLayers([layer.id]);
    }

    if (layer.locked) return;

    if (!isInstanceChild) {
      selectLayer(layer.id);
      setDragging(true);
      setDragOffset({
        x: e.clientX - renderX,
        y: e.clientY - renderY,
      });
      setReorderGuide(null);
      setActiveGuides([]);
    }
  }

  function handleMouseMove(e) {
    if (
      !dragging ||
      editingTextId === layer.id ||
      isInstanceChild ||
      layer.locked
    )
      return;
    e.preventDefault();

    // Auto-layout parent: reorder children instead of free-move
    if (!isComponentMaster && parent && parent.type === "frame" && parent.autoLayout?.enabled) {
      const parentChildren = (parent.children || [])
        .map((cid) => currentTemplate.layers.find((l) => l.id === cid))
        .filter(Boolean);
      const isVertical =
        parent.autoLayout.direction === "vertical" ||
        (directionOverride === "vertical" && directionOverride !== "horizontal");
      const padding = parent.autoLayout.padding || 0;
      const gap = parent.autoLayout.gap || 0;
      const parentOrigin = isVertical ? parent.y + (parentOffset?.y || 0) : parent.x + (parentOffset?.x || 0);
      const cursorPos = (isVertical ? e.clientY : e.clientX) - (parentOffset?.[isVertical ? "y" : "x"] || 0);
      const deadZone = 4;

      let offset = padding;
      let targetIdx = parentChildren.length;
      parentChildren.forEach((child, idx) => {
        const size = isVertical ? child.height : child.width;
        const start = parentOrigin + offset;
        const mid = start + size / 2;
        if (cursorPos < mid - deadZone) {
          targetIdx = idx;
          return;
        }
        offset += size + gap;
      });
      if (targetIdx > parentChildren.length) targetIdx = parentChildren.length - 1;
      if (draggedOverIdx !== targetIdx) {
        setDraggedOverIdx(targetIdx);
        const move = useTemplateBuilderStore.getState().moveNode;
        beginHistoryTransaction("reorder auto-layout");
        move(layer.id, parent.id, targetIdx, { undoable: false });
        endHistoryTransaction();
      }
      const guidePos =
        padding + offsetLine(parentChildren, targetIdx, isVertical) + targetIdx * gap;
      const crossPadding = parent.autoLayout?.padding || 0;
      const guideLength = isVertical
        ? parent.width - crossPadding * 2
        : parent.height - crossPadding * 2;
      const placeholderSize =
        (isVertical ? layer.height : layer.width) + gap * 0.5;
      setReorderGuide({
        axis: isVertical ? "y" : "x",
        pos: guidePos,
        parentId: parent.id,
        length: guideLength,
        inset: crossPadding,
        ghostSize: placeholderSize,
      });
      return;
    }

    if (isComponentMaster) {
      setActiveGuides([]);
      const relX = e.clientX - dragOffset.x - (parentOffset?.x || 0);
      const relY = e.clientY - dragOffset.y - (parentOffset?.y || 0);
      writeNodePatch(layer.id, { x: relX, y: relY });
      return;
    }
    const layersMap = new Map(currentTemplate.layers.map((l) => [l.id, l]));

    const renderXStart = e.clientX - dragOffset.x;
    const renderYStart = e.clientY - dragOffset.y;
    let newRenderX = renderXStart;
    let newRenderY = renderYStart;

    const guides = [];

    const layerCenterX = newRenderX + layer.width / 2;
    const layerCenterY = newRenderY + layer.height / 2;

    currentTemplate.layers.forEach((l) => {
      if (l.id === layer.id) return;
      const abs = (() => {
        let ax = l.x;
        let ay = l.y;
        let p = l.parentId;
        while (p) {
          const par = layersMap.get(p);
          if (!par) break;
          ax += par.x;
          ay += par.y;
          p = par.parentId;
        }
        return { x: ax, y: ay };
      })();
      const otherCenterX = abs.x + l.width / 2;
      const otherCenterY = abs.y + l.height / 2;

      if (Math.abs(layerCenterX - (abs.x + l.width / 2)) <= snapThreshold) {
        newRenderX = abs.x + l.width / 2 - layer.width / 2;
        guides.push({
          x1: abs.x + l.width / 2,
          y1: 0,
          width: 1,
          height: currentTemplate.height,
        });
      }

      if (Math.abs(layerCenterY - (abs.y + l.height / 2)) <= snapThreshold) {
        newRenderY = abs.y + l.height / 2 - layer.height / 2;
        guides.push({
          x1: 0,
          y1: abs.y + l.height / 2,
          width: currentTemplate.width,
          height: 1,
        });
      }

      if (Math.abs(newRenderX - abs.x) <= snapThreshold) {
        newRenderX = abs.x;
        guides.push({
          x1: abs.x,
          y1: 0,
          width: 1,
          height: currentTemplate.height,
        });
      }

      if (Math.abs(newRenderY - abs.y) <= snapThreshold) {
        newRenderY = abs.y;
        guides.push({
          x1: 0,
          y1: abs.y,
          width: currentTemplate.width,
          height: 1,
        });
      }
    });

    setActiveGuides(guides);
    const relX = newRenderX - (parentOffset?.x || 0);
    const relY = newRenderY - (parentOffset?.y || 0);
    if (parent?.autoLayout?.enabled) return;
    writeNodePatch(layer.id, { x: relX, y: relY });
  }

  function handleMouseUp() {
    setDragging(false);
    setActiveGuides([]);
    setReorderGuide(null);
    setDraggedOverIdx(null);
  }

  const triggerMap = layer.motionTriggerMap || {};

  const runMotion = (stateKey) => {
    if (!motionStates || !controls) return;
    const next =
      motionStates[stateKey] ||
      motionStates[stateKey === "hover" ? "hovered" : stateKey === "tap" ? "pressed" : stateKey] ||
      motionStates.animate;
    if (next) controls.start(stateKey);
  };

  const interactionHandlers = {
    onMouseEnter: () => {
      triggerEvent(layer.id, "onHover");
      triggerBehavior(layer.id, "hover");
      const target = triggerMap.onHover || "hovered";
      if (motionTriggers?.includes("onHover")) runMotion(target);
    },
    onMouseLeave: () => {
      triggerEvent(layer.id, "onUnhover");
      triggerBehavior(layer.id, "hoverLeave");
      if (motionTriggers?.includes("onHover")) runMotion("initial");
    },
    onMouseDown: (e) => {
      handleMouseDown(e);
      triggerEvent(layer.id, "onPress");
      triggerBehavior(layer.id, "press");
    },
    onMouseUp: () => {
      handleMouseUp();
      triggerEvent(layer.id, "onRelease");
      triggerBehavior(layer.id, "release");
      if (motionTriggers?.includes("onClick")) runMotion("animate");
    },
    onClick: () => {
      triggerEvent(layer.id, "onClick");
      triggerBehavior(layer.id, "tap");
      const target = triggerMap.onClick || "pressed";
      if (motionTriggers?.includes("onClick")) runMotion(target);
    },
    onMouseMove: (e) => {
      handleMouseMove(e);
      triggerBehavior(layer.id, "hoverMove", {
        x: e.clientX,
        y: e.clientY,
      });
    },
  };

  const renderComponentChildren = () => {
    const nodesBase = layer.componentNodes || layer.nodes || [];
    const instance = instanceRegistry[layer.id];
    const effectiveVariant = instance?.variant || layer.variantId;
    let nodesToRender = nodesBase;
    if (effectiveVariant && layer.componentVariants) {
      const variant = layer.componentVariants.find((v) => v.id === effectiveVariant);
      if (variant) {
        nodesToRender = variant.nodes || nodesBase;
      }
    }
    const applyOverrides = (node) => {
      const overrides = instance?.overrides?.[node.id] || {};
      const slotVal = node.slotId && instance?.slotData?.[node.slotId];
      const merged = { ...node, ...overrides };
      if (slotVal !== undefined) {
        if (merged.type === "text") merged.content = slotVal;
        if (merged.type === "icon") merged.url = slotVal;
        if (merged.type === "image") merged.url = slotVal;
      }
      return merged;
    };
    return nodesToRender.map((child) => {
      const overridden = applyOverrides(child);
      return (
        <CanvasLayer
          key={`${child.id}_${layer.id}`}
          layer={overridden}
          isInstanceChild
          offset={{ x: renderX, y: renderY }}
          isComponentMaster={isComponentMaster}
          parentVariant={outboundVariant || parentVariant}
        />
      );
    });
  };

  useEffect(() => {
    if (isComponentMaster) return;
    if (layer.type !== "frame") return;
    if (!autoLayout.enabled) return;
    const children = (layer.children || [])
      .map((id) => currentTemplate.layers.find((l) => l.id === id))
      .filter(Boolean);

    let offset = autoLayout.padding;
    let crossMax = 0;

    children.forEach((child) => {
      const isVertical =
        directionOverride === "horizontal"
          ? false
          : directionOverride === "vertical"
          ? true
          : autoLayout.direction === "vertical";
      const newX = isVertical ? layer.x + autoLayout.padding : layer.x + offset;
      const newY = isVertical ? layer.y + offset : layer.y + autoLayout.padding;

      if (child.x !== newX || child.y !== newY) {
        updateLayer(child.id, { x: newX, y: newY });
      }

      offset += (isVertical ? child.height : child.width) + autoLayout.gap;
      crossMax = Math.max(crossMax, isVertical ? child.width : child.height);
    });

    if (autoLayout.hugging) {
      const hasChildren = children.length > 0;
      const mainSize = hasChildren ? offset - autoLayout.gap + autoLayout.padding : autoLayout.padding * 2;
      if (autoLayout.direction === "vertical") {
        const newHeight = mainSize;
        const newWidth = Math.max(layer.width, autoLayout.padding * 2 + crossMax);
        if (layer.height !== newHeight || layer.width !== newWidth) {
          writeNodePatch(layer.id, { height: newHeight, width: newWidth });
        }
      } else {
        const newWidth = mainSize;
        const newHeight = Math.max(layer.height, autoLayout.padding * 2 + crossMax);
        if (layer.width !== newWidth || layer.height !== newHeight) {
          writeNodePatch(layer.id, { width: newWidth, height: newHeight });
        }
      }
    }
  }, [isComponentMaster, layer, autoLayout.enabled, autoLayout.direction, autoLayout.padding, autoLayout.gap, autoLayout.hugging, currentTemplate.layers, updateLayer, writeNodePatch, layer.children, layer.width, layer.height, directionOverride]);

  useEffect(() => {
    if (isComponentMaster) return;
    if (!parent || parent.type !== "frame" || parent.autoLayout?.enabled) return;
    const c = layer.constraints || {};
    const hasOld =
      parent.oldWidth !== undefined &&
      parent.oldHeight !== undefined &&
      (parent.oldWidth !== parent.width || parent.oldHeight !== parent.height);
    if (!hasOld) return;

    const pw = parent.width;
    const ph = parent.height;
    const ratioX = pw / (parent.oldWidth || pw);
    const ratioY = ph / (parent.oldHeight || ph);

    let newX = layer.x;
    let newY = layer.y;
    let newWidth = layer.width;
    let newHeight = layer.height;

    if (c.horizontal === "right") {
      const offsetRight = parent.oldWidth - (layer.x + layer.width);
      newX = pw - (layer.width + offsetRight);
    } else if (c.horizontal === "left-right") {
      newWidth = Math.max(0, pw - layer.x * 2);
    } else if (c.horizontal === "scale") {
      newX = layer.x * ratioX;
      newWidth = layer.width * ratioX;
    }

    if (c.vertical === "bottom") {
      const offsetBottom = parent.oldHeight - (layer.y + layer.height);
      newY = ph - (layer.height + offsetBottom);
    } else if (c.vertical === "top-bottom") {
      newHeight = Math.max(0, ph - layer.y * 2);
    } else if (c.vertical === "scale") {
      newY = layer.y * ratioY;
      newHeight = layer.height * ratioY;
    }

    if (newX !== layer.x || newY !== layer.y || newWidth !== layer.width || newHeight !== layer.height) {
      writeNodePatch(layer.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    }
  }, [isComponentMaster, parent, layer, writeNodePatch]);

  const activeTheme = themes.find((t) => t._id === activeThemeId) || themes[0] || null;

  const resolveThemeColor = (token) =>
    (token && activeTheme?.tokens?.colors?.[token]) || null;

  const styleProps = (() => {
    const base = { ...(layer.props || {}) };
    if (layer.styleId) {
      const styleToken = styles?.find?.((s) => s._id === layer.styleId);
      const tokenVal = styleToken?.value || {};
      return { ...tokenVal, ...base, ...(layer.overrides || {}) };
    }
    return { ...base, ...(layer.overrides || {}) };
  })();

  const themeToken =
    layer.props?.themeToken ||
    (layer.styleId?.startsWith?.("theme-color-") ? layer.styleId.replace("theme-color-", "") : null);
  const themeColor = resolveThemeColor(themeToken);
  if (themeColor) {
    if (layer.type === "text") {
      styleProps.color = themeColor;
    } else {
      styleProps.fill = themeColor;
    }
  }

  if (visibility === "hidden") return null;

  const isArtboard = layer.type === "artboard";
  const backgroundFill = isArtboard ? "#f8fafc" : styleProps?.fill;
  const artboardBorder = isArtboard ? "2px dashed #3b82f6" : undefined;
  const artboardShadow = isArtboard
    ? "0 0 0 1px rgba(59,130,246,0.35) inset, 0 15px 60px -25px rgba(15,23,42,0.35)"
    : styleProps?.shadow;

  const style = {
    position: "absolute",
    left: renderX,
    top: renderY,
    width,
    height,
    display: isHidden ? "none" : "block",
    borderRadius: styleProps?.borderRadius || 0,
    overflow: "hidden",
    color: styleProps?.color,
    background: backgroundFill,
    boxShadow: artboardShadow,
    border: artboardBorder
      ? artboardBorder
      : styleProps?.borderWidth
        ? `${styleProps.borderWidth}px solid ${styleProps.borderColor || "#000"}`
        : undefined,
    borderRadius: styleProps?.radius ?? styleProps?.borderRadius ?? 0,
    pointerEvents: editingTextId === layer.id ? "auto" : "initial",
    outline: isSelected ? "1px dashed #3b82f6" : "none",
    cursor: layer.locked ? "not-allowed" : "move",
  };

  const attachedInstance =
    layer.componentInstanceId &&
    instanceRegistry[layer.componentInstanceId] &&
    !instanceRegistry[layer.componentInstanceId].detached;

  return (
    <MotionWrapper motionProps={motionProps}
      style={{ ...style, ...scrollStyle }}
      className="select-none"
      onMouseDown={interactionHandlers.onMouseDown}
      onMouseMove={interactionHandlers.onMouseMove}
      onMouseUp={interactionHandlers.onMouseUp}
      onMouseEnter={interactionHandlers.onMouseEnter}
      onMouseLeave={interactionHandlers.onMouseLeave}
      onClick={interactionHandlers.onClick}
      ref={ref}
    >
      {attachedInstance && !isComponentMaster && (
        <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
          Instance
        </div>
      )}
      {layer.type === "text" && (
        <div
          contentEditable={editingTextId === layer.id}
          suppressContentEditableWarning={true}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingTextId(layer.id);
          }}
          onBlur={(e) => {
            stopEditingText();
            if (layer.slotId && !isComponentMaster) {
              // update slot data on instance if applicable
              const parentInstanceId = layer.parentId || layer.componentInstanceId || null;
              if (parentInstanceId && instanceRegistry[parentInstanceId]) {
                updateInstanceSlots(parentInstanceId, { [layer.slotId]: e.target.innerText });
              }
            }
            writeNodePatch(layer.id, { content: e.target.innerText });
          }}
          onInput={(e) => {
            writeNodePatch(layer.id, { content: e.target.innerText });
            if (layer.slotId && !isComponentMaster) {
              const parentInstanceId = layer.parentId || layer.componentInstanceId || null;
              if (parentInstanceId && instanceRegistry[parentInstanceId]) {
                updateInstanceSlots(parentInstanceId, { [layer.slotId]: e.target.innerText });
              }
            }
          }}
          style={{
            fontSize: styleProps?.fontSize || 18,
            fontWeight: styleProps?.fontWeight || 400,
            color: styleProps?.color || "#000",
            outline: "none",
            cursor: editingTextId === layer.id ? "text" : "inherit",
            width: "100%",
            height: "100%",
            userSelect: editingTextId === layer.id ? "text" : "none",
          }}
        >
          {layer.content}
        </div>
      )}

      {layer.type === "rect" && <div className="w-full h-full" />}

      {layer.type === "image" && (
        <img
          src={layer.url}
          alt={layer.name || "Layer"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {layer.type === "group" && (
        <div className="w-full h-full relative">
          {(layer.children || []).map((childId) => {
            const child = isComponentMaster
              ? getComponentNode(childId)
              : currentTemplate.layers.find((c) => c.id === childId);
            if (!child) return null;
            return (
              <CanvasLayer
                key={`${child.id}_${layer.id}`}
                layer={child}
                offset={{ x: renderX, y: renderY }}
                isComponentMaster={isComponentMaster}
                parentVariant={outboundVariant || parentVariant}
              />
            );
          })}
        </div>
      )}

      {layer.type === "component-instance" && (
        <div className="w-full h-full relative">
          {renderComponentChildren()}
          {reorderGuide && reorderGuide.parentId === layer.id && (
            <>
              <div
                className="absolute pointer-events-none z-10 transition-opacity duration-150"
                style={
                  reorderGuide.axis === "y"
                    ? {
                        top: reorderGuide.pos,
                        left: reorderGuide.inset ?? 0,
                        width: reorderGuide.length || "100%",
                        height: reorderGuide.ghostSize || 8,
                        background: "rgba(88, 28, 135, 0.12)",
                        borderRadius: 6,
                        transform: "translateY(-50%)",
                      }
                    : {
                        left: reorderGuide.pos,
                        top: reorderGuide.inset ?? 0,
                        height: reorderGuide.length || "100%",
                        width: reorderGuide.ghostSize || 8,
                        background: "rgba(88, 28, 135, 0.12)",
                        borderRadius: 6,
                        transform: "translateX(-50%)",
                      }
                }
              />
              <div
                className="absolute pointer-events-none z-10 transition-opacity duration-150"
                style={
                  reorderGuide.axis === "y"
                    ? {
                        top: reorderGuide.pos,
                        left: reorderGuide.inset ?? 0,
                        width: reorderGuide.length || "100%",
                        height: 2,
                        background: "rgba(88, 28, 135, 0.9)",
                        transform: "translateY(-1px)",
                      }
                    : {
                        left: reorderGuide.pos,
                        top: reorderGuide.inset ?? 0,
                        height: reorderGuide.length || "100%",
                        width: 2,
                        background: "rgba(88, 28, 135, 0.9)",
                        transform: "translateX(-1px)",
                      }
                }
              />
            </>
          )}
        </div>
      )}
    </MotionWrapper>
  );
}

function MotionWrapper({ motionProps, children, ...rest }) {
  if (!motionProps) return <div {...rest}>{children}</div>;
  return (
    <motion.div {...motionProps} {...rest}>
      {children}
    </motion.div>
  );
}

function buildMotionProps(layer, controls, parentVariant = null) {
  const selectedAnimId = layer.motionAnimationId || layer?.animations?.[0]?.id;
  const anim =
    (layer?.animations || []).find((a) => a.id === selectedAnimId) || layer?.animations?.[0];
  if (!anim?.variants && !anim?.states && !(anim?.tracks?.length)) {
    return { motionProps: null, motionTriggers: null, motionStates: null, scrollDef: null, outboundVariant: null };
  }
  const states = anim.variants || anim.states || {};
  const triggers = anim.triggers || [];
  const currentState = layer.motionState;
  const playTimelineOnLoad = anim.playTimelineOnLoad;
  const tracks = anim.tracks || [];

  const splitState = (state) => {
    if (!state) return [undefined, undefined];
    const { transition: transObj, duration, delay, ease, easing, type, ...rest } = state;
    const transition = { ...(transObj || {}) };
    if (duration !== undefined) transition.duration = duration;
    if (delay !== undefined) transition.delay = delay;
    if (type) transition.type = type;
    if (ease || easing) transition.ease = ease || easing;
    return [rest, Object.keys(transition).length ? transition : undefined];
  };

  const [initial, initialTransition] = splitState(states.initial);
  const [animate, animateTransition] = splitState(states.animate);
  const [hover, hoverTransition] = splitState(states.hover);
  const [tap, tapTransition] = splitState(states.tap);
  const [exit, exitTransition] = splitState(states.exit);
  const [inView, inViewTransition] = splitState(states.inView);

  const useScroll = anim.scroll || triggers.includes("scroll") || triggers.includes("onScroll") || Boolean(inView);
  const needsControls = triggers.includes("onClick") || triggers.includes("onHover") || currentState;

  const motionProps = {
    initial: states.initial ? "initial" : initial,
    animate: needsControls
      ? currentState || controls
      : states.animate
        ? "animate"
        : animate,
    exit: states.exit ? "exit" : exit,
    transition: animateTransition || initialTransition,
    whileHover: states.hover ? "hover" : states.hovered ? "hovered" : hover,
    whileTap: states.tap ? "tap" : states.pressed ? "pressed" : tap,
    variants: Object.keys(states).length ? states : undefined,
  };

  if (hoverTransition) motionProps.whileHover = { ...hover, transition: hoverTransition };
  if (tapTransition) motionProps.whileTap = { ...tap, transition: tapTransition };
  if (exitTransition) motionProps.exit = { ...exit, transition: exitTransition };

  // Parent -> child mapping
  if (parentVariant && layer.variantMapping && typeof motionProps.animate === "string") {
    const mapped = layer.variantMapping[parentVariant];
    if (mapped) {
      motionProps.animate = mapped;
    }
  }

  if (useScroll || inView) {
    motionProps.whileInView = inView || animate || initial;
    motionProps.viewport = { once: false, amount: 0.2 };
    if (inViewTransition) motionProps.transition = inViewTransition;
  }

  if (playTimelineOnLoad && tracks.length) {
    motionProps.initial = undefined;
    motionProps.animate = controls;
    motionProps.variants = undefined;
    motionProps.transition = undefined;
  }

  const outboundVariant =
    layer.motionPropagate || layer.propagateVariants || layer.propagate
      ? (typeof motionProps.animate === "string" ? motionProps.animate : currentState || "animate")
      : null;

  return {
    motionProps,
    motionTriggers: triggers,
    motionStates: states,
    scrollDef: anim.scroll || null,
    timeline: playTimelineOnLoad ? tracks : null,
    outboundVariant,
  };
}

function buildScrollStyle(scrollDef, scrollYProgress) {
  if (!scrollDef || !scrollYProgress) return {};
  const input = Array.isArray(scrollDef.inputRange) ? scrollDef.inputRange : [0, 1];
  const output = scrollDef.outputRange || {};
  const style = {};
  Object.entries(output).forEach(([prop, values]) => {
    if (Array.isArray(values)) {
      style[prop] = useTransform(scrollYProgress, input, values);
    }
  });
  return style;
}

function buildTimelineSequence(tracks = []) {
  const sequence = [];
  const grouped = {};
  tracks.forEach((track) => {
    const prop = track.property || "";
    (track.keyframes || []).forEach((kf) => {
      const t = kf.t ?? kf.time ?? 0;
      if (!grouped[t]) grouped[t] = { props: {}, meta: {} };
      const val =
        kf.value !== undefined ? kf.value : { x: kf.x, y: kf.y, opacity: kf.opacity };
      grouped[t].props[prop] = val;
      grouped[t].meta[prop] = {
        ease: kf.easing || kf.ease,
        duration: kf.duration,
      };
      if (kf.rotateX !== undefined) grouped[t].props.rotateX = kf.rotateX;
      if (kf.rotateY !== undefined) grouped[t].props.rotateY = kf.rotateY;
      if (kf.rotateZ !== undefined) grouped[t].props.rotateZ = kf.rotateZ;
    });
  });
  const times = Object.keys(grouped)
    .map((t) => Number(t))
    .sort((a, b) => a - b);
  times.forEach((t, idx) => {
    const entry = grouped[t];
    const nextT = times[idx + 1];
    const baseDurationMs = nextT !== undefined ? Math.max(1, nextT - t) : 300;
    const transition = {};
    Object.entries(entry.meta || {}).forEach(([prop, meta]) => {
      const durMs = meta.duration !== undefined ? meta.duration : baseDurationMs;
      const ease = meta.ease;
      transition[prop] = {
        duration: Math.max(0.01, durMs / 1000),
        ...(ease ? { ease } : {}),
      };
    });
    if (!Object.keys(transition).length) {
      transition.duration = Math.max(0.01, baseDurationMs / 1000);
    }
    sequence.push({ ...entry.props, transition });
  });
  return sequence;
}
