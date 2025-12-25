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
export async function runAgentSafe(agentName, fn, { retries = 1, fallback = null } = {}) {
    const start = performance.now();
    let attempt = 0;
    let lastError = null;

    while (attempt <= retries) {
        try {
            const data = await fn();

            return createAgentResult({
                ok: true,
                data,
                meta: {
                    agent: agentName,
                    durationMs: Math.round(performance.now() - start),
                    attempts: attempt + 1,
                    version: '1.0.0',
                },
            });
        } catch (error) {
            lastError = error;
            attempt++;
        }
    }

    // All retries failed
    if (fallback) {
        return createAgentResult({
            ok: true,
            data: fallback,
            warnings: [`${agentName} failed, fallback used: ${lastError.message}`],
            meta: {
                agent: agentName,
                durationMs: Math.round(performance.now() - start),
                attempts: attempt,
                version: '1.0.0',
            },
        });
    }

    return createAgentResult({
        ok: false,
        data: null,
        warnings: [lastError?.message || 'Unknown error'],
        meta: {
            agent: agentName,
            durationMs: Math.round(performance.now() - start),
            attempts: attempt,
            version: '1.0.0',
        },
    });
}
