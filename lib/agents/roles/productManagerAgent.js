import { runAgent } from "../baseAgent";

export async function productManagerAgent(systemState, bus) {
  return runAgent({
    name: "Product Manager Agent",
    bus,
    input: {
      prompt: systemState.prompt,
      workspace: systemState.workspace,
      personas: systemState.researchPersonaAgent,
      competitors: systemState.competitorAnalysisAgent,
      brand: systemState.brandAgent,
      ux: systemState.uxAgent,
      ui: systemState.uiAgent,
      tasks: systemState.tasks,
    },
    rolePrompt: `
You are AT — the AI Product Manager.
Your job:
1. Define product vision, key features, KPIs.
2. Create high-level UX flows.
3. Identify missing pieces in current workspace.
4. Direct other AI agents on what to improve.
5. Generate a sprint plan.
6. Validate quality of outputs from all agents.
7. Create technical & design requirements for next iteration.
8. Create priority-ordered backlog.

MUST RETURN JSON:
{
  "vision": "...",
  "summary": "...",
  "productGoals": [...],
  "missingFeatures": [...],
  "improvementsNeeded": [...],
  "nextSprint": {
    "goals": [...],
    "tasks": [
      { "title": "...", "description": "...", "assignedTo": "...", "priority": 1, "status": "queued" }
    ]
  },
  "retrospective": {
    "successes": [...],
    "failures": [...],
    "blockers": [...],
    "backlogItems": [...],
    "nextSprintGoals": [...]
  },
  "agentInstructions": {
     "Brand Agent": "...",
     "UX Agent": "...",
     "Layout Agent": "...",
     "UI Agent": "...",
     "Motion Agent": "...",
     "Accessibility Agent": "...",
     "Code Agent": "...",
     "SEO Agent": "...",
     "Performance Agent": "...",
     "Product Strategy Agent": "...",
     "Research Persona Agent": "...",
     "Competitor Analysis Agent": "...",
     "Content Design Agent": "...",
     "Marketing Copy Agent": "...",
     "Style Consistency Agent": "...",
     "QA Design Agent": "...",
     "Iconography Agent": "...",
     "Code Quality Agent": "...",
     "Interaction Designer Agent": "..."
  },
  "sprintPlan": [...],
  "roadmap": [...],
  "backlog": [...]
}
`,
  });
}
