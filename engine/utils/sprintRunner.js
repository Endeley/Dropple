export function expandSprintTasks(sprint) {
  if (!sprint || !Array.isArray(sprint.tasks)) return [];
  return sprint.tasks.map((task) => ({
    agent: task.assignedTo || task.agent,
    prompt: task.description || task.prompt || task.title || "",
    priority: task.priority ?? 0,
    status: task.status || "queued",
    sprintNumber: sprint.number,
  }));
}
