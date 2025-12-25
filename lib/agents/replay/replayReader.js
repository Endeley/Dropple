/**
 * Replay Reader — Phase 2.2
 *
 * Responsibilities:
 * - Read MessageBus events for a run
 * - Provide deterministic, ordered playback
 * - Support timeline cursor (time-based)
 * - Remain backend-agnostic
 *
 * IMPORTANT:
 * - This is READ-ONLY
 * - No side effects
 * - No UI logic
 */

/**
 * Create a replay reader for a run
 *
 * @param {Object} params
 * @param {string} params.runId
 * @param {Array} params.events - MessageBus events
 */
export function createReplayReader({ runId, events = [] }) {
    if (!runId) {
        throw new Error('ReplayReader requires runId');
    }

    const timeline = events.filter((e) => e.runId === runId).sort((a, b) => a.timestamp - b.timestamp);

    const startTime = timeline[0]?.timestamp || 0;
    const endTime = timeline[timeline.length - 1]?.timestamp || startTime;

    return {
        runId,
        startTime,
        endTime,
        duration: Math.max(0, endTime - startTime),

        /**
         * Get all events
         */
        getAll() {
            return [...timeline];
        },

        /**
         * Get events up to a timestamp offset (ms)
         *
         * @param {number} timeMs - milliseconds since start
         */
        getUntil(timeMs) {
            const absoluteTime = startTime + Math.max(0, timeMs);
            return timeline.filter((e) => e.timestamp <= absoluteTime);
        },

        /**
         * Get events between two time offsets
         */
        getBetween(startMs, endMs) {
            const start = startTime + Math.max(0, startMs);
            const end = startTime + Math.max(0, endMs);

            return timeline.filter((e) => e.timestamp >= start && e.timestamp <= end);
        },

        /**
         * Step-by-step iterator (for playback engines)
         */
        *iterator() {
            for (const event of timeline) {
                yield event;
            }
        },
    };
}
