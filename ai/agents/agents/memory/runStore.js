/**
 * runStore — Phase 2.3
 *
 * Stores AI run metadata.
 * In-memory reference implementation.
 */

const runs = new Map();

export function createRun({ runId, prompt, mode }) {
    const run = {
        runId,
        prompt,
        mode,
        createdAt: Date.now(),
        status: 'running',
    };

    runs.set(runId, run);
    return run;
}

export function completeRun(runId, status = 'completed') {
    const run = runs.get(runId);
    if (!run) return null;

    run.status = status;
    run.completedAt = Date.now();
    return run;
}

export function getRun(runId) {
    return runs.get(runId) || null;
}

export function listRuns() {
    return Array.from(runs.values());
}
