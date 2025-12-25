export async function executeAgentGraph({ graph, runners, bus, cache, runId, initialContext = {} }) {
    const ctx = {
        input: Object.freeze({ ...initialContext }),
        results: {},
    };

    // 🔹 Hydrate cache
    const cached = cache ? await cache.getAll(runId) : {};

    for (const [agentId, result] of Object.entries(cached)) {
        ctx.results[agentId] = result;
    }

    const pending = new Set(Object.keys(graph).filter((id) => !ctx.results[id]?.ok));

    const completed = new Set(Object.keys(ctx.results).filter((id) => ctx.results[id]?.ok));

    function getReadyAgents() {
        return [...pending].filter((id) => (graph[id]?.dependsOn || []).every((d) => completed.has(d)));
    }

    while (pending.size > 0) {
        const ready = getReadyAgents();

        if (!ready.length) {
            throw new Error(`Deadlock detected. Pending: ${[...pending].join(', ')}`);
        }

        bus.info('Executor', `Running: ${ready.join(', ')}`);

        await Promise.all(
            ready.map(async (agentId) => {
                const run = runners[agentId];
                bus.info(agentId, 'Started');

                bus.emit({
                    type: 'status',
                    source: agentId,
                    payload: { status: 'running' },
                });

                const result = await run({ ctx });

                ctx.results[agentId] = result;
                await cache?.set(runId, agentId, result);

                if (!result.ok && graph[agentId]?.critical) {
                    bus.emit({
                        type: 'status',
                        source: agentId,
                        payload: { status: 'failed' },
                    });
                    throw new Error(`Critical agent failed: ${agentId}`);
                }

                completed.add(agentId);
                pending.delete(agentId);

                bus.emit({
                    type: 'status',
                    source: agentId,
                    payload: {
                        status: result.ok ? 'completed' : 'warning',
                    },
                });

                bus.info(agentId, result.ok ? 'Completed (cached)' : 'Completed with warnings');
            })
        );
    }

    return { results: ctx.results, ctx };
}
