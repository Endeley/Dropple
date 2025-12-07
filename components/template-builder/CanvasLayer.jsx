/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
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
  } = useTemplateBuilderStore();

  const ref = useRef(null);
  const { register, unregister } = useComponentRegistry((state) => ({
    register: state.register,
    unregister: state.unregister,
  }));
  const { upsertNode, removeNode } = useSceneGraph((state) => ({
    upsertNode: state.upsertNode,
    removeNode: state.removeNode,
  }));
  const { triggerEvent, loadMachine } = useStateMachine((state) => ({
    triggerEvent: state.triggerEvent,
    loadMachine: state.loadMachine,
  }));
  const { trigger: triggerBehavior, loadBehaviors } = useBehaviorsStore((state) => ({
    trigger: state.trigger,
    loadBehaviors: state.loadBehaviors,
  }));
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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

  function handleMouseDown(e) {
    if (editingTextId === layer.id) return;
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
      setActiveGuides([]);
    }
  }

  function handleMouseMove(e) {
    if (
      !dragging ||
      editingTextId === layer.id ||
      isInstanceChild ||
      (parent && parent.type === "frame" && parent.autoLayout?.enabled) ||
      layer.locked
    )
      return;
    e.preventDefault();
    if (isComponentMaster) {
      setActiveGuides([]);
      const relX = e.clientX - dragOffset.x - (parentOffset?.x || 0);
      const relY = e.clientY - dragOffset.y - (parentOffset?.y || 0);
      updateLayer(layer.id, { x: relX, y: relY });
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
    updateLayer(layer.id, { x: relX, y: relY });
  }

  function handleMouseUp() {
    setDragging(false);
    setActiveGuides([]);
  }

  const interactionHandlers = {
    onMouseEnter: () => {
      triggerEvent(layer.id, "onHover");
      triggerBehavior(layer.id, "hover");
    },
    onMouseLeave: () => {
      triggerEvent(layer.id, "onUnhover");
      triggerBehavior(layer.id, "hoverLeave");
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
    },
    onClick: () => {
      triggerEvent(layer.id, "onClick");
      triggerBehavior(layer.id, "tap");
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
    let nodesToRender = nodesBase;
    if (layer.variantId && layer.componentVariants) {
      const variant = layer.componentVariants.find((v) => v.id === layer.variantId);
      if (variant) {
        nodesToRender = variant.nodes || nodesBase;
      }
    }
    return nodesToRender.map((child) => (
      <CanvasLayer
        key={`${child.id}_${layer.id}`}
        layer={child}
        isInstanceChild
        offset={{ x: renderX, y: renderY }}
        isComponentMaster={isComponentMaster}
      />
    ));
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
          updateLayer(layer.id, { height: newHeight, width: newWidth });
        }
      } else {
        const newWidth = mainSize;
        const newHeight = Math.max(layer.height, autoLayout.padding * 2 + crossMax);
        if (layer.width !== newWidth || layer.height !== newHeight) {
          updateLayer(layer.id, { width: newWidth, height: newHeight });
        }
      }
    }
  }, [isComponentMaster, layer, autoLayout.enabled, autoLayout.direction, autoLayout.padding, autoLayout.gap, autoLayout.hugging, currentTemplate.layers, updateLayer, layer.children, layer.width, layer.height, directionOverride]);

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
      updateLayer(layer.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    }
  }, [isComponentMaster, parent, layer, updateLayer]);

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

  const responsiveOverride = layer.responsive?.[activeBreakpoint] || {};
  const width = responsiveOverride.width ?? layer.width;
  const height = responsiveOverride.height ?? layer.height;
  const directionOverride = responsiveOverride.autoLayout?.direction;
  const visibility = responsiveOverride.visibility || "inherit";
  if (visibility === "hidden") return null;

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
    background: styleProps?.fill,
    boxShadow: styleProps?.shadow,
    border: styleProps?.borderWidth
      ? `${styleProps.borderWidth}px solid ${styleProps.borderColor || "#000"}`
      : undefined,
    borderRadius: styleProps?.radius ?? styleProps?.borderRadius ?? 0,
    pointerEvents: editingTextId === layer.id ? "auto" : "initial",
    outline: isSelected ? "1px dashed #3b82f6" : "none",
    cursor: layer.locked ? "not-allowed" : "move",
  };

  return (
    <div
      style={style}
      className="select-none"
      onMouseDown={interactionHandlers.onMouseDown}
      onMouseMove={interactionHandlers.onMouseMove}
      onMouseUp={interactionHandlers.onMouseUp}
      onMouseEnter={interactionHandlers.onMouseEnter}
      onMouseLeave={interactionHandlers.onMouseLeave}
      onClick={interactionHandlers.onClick}
      ref={ref}
    >
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
            updateLayer(layer.id, { content: e.target.innerText });
          }}
          onInput={(e) => {
            updateLayer(layer.id, { content: e.target.innerText });
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
              />
            );
          })}
        </div>
      )}

      {layer.type === "component-instance" && (
        <div className="w-full h-full relative">
          {renderComponentChildren()}
        </div>
      )}
    </div>
  );
}
