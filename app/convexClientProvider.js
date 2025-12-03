"use client";

import { Suspense } from "react";
import { useUser } from "@stackframe/stack";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { stackClientApp } from "../stack/client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convexClient = new ConvexReactClient(convexUrl);
const fetchAccessToken = stackClientApp.getConvexClientAuth({
  tokenStore: "nextjs-cookie",
});

function useStackConvexAuth() {
  const user = useUser({ or: "return-null" });

  return {
    isLoading: false,
    isAuthenticated: !!user,
    fetchAccessToken,
  };
}

export function ConvexClientProvider({ children }) {
  return (
    <Suspense fallback={null}>
      <ConvexProviderWithAuth client={convexClient} useAuth={useStackConvexAuth}>
        {children}
      </ConvexProviderWithAuth>
    </Suspense>
  );
}
