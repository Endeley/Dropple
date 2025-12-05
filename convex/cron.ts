import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.cron("agent-runner", "*/5 * * * * *", api.agentQueue.runNext);

crons.cron("pm-review", "*/20 * * * * *", api.agentQueue.pmReview);

crons.cron("sprint-loop", "*/5 * * * * *", api.sprints.runLoop);

crons.cron("ux-simulation", "*/10 * * * * *", api.agentQueue.uxSimulation);

crons.cron("continuous-pipeline", "*/30 * * * *", async (ctx) => {
  await ctx.runMutation(api.agentQueue.enqueueBuild, {});
  await ctx.runMutation(api.agentQueue.enqueueTests, {});
  await ctx.runMutation(api.agentQueue.enqueueDeploy, {});
});

export default crons;
