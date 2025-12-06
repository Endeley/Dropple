"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePageTransitions } from "@/zustand/usePageTransitions";

const TransitionContext = createContext({ navigate: (href) => href });

export const useTransitionNav = () => useContext(TransitionContext);

export function TransitionRouter({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { runPageTransition, setCurrentRef } = usePageTransitions((s) => ({
    runPageTransition: s.runPageTransition,
    setCurrentRef: s.setCurrentRef,
  }));
  const pageRef = useRef(null);

  useEffect(() => {
    setCurrentRef(pageRef);
  }, [setCurrentRef]);

  const navigate = async (href) => {
    await runPageTransition({
      from: pathname,
      to: href,
      push: () => router.push(href),
    });
  };

  return (
    <TransitionContext.Provider value={{ navigate, pageRef }}>
      <div ref={pageRef} data-transition-page className="min-h-screen">
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
