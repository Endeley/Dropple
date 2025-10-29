/**
 * deriveModeTheme converts a mode accent into a cohesive palette for the workspace shell.
 *
 * Returned fields map directly to CSS custom properties that we spread on the workspace root.
 *  - accent / accentHex: primary accent in rgba/hex form
 *  - accentSoft: low alpha accent for hover / backgrounds
 *  - toolbarBg / sidebarBg / panelBg: surface colours for chrome
 *  - border: neutral border tone derived from accent
 *  - canvasBg / canvasOverlay: values consumed by the canvas layers
 *
 * By centralising the mixing logic we ensure every panel, overlay, and canvas can opt-in via
 * CSS variables without hard-coded rgba values. Any new surface should prefer the vars we"ll spread from WorkspacePage.
 */
'use client';

const BASE_SURFACE = { r: 15, g: 23, b: 42 }; // #0f172a
const BASE_CANVAS = { r: 2, g: 6, b: 23 }; // #020617
const WHITE = { r: 248, g: 250, b: 252 }; // slate-50

const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

const hexToRgb = (hex) => {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return { r: 99, g: 102, b: 241 };
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return { r, g, b };
};

const mixRgb = (colorA, colorB, ratio) => {
    const clampRatio = Math.max(0, Math.min(1, ratio));
    const invert = 1 - clampRatio;
    return {
        r: clampChannel(colorA.r * clampRatio + colorB.r * invert),
        g: clampChannel(colorA.g * clampRatio + colorB.g * invert),
        b: clampChannel(colorA.b * clampRatio + colorB.b * invert),
    };
};

const rgbToString = ({ r, g, b }, alpha = 1) => `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${Math.max(0, Math.min(1, alpha))})`;

export const deriveModeTheme = (accentHex) => {
    const accent = hexToRgb(accentHex);
    const toolbar = mixRgb(accent, BASE_SURFACE, 0.45);
    const sidebar = mixRgb(accent, BASE_SURFACE, 0.35);
    const panel = mixRgb(accent, BASE_SURFACE, 0.3);
    const canvas = mixRgb(accent, BASE_CANVAS, 0.25);
    const canvasOverlay = mixRgb(accent, WHITE, 0.18);
    const border = mixRgb(accent, WHITE, 0.35);
    const accentSoft = mixRgb(accent, WHITE, 0.2);

    return {
        accent: rgbToString(accent),
        accentHex,
        accentRgb: accent,
        accentSoft: rgbToString(accentSoft, 0.3),
        toolbarBg: rgbToString(toolbar, 0.92),
        sidebarBg: rgbToString(sidebar, 0.88),
        panelBg: rgbToString(panel, 0.86),
        border: rgbToString(border, 0.5),
        canvasBg: rgbToString(canvas, 1),
        canvasOverlay: rgbToString(canvasOverlay, 0.12),
        textPrimary: 'rgba(248, 250, 252, 0.96)',
        textMuted: 'rgba(226, 232, 240, 0.75)',
    };
};
