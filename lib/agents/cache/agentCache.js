/**
 * AgentCache — Phase 1.4
 *
 * Interface:
 * - get(runId, agentId)
 * - set(runId, agentId, AgentResult)
 * - getAll(runId)
 * - clear(runId)
 *
 * This can later be backed by:
 * - memory
 * - filesystem
 * - database
 * - Convex / Redis
 */

export class AgentCache {
    async get(_runId, _agentId) {
        return null;
    }

    async set(_runId, _agentId, _result) {}

    async getAll(_runId) {
        return {};
    }

    async clear(_runId) {}
}
