"use client";

import { Section } from "@/components/properties/Section";
import { useTextEditStore } from "@/zustand/textEditStore";
import { applyStyleToRange } from "@/lib/text/applyStyleToRange";
import { computeLayout } from "@/lib/text/layoutEngine";
import { computeMixedSelectionStyle } from "@/lib/text/selectionStyle";
import { useNodeTreeStore } from "@/zustand/nodeTreeStore";

const inputClass =
  "w-full bg-white border border-neutral-200 rounded-md px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition";
const pillButton = (active) =>
  `px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
    active
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-200 hover:bg-violet-50"
  }`;

export function SpanTypographyPanel({ node }) {
  const selectionStart = useTextEditStore((s) => s.selectionStart);
  const selectionEnd = useTextEditStore((s) => s.selectionEnd);
  const updateNode = useNodeTreeStore((s) => s.updateNode);

  const styles = computeMixedSelectionStyle(node.spans || [], selectionStart ?? 0, selectionEnd ?? 0);

  const applyStyle = (styleObj) => {
    const newSpans = applyStyleToRange(node.spans || [], selectionStart ?? 0, selectionEnd ?? 0, styleObj);
    const layout = computeLayout(newSpans, node.width || 200);
    updateNode(node.id, { spans: newSpans, height: layout.height });
  };

  return (
    <Section title="Typography (Selected Text)">
      <div className="grid grid-cols-2 gap-2">
        <input
          className={inputClass}
          placeholder="Font Family"
          value={styles.fontFamily === "mixed" ? "" : styles.fontFamily || ""}
          onChange={(e) => applyStyle({ fontFamily: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Font Size"
          value={styles.fontSize === "mixed" ? "" : styles.fontSize || ""}
          onChange={(e) => applyStyle({ fontSize: parseFloat(e.target.value || "0") || 0 })}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <input
          className={inputClass}
          placeholder="Weight"
          value={styles.fontWeight === "mixed" ? "" : styles.fontWeight || ""}
          onChange={(e) => applyStyle({ fontWeight: e.target.value })}
        />
        <input
          className={inputClass}
          type="color"
          value={typeof styles.color === "string" ? styles.color : "#000000"}
          onChange={(e) => applyStyle({ color: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Letter Spacing"
          value={styles.letterSpacing === "mixed" ? "" : styles.letterSpacing || ""}
          onChange={(e) => applyStyle({ letterSpacing: parseFloat(e.target.value || "0") || 0 })}
        />
      </div>

      <div className="flex items-center gap-2">
        <button className={pillButton(!!styles.italic && styles.italic !== "mixed")} onClick={() => applyStyle({ italic: !styles.italic })}>
          Italic
        </button>
        <button className={pillButton(!!styles.underline && styles.underline !== "mixed")} onClick={() => applyStyle({ underline: !styles.underline })}>
          Underline
        </button>
        <button className={pillButton(styles.fontWeight === 700)} onClick={() => applyStyle({ fontWeight: styles.fontWeight === 700 ? 400 : 700 })}>
          Bold
        </button>
      </div>
    </Section>
  );
}
