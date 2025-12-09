"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";

function decodeTemplate(searchParams) {
  const raw = searchParams.get("tpl");
  if (!raw) return null;
  try {
    const json = decodeURIComponent(raw);
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode template", err);
    return null;
  }
}

function buildMotionProps(layer) {
  const anim = (layer.animations || [])[0];
  if (!anim) return {};
  const props = {};
  if (anim.variants) props.variants = anim.variants;
  if (anim.triggers?.includes("onLoad") && anim.variants?.initial) {
    props.initial = "initial";
    props.animate = "animate";
  }
  if (anim.triggers?.includes("onHover") && anim.variants?.hover) {
    props.whileHover = "hover";
  }
  if (anim.triggers?.includes("onClick") && anim.variants?.tap) {
    props.whileTap = "tap";
  }
  return props;
}

function Layer({ layer }) {
  const style = {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    background: layer.props?.fill,
    color: layer.props?.color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: layer.props?.borderRadius || layer.props?.radius || 0,
  };
  const motionProps = buildMotionProps(layer);

  if (layer.type === "text") {
    return (
      <motion.div {...motionProps} style={{ ...style, background: "transparent", padding: 8, textAlign: "left" }}>
        <div
          style={{
            fontSize: layer.props?.fontSize || 24,
            fontWeight: layer.props?.fontWeight || 600,
            color: layer.props?.color || "#fff",
            fontFamily: layer.props?.fontFamily || "Inter, sans-serif",
            width: "100%",
          }}
        >
          {layer.content || layer.props?.text || "Text"}
        </div>
      </motion.div>
    );
  }

  if (layer.type === "image") {
    return (
      <motion.div {...motionProps} style={style}>
        <img
          src={layer.url}
          alt={layer.name || "image"}
          style={{ width: "100%", height: "100%", objectFit: layer.props?.fit || "cover" }}
        />
      </motion.div>
    );
  }

  return <motion.div {...motionProps} style={style} />;
}

export default function RenderPage() {
  const searchParams = useSearchParams();
  const template = useMemo(() => decodeTemplate(searchParams), [searchParams]);
  if (!template) return <div>Missing template</div>;
  return (
    <div
      style={{
        position: "relative",
        width: template.width || 1080,
        height: template.height || 1080,
        background: template.background || "#0b1729",
        overflow: "hidden",
      }}
    >
      {(template.layers || []).map((l) => (
        <Layer key={l.id} layer={l} />
      ))}
    </div>
  );
}
