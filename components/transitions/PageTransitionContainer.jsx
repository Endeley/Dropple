"use client";

import { useEffect, useRef } from "react";
import { usePageTransitions } from "@/zustand/usePageTransitions";

export default function PageTransitionContainer({ children, as: Tag = "div", className = "" }) {
  const ref = useRef(null);
  const { setNextRef } = usePageTransitions((s) => ({ setNextRef: s.setNextRef }));

  useEffect(() => {
    setNextRef(ref);
  }, [setNextRef]);

  return (
    <Tag ref={ref} data-transition-target className={className}>
      {children}
    </Tag>
  );
}
