"use client";

import { useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function ConvexUserSync() {
  const user = useUser({ or: "return-null" });
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (!user) return;
    ensureUser().catch((err) =>
      console.error("Failed to sync user to Convex:", err),
    );
  }, [user, ensureUser]);

  return null;
}

export function UserProvider({ children }) {
  return (
    <>
      <ConvexUserSync />
      {children}
    </>
  );
}
