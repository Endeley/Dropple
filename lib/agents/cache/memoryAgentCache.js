import { AgentCache } from './agentCache';

export class MemoryAgentCache extends AgentCache {
    constructor() {
        super();
        this.store = new Map(); // runId → { agentId → AgentResult }
    }

    async get(runId, agentId) {
        return this.store.get(runId)?.[agentId] ?? null;
    }

    async set(runId, agentId, result) {
        const run = this.store.get(runId) || {};
        run[agentId] = result;
        this.store.set(runId, run);
    }

    async getAll(runId) {
        return this.store.get(runId) || {};
    }

    async clear(runId) {
        this.store.delete(runId);
    }
}
