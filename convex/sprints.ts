import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSprint = mutation({
  args: {
    sprint: v.object({
      number: v.number(),
      goals: v.any(),
      tasks: v.any(),
    }),
  },
  handler: async ({ db }, { sprint }) => {
    return await db.insert("sprints", {
      number: sprint.number,
      goals: sprint.goals,
      tasks: sprint.tasks,
      status: "active",
      createdAt: Date.now(),
      completedAt: undefined,
    });
  },
});

export const completeSprint = mutation({
  args: { sprintId: v.id("sprints") },
  handler: async ({ db }, { sprintId }) => {
    return await db.patch(sprintId, {
      status: "complete",
      completedAt: Date.now(),
    });
  },
});

export const getActiveSprint = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query("sprints")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("asc")
      .first();
  },
});

export const runLoop = mutation({
  args: {},
  handler: async ({ db }) => {
    const active = await db
      .query("sprints")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("asc")
      .first();

    if (!active) return null;

    const tasks = Array.isArray(active.tasks) ? active.tasks : [];
    const nextTask = tasks.find((t) => t.status === "queued");

    if (!nextTask) {
      await db.patch(active._id, {
        status: "complete",
        completedAt: Date.now(),
      });
      return { completed: true };
    }

    const updatedTasks = tasks.map((t) =>
      t === nextTask ? { ...t, status: "running", startedAt: Date.now() } : t,
    );

    await db.patch(active._id, { tasks: updatedTasks });

    await db.insert("agent_tasks", {
      agent: nextTask.assignedTo || nextTask.agent || "Code Agent",
      prompt: nextTask.prompt || nextTask.description || "",
      state: {
        sprintNumber: active.number,
        task: nextTask,
      },
      status: "queued",
      result: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { queuedTask: nextTask };
  },
});
