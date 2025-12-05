import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresenceSync({ projectId, userId, agent, cursor }) {
  const update = useMutation(api.presence.updatePresence);

  useEffect(() => {
    if (!projectId || !cursor) return;
    update({
      projectId,
      cursor,
      selection: [],
    }).catch(() => {});
  }, [projectId, cursor, update]);
}
