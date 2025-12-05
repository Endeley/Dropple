"use client";

import { componentLibrary } from "./library";
import { resolveComponentVariant } from "../utils/resolveComponentVariant";

export default function ComponentNodeRenderer({ node, styleOverride }) {
  const comp = componentLibrary.find((c) => c.id === node.componentId);
  if (!comp) return null;

  const styles = resolveComponentVariant(comp, node);

  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.width || comp.width,
        height: node.height || comp.height,
        transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
        ...styleOverride,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: styles.background,
          borderRadius: styles.radius ?? 8,
          borderWidth: styles.borderWidth || 0,
          borderStyle: styles.borderWidth ? "solid" : "none",
          borderColor: styles.borderColor || "transparent",
          opacity: styles.opacity ?? 1,
          transform: styles.scale ? `scale(${styles.scale})` : "scale(1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: styles.color,
          fontSize: styles.fontSize || 14,
          fontWeight: 600,
          padding: styles.paddingX ? `0 ${styles.paddingX}px` : "0 16px",
        }}
      >
        {styles.text || node.overrides?.text || comp.props?.text}
      </div>
    </div>
  );
}
