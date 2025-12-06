"use client";

import { useEffect, useRef } from "react";
import { useComponentRegistry } from "@/zustand/useComponentRegistry";

export default function AnimatedLayer({ id, children, className = "", style = {}, ...rest }) {
  const ref = useRef(null);
  const { register, unregister } = useComponentRegistry((state) => ({
    register: state.register,
    unregister: state.unregister,
  }));

  useEffect(() => {
    if (!id) return;
    register(id, ref);
    return () => unregister(id);
  }, [id, register, unregister]);

  return (
    <div
      ref={ref}
      className={`absolute ${className}`}
      style={style}
      data-animated-layer={id}
      {...rest}
    >
      {children}
    </div>
  );
}
