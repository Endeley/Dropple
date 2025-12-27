"use client";

import { normalizeSpans } from "./applyEdit";

export function applyStyleToRange(spans = [], startIndex = 0, endIndex = 0, newStyle = {}) {
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);

  let charCount = 0;
  const next = [];

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const spanStart = charCount;
    const spanEnd = charCount + (span.text?.length || 0);

    const overlaps = !(spanEnd <= start || spanStart >= end);

    if (!overlaps) {
      next.push({ ...span });
    } else {
      const localStart = Math.max(start - spanStart, 0);
      const localEnd = Math.min(end - spanStart, span.text.length);

      if (localStart > 0) {
        next.push({
          ...span,
          text: span.text.slice(0, localStart),
        });
      }

      next.push({
        ...span,
        ...newStyle,
        text: span.text.slice(localStart, localEnd),
      });

      if (localEnd < span.text.length) {
        next.push({
          ...span,
          text: span.text.slice(localEnd),
        });
      }
    }

    charCount = spanEnd;
  }

  return normalizeSpans(next);
}

export const toggleBold = (spans, start, end) => applyStyleToRange(spans, start, end, { fontWeight: 700 });
export const toggleItalic = (spans, start, end) => applyStyleToRange(spans, start, end, { italic: true });
export const toggleUnderline = (spans, start, end) => applyStyleToRange(spans, start, end, { underline: true });
export const setFontSize = (spans, start, end, size) => applyStyleToRange(spans, start, end, { fontSize: size });
export const setColor = (spans, start, end, color) => applyStyleToRange(spans, start, end, { color });
export const setFontFamily = (spans, start, end, family) =>
  applyStyleToRange(spans, start, end, { fontFamily: family });
