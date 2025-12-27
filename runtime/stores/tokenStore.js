"use client";

import { create } from "zustand";

const defaultTokens = {
  modes: ["light", "dark"],
  mode: "light",
  colors: {
    primary: { light: { value: "#7c3aed" }, dark: { value: "#a78bfa" } },
    surface: { light: { value: "#ffffff" }, dark: { value: "#111827" } },
    text: { light: { value: "#111827" }, dark: { value: "#f9fafb" } },
    accent: { light: { value: "#22d3ee" }, dark: { value: "#06b6d4" } },
    danger: { light: { value: "#ef4444" }, dark: { value: "#f87171" } },
  },
  spacing: {
    xs: { value: 4 },
    sm: { value: 8 },
    md: { value: 16 },
    lg: { value: 24 },
    xl: { value: 32 },
  },
  radius: {
    sm: { value: 4 },
    md: { value: 8 },
    lg: { value: 16 },
    full: { value: 9999 },
  },
  typography: {
    fontFamily: { value: "Inter" },
    fontSize: {
      xs: { value: 12 },
      sm: { value: 14 },
      base: { value: 16 },
      lg: { value: 20 },
      xl: { value: 24 },
    },
    fontWeight: {
      regular: { value: 400 },
      medium: { value: 500 },
      bold: { value: 700 },
    },
    lineHeight: {
      tight: { value: 1.1 },
      normal: { value: 1.4 },
      relaxed: { value: 1.6 },
    },
  },
  shadows: {
    sm: { value: "0 1px 2px rgba(0,0,0,0.08)" },
    md: { value: "0 4px 6px rgba(0,0,0,0.10)" },
    lg: { value: "0 10px 20px rgba(0,0,0,0.12)" },
  },
};

export const useTokenStore = create((set, get) => ({
  tokens: defaultTokens,
  getTokenValue: (path) => resolveToken(get().tokens, path),
  setMode: (mode) =>
    set((state) => ({
      tokens: { ...state.tokens, mode },
    })),
  updateToken: (path, valueByMode) =>
    set((state) => {
      const tokens = structuredClone(state.tokens);
      setNested(tokens, path.split("."), valueByMode);
      return { tokens };
    }),
}));

const resolveToken = (tokens, path) => {
  if (!path) return undefined;
  const parts = path.split(".");
  let current = tokens;
  for (const p of parts) {
    current = current?.[p];
    if (!current) return undefined;
  }
  if (current.value !== undefined) return current.value;
  const mode = tokens.mode || "light";
  if (current[mode]) return current[mode].value;
  if (current.light) return current.light.value;
  return undefined;
};

const setNested = (obj, parts, value) => {
  let cur = obj;
  parts.slice(0, -1).forEach((p) => {
    cur[p] = cur[p] || {};
    cur = cur[p];
  });
  cur[parts[parts.length - 1]] = value;
};
