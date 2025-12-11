"use client";

import { useEffect, useRef } from "react";
import { useCollaborationStore } from "@/zustand/collaborationStore";

export function useRealtimeClient(projectId, pageId) {
  const wsRef = useRef(null);
  const setConnected = useCollaborationStore((s) => s.setConnected);
  const updatePresence = useCollaborationStore((s) => s.updatePresence);
  const baseUrl = (process.env.NEXT_PUBLIC_REALTIME_URL || "").replace(/\/$/, "");

  useEffect(() => {
    if (!projectId || !baseUrl) {
      setConnected(false);
      return;
    }
    const ws = new WebSocket(`${baseUrl}/${projectId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", pageId }));
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "presence" && msg.userId) {
          updatePresence(msg.userId, msg.data || {});
        }
        // mutation/comment/etc. handlers can be added here
      } catch (e) {
        console.warn("Realtime parse error", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [projectId, pageId, setConnected, updatePresence]);

  const publish = (payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  return { publish };
}
