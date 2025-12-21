/**
 * Agent Contract Utilities — Phase 0.3
 *
 * Purpose:
 * - Standardize agent responses
 * - Prevent hard crashes
 * - Enable partial success + orchestration control
 */

export function createAgentResult({ ok, data = null, warnings = [], meta = {} }) {
    return {
        ok: Boolean(ok),
        data,
        warnings: Array.isArray(warnings) ? warnings : [],
        meta: {
            agent: meta.agent || 'unknown',
            durationMs: meta.durationMs,
            version: meta.version,
        },
    };
}

/**
 * Safe wrapper for agent execution
 * Ensures:
 * - No throws
 * - Duration tracking
 * - Normalized result
 */
export async function runAgentSafe(agentName, fn) {
    const start = performance.now();

    try {
        const data = await fn();

        return createAgentResult({
            ok: true,
            data,
            meta: {
                agent: agentName,
                durationMs: Math.round(performance.now() - start),
            },
        });
    } catch (error) {
        return createAgentResult({
            ok: false,
            data: null,
            warnings: [error.message],
            meta: {
                agent: agentName,
                durationMs: Math.round(performance.now() - start),
            },
        });
    }
}
