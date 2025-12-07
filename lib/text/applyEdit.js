"use client";

const sameStyle = (a, b) =>
  a.fontFamily === b.fontFamily &&
  a.fontWeight === b.fontWeight &&
  a.fontSize === b.fontSize &&
  a.color === b.color &&
  a.italic === b.italic &&
  a.underline === b.underline &&
  a.letterSpacing === b.letterSpacing &&
  a.lineHeight === b.lineHeight;

export const normalizeSpans = (spans = []) => {
  const result = [];
  for (let i = 0; i < spans.length; i++) {
    const s = spans[i];
    if (!s?.text?.length) continue;
    const last = result[result.length - 1];
    if (last && sameStyle(last, s)) {
      last.text += s.text;
    } else {
      result.push({ ...s });
    }
  }
  return result.length ? result : [{ text: "", fontSize: 16, fontWeight: 400, fontFamily: "Inter", color: "#fff" }];
};

export const findSpanPosition = (spans = [], caretIndex = 0) => {
  let count = 0;
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const len = span.text?.length || 0;
    if (caretIndex <= count + len) {
      return { spanIndex: i, offset: caretIndex - count };
    }
    count += len;
  }
  const lastIndex = Math.max(0, spans.length - 1);
  return { spanIndex: lastIndex, offset: (spans[lastIndex]?.text?.length || 0) };
};

export const deleteSelection = (spans = [], start = 0, end = 0) => {
  const selStart = Math.min(start, end);
  const selEnd = Math.max(start, end);
  if (selStart === selEnd) return spans;

  const newSpans = spans.map((s) => ({ ...s }));
  let count = 0;

  for (let i = 0; i < newSpans.length; i++) {
    const s = newSpans[i];
    const len = s.text?.length || 0;
    const nextCount = count + len;

    const overlapStart = Math.max(selStart, count);
    const overlapEnd = Math.min(selEnd, nextCount);

    if (overlapStart < overlapEnd) {
      const localStart = overlapStart - count;
      const localEnd = overlapEnd - count;
      s.text = (s.text || "").slice(0, localStart) + (s.text || "").slice(localEnd);
    }

    count = nextCount;
  }

  return normalizeSpans(newSpans);
};

export const insertChar = (spans = [], caretIndex = 0, selection = null, char = "", styleOverride = {}) => {
  let working = spans.map((s) => ({ ...s }));
  let caret = caretIndex;

  if (selection && selection.start !== selection.end) {
    working = deleteSelection(working, selection.start, selection.end);
    caret = Math.min(selection.start, selection.end);
  }

  const { spanIndex, offset } = findSpanPosition(working, caret);
  const span = working[spanIndex] || working[working.length - 1] || {
    text: "",
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: 400,
    color: "#fff",
  };

  const before = (span.text || "").slice(0, offset);
  const after = (span.text || "").slice(offset);
  const newSpan = { ...span, ...styleOverride, text: before + char + after };

  working.splice(spanIndex, 1, newSpan);
  const normalized = normalizeSpans(working);

  return { spans: normalized, newCaret: caret + char.length };
};

export const deleteRange = (spans = [], start = 0, end = 0) => {
  const result = deleteSelection(spans, start, end);
  return { spans: result, newCaret: Math.min(start, end) };
};

export const backspace = (spans = [], caretIndex = 0, selection = null) => {
  if (selection && selection.start !== selection.end) {
    return deleteRange(spans, selection.start, selection.end);
  }
  if (caretIndex === 0) return { spans, newCaret: 0 };
  return deleteRange(spans, caretIndex - 1, caretIndex);
};

export const forwardDelete = (spans = [], caretIndex = 0, selection = null) => {
  if (selection && selection.start !== selection.end) {
    return deleteRange(spans, selection.start, selection.end);
  }
  return deleteRange(spans, caretIndex, caretIndex + 1);
};
