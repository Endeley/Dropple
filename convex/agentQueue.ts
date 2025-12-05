import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { runAgentTask } from "../lib/convex/runAgentTask.js";

// Add a task
export const enqueue = mutation({
  args: {
    agent: v.string(),
    prompt: v.optional(v.string()),
    state: v.optional(v.any()),
  },
  handler: async ({ db }, { agent, prompt, state }) => {
    return await db.insert("agent_tasks", {
      agent,
      prompt,
      state,
      status: "queued",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Fetch queued tasks
export const getQueued = query(async ({ db }) => {
  return await db
    .query("agent_tasks")
    .withIndex("by_status", (q) => q.eq("status", "queued"))
    .order("asc")
    .collect();
});

// Fetch all tasks
export const getAll = query(async ({ db }) => {
  return await db.query("agent_tasks").order("asc").collect();
});

// Worker: run next task
export const runNext = mutation(async ({ db }) => {
  const task = await db
    .query("agent_tasks")
    .withIndex("by_status", (q) => q.eq("status", "queued"))
    .order("asc")
    .first();

  if (!task) return null;

  await db.patch(task._id, { status: "running", updatedAt: Date.now() });

  const result = await runAgentTask(task);

  await db.patch(task._id, {
    status: "completed",
    result,
    updatedAt: Date.now(),
  });

  return result;
});

// Supervisor: enqueue PM review with latest workspace
export const pmReview = mutation(async ({ db }) => {
  const [ws] = await db
    .query("workspace")
    .withIndex("by_updated")
    .order("desc")
    .take(1);

  const workspace = ws?.data ?? null;

  return await db.insert("agent_tasks", {
    agent: "Product Manager Agent",
    prompt: "Review system state and generate next sprint.",
    state: { workspace },
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
});

export const uxSimulation = mutation(async ({ db }) => {
  const [ws] = await db
    .query("workspace")
    .withIndex("by_updated")
    .order("desc")
    .take(1);

  const workspace = ws?.data ?? null;

  return await db.insert("agent_tasks", {
    agent: "Scenario Simulation Agent",
    prompt: "Simulate UX behavior for current workspace.",
    state: { workspace },
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
});

export const enqueueBuild = mutation(async ({ db }) => {
  return await db.insert("agent_tasks", {
    agent: "Build Agent",
    prompt: "Run CI build.",
    state: {},
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
});

export const enqueueTests = mutation(async ({ db }) => {
  return await db.insert("agent_tasks", {
    agent: "Test Agent",
    prompt: "Run test suite.",
    state: {},
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
});

export const enqueueDeploy = mutation(async ({ db }) => {
  return await db.insert("agent_tasks", {
    agent: "Deploy Agent",
    prompt: "Deploy latest build.",
    state: {},
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
});
