import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspaceStore } from "./useWorkspaceStore";

export function useWorkspaceSync() {
  const liveWs = useQuery(api.workspace.watchWorkspace);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  useEffect(() => {
    if (liveWs?.data) {
      setWorkspace(liveWs.data);
    }
  }, [liveWs, setWorkspace]);

  return liveWs?.data || null;
}
