"use client";

const getGraphemes = (text) => {
  try {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(text)).map((s) => s.segment);
    }
  } catch (e) {
    /* ignore */
  }
  return text ? Array.from(text) : [];
};

const measureToken = (ctx, text, style) => {
  ctx.font = `${style.fontWeight || 400} ${style.fontSize || 16}px ${style.fontFamily || "Inter"}`;
  const metrics = ctx.measureText(text);
  const letterSpacing = style.letterSpacing || 0;
  return metrics.width + letterSpacing * Math.max(0, text.length - 1);
};

export function computeLayout(spans = [], maxWidth = Infinity) {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const ctx = canvas ? canvas.getContext("2d") : null;
  if (!ctx) return { charMap: [], lines: [], height: 0 };

  const charMap = [];
  const lines = [];
  let currentLine = { runs: [], y: 0, lineHeight: 0 };
  let x = 0;
  let y = 0;
  let charIndex = 0;

  const pushLine = () => {
    lines.push({ ...currentLine });
    y += currentLine.lineHeight;
    currentLine = { runs: [], y, lineHeight: 0 };
    x = 0;
  };

  const ensureLineHeight = (style) => {
    const fontSize = style.fontSize || 16;
    const lh = (style.lineHeight || 1.4) * fontSize;
    currentLine.lineHeight = Math.max(currentLine.lineHeight, lh);
    return lh;
  };

  spans.forEach((span, spanIndex) => {
    const style = {
      fontFamily: span.fontFamily || "Inter",
      fontSize: span.fontSize || 16,
      fontWeight: span.fontWeight || 400,
      color: span.color || "#fff",
      italic: span.italic || false,
      underline: span.underline || false,
      letterSpacing: span.letterSpacing || 0,
      lineHeight: span.lineHeight || 1.4,
    };

    const graphemes = getGraphemes(span.text || "");
    if (graphemes.length === 0) return;

    const tokens = (span.text || "").match(/(\s+|\S+)/g) || [span.text];
    let gIndex = 0;

    tokens.forEach((tok) => {
      const tokGraphemes = getGraphemes(tok);
      const width = measureToken(ctx, tok, style);
      const tokenFits = x + width <= maxWidth || x === 0 || maxWidth === Infinity;

      const applyToken = () => {
        const runText = tokGraphemes.join("");
        currentLine.runs.push({ text: runText, style });
        const lh = ensureLineHeight(style);
        tokGraphemes.forEach((g) => {
          const gWidth = measureToken(ctx, g, style);
          charMap.push({
            char: g,
            x,
            y,
            width: gWidth,
            height: lh,
            spanIndex,
            charIndex,
          });
          x += gWidth;
          charIndex += 1;
        });
      };

      if (tokenFits) {
        applyToken();
      } else {
        // break line before this token if line already has content
        if (currentLine.runs.length) {
          pushLine();
        }
        // If token itself longer than maxWidth, break by grapheme
        let partial = "";
        let partialWidth = 0;
        tokGraphemes.forEach((g) => {
          const gWidth = measureToken(ctx, g, style);
          if (partialWidth + gWidth > maxWidth && partial.length > 0) {
            // commit partial
            currentLine.runs.push({ text: partial, style });
            const lh = ensureLineHeight(style);
            partial.split("").forEach((gg) => {
              const gw = measureToken(ctx, gg, style);
              charMap.push({
                char: gg,
                x,
                y,
                width: gw,
                height: lh,
                spanIndex,
                charIndex,
              });
              x += gw;
              charIndex += 1;
            });
            pushLine();
            partial = g;
            partialWidth = gWidth;
          } else {
            partial += g;
            partialWidth += gWidth;
          }
        });
        if (partial) {
          currentLine.runs.push({ text: partial, style });
          const lh = ensureLineHeight(style);
          partial.split("").forEach((gg) => {
            const gw = measureToken(ctx, gg, style);
            charMap.push({
              char: gg,
              x,
              y,
              width: gw,
              height: lh,
              spanIndex,
              charIndex,
            });
            x += gw;
            charIndex += 1;
          });
        }
      }
      gIndex += tokGraphemes.length;
    });
  });

  if (currentLine.runs.length) {
    pushLine();
  }

  const totalHeight = lines.reduce((sum, l) => sum + (l.lineHeight || 0), 0);
  return { charMap, lines, height: totalHeight };
}
