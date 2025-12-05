import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAgentStore } from "./useAgentStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

export function useConvexSync() {
  const messages = useQuery(api.messages.getMessages) || [];
  const tasks = useQuery(api.agentQueue.getAll) || [];
  const workspace = useQuery(api.workspace.getWorkspace) || null;

  const setMessages = useAgentStore((s) => s.setMessages);
  const setTasks = useAgentStore((s) => s.setTasks);
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  useEffect(() => {
    setMessages(messages);
  }, [messages, setMessages]);

  useEffect(() => {
    setTasks(tasks);
  }, [tasks, setTasks]);

  useEffect(() => {
    setWorkspace(workspace);
  }, [workspace, setWorkspace]);

  return { messages, tasks, workspace };
}
