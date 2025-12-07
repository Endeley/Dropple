"use client";

export function computeMixedSelectionStyle(spans = [], startIndex = 0, endIndex = 0) {
  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);
  const sets = {
    fontFamily: new Set(),
    fontSize: new Set(),
    fontWeight: new Set(),
    color: new Set(),
    italic: new Set(),
    underline: new Set(),
    letterSpacing: new Set(),
    lineHeight: new Set(),
  };

  let count = 0;
  spans.forEach((span) => {
    const len = span.text?.length || 0;
    const spanStart = count;
    const spanEnd = count + len;
    const overlapStart = Math.max(start, spanStart);
    const overlapEnd = Math.min(end, spanEnd);
    if (overlapStart < overlapEnd) {
      sets.fontFamily.add(span.fontFamily);
      sets.fontSize.add(span.fontSize);
      sets.fontWeight.add(span.fontWeight);
      sets.color.add(span.color);
      sets.italic.add(span.italic);
      sets.underline.add(span.underline);
      sets.letterSpacing.add(span.letterSpacing);
      sets.lineHeight.add(span.lineHeight);
    }
    count = spanEnd;
  });

  const getValue = (set) => (set.size === 1 ? [...set][0] : "mixed");

  return {
    fontFamily: getValue(sets.fontFamily),
    fontSize: getValue(sets.fontSize),
    fontWeight: getValue(sets.fontWeight),
    color: getValue(sets.color),
    italic: getValue(sets.italic),
    underline: getValue(sets.underline),
    letterSpacing: getValue(sets.letterSpacing),
    lineHeight: getValue(sets.lineHeight),
  };
}
