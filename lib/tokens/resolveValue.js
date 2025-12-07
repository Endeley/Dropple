"use client";

import { useTokenStore } from "@/zustand/tokenStore";

export const resolveValue = (value) => {
  if (value && typeof value === "object" && value.token) {
    const getTokenValue = useTokenStore.getState().getTokenValue;
    return getTokenValue(value.token) ?? value.fallback ?? null;
  }
  return value;
};
