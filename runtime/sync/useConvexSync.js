import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAgentStore } from "./useAgentStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

export function useConvexSync() {
  const messagesQuery = useQuery(api.messages.getMessages);
  const tasksQuery = useQuery(api.agentQueue.getAll);
  const workspaceQuery = useQuery(api.workspace.getWorkspace);

  const messages = useMemo(() => messagesQuery ?? [], [messagesQuery]);
  const tasks = useMemo(() => tasksQuery ?? [], [tasksQuery]);
  const workspace = useMemo(() => workspaceQuery ?? null, [workspaceQuery]);

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
