/**
 * executeAgentGraph — Phase 1.3 (Normalized Executor)
 *
 * Responsibilities:
 * - Execute agent dependency graph
 * - Run agents in parallel where possible
 * - Maintain deterministic ordering
 * - Store ONLY normalized AgentResults
 * - Never allow agent crashes to break orchestration
 */

export async function executeAgentGraph({ graph, runners, bus, initialContext = {} }) {
    if (!graph || typeof graph !== 'object') {
        throw new Error('executeAgentGraph requires a graph');
    }

    if (!runners || typeof runners !== 'object') {
        throw new Error('executeAgentGraph requires runners');
    }

    if (!bus) {
        throw new Error('executeAgentGraph requires MessageBus');
    }

    /**
     * Shared execution context
     * NOTE:
     * - ctx.results holds ONLY AgentResults
     * - ctx.input holds immutable initial inputs
     */
    const ctx = {
        input: { ...initialContext },
        results: {},
    };

    const pending = new Set(Object.keys(graph));
    const completed = new Set();

    function getReadyAgents() {
        return [...pending].filter((key) => {
            const deps = graph[key]?.dependsOn || [];
            return deps.every((d) => completed.has(d));
        });
    }

    while (pending.size > 0) {
        const ready = getReadyAgents();

        if (ready.length === 0) {
            throw new Error(`Deadlock detected in agent graph. Pending: ${[...pending].join(', ')}`);
        }

        bus.info('Executor', `Executing agents in parallel: ${ready.join(', ')}`);

        await Promise.all(
            ready.map(async (agentKey) => {
                const run = runners[agentKey];

                if (!run) {
                    throw new Error(`No runner defined for agent: ${agentKey}`);
                }

                bus.info(agentKey, 'Started');

                let result;

                try {
                    result = await run({ ctx });
                } catch (error) {
                    // This should NEVER happen if buildRunners is correct,
                    // but we hard-guard anyway.
                    result = {
                        ok: false,
                        data: null,
                        warnings: [error.message],
                        meta: {
                            agent: agentKey,
                        },
                    };
                }

                ctx.results[agentKey] = result;

                completed.add(agentKey);
                pending.delete(agentKey);

                bus.info(agentKey, result.ok ? 'Completed successfully' : 'Completed with warnings');
            })
        );
    }

    return {
        results: ctx.results,
        ctx,
    };
}
