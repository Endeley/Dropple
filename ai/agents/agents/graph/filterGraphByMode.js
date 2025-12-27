/**
 * filterGraphByMode — Phase 1
 *
 * Takes the full agent dependency graph
 * and returns a pruned graph based on run mode.
 *
 * Guarantees:
 * - Required dependencies are preserved
 * - Execution order remains valid
 * - No agent logic is duplicated
 */

import { MODE_AGENT_WHITELIST } from './modes';

/**
 * Recursively collect all dependencies
 */
function collectDeps(node, graph, set) {
    if (!graph[node] || set.has(node)) return;

    set.add(node);

    const deps = graph[node].dependsOn || [];
    deps.forEach((dep) => collectDeps(dep, graph, set));
}

/**
 * Filter agent graph by mode
 */
export function filterGraphByMode(mode, agentGraph) {
    const allowed = MODE_AGENT_WHITELIST[mode];

    if (!allowed) {
        // full mode or unknown mode → no filtering
        return agentGraph;
    }

    const keep = new Set();

    allowed.forEach((agent) => {
        collectDeps(agent, agentGraph, keep);
    });

    const filtered = {};

    for (const key of keep) {
        if (agentGraph[key]) {
            filtered[key] = agentGraph[key];
        }
    }

    return filtered;
}
