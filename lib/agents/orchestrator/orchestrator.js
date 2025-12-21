/**
 * Orchestrator — Phase 1.3 (Normalized)
 *
 * Responsibilities:
 * - Filter agent graph by mode
 * - Execute agent dependency graph
 * - Pass shared context between agents
 * - Emit structured logs to MessageBus
 * - Assemble final workspace
 *
 * IMPORTANT:
 * - Orchestrator unwraps AgentResults
 * - Downstream systems never see contracts
 */

import { executeAgentGraph } from '../execute/executeAgentGraph';
import { agentGraph, filterGraphByMode } from '../graph';
import { assembleWorkspace } from './assembleWorkspace';
import { buildRunners } from './buildRunners';

export async function runDesignTeam({ prompt, mode = 'full', bus }) {
    if (!bus) {
        throw new Error('runDesignTeam requires a MessageBus instance');
    }

    bus.info('Orchestrator', `Starting design run (mode: ${mode})`);

    const graph = filterGraphByMode(mode, agentGraph);
    const runners = buildRunners({ prompt, bus });

    const { results } = await executeAgentGraph({
        graph,
        runners,
        bus,
        initialContext: { prompt },
    });

    // Unwrap agent contracts safely
    const workspace = assembleWorkspace({
        brand: results.brand?.data ?? null,
        structure: results.structure?.data ?? null,
        ui: results.ui?.data ?? null,
        assets: results.asset?.data ?? null,
        prototype: results.prototype?.data ?? null,
        animations: results.animation?.data ?? null,
        messages: bus.getAll(),
    });

    bus.info('Orchestrator', 'Design run complete');

    return workspace;
}
