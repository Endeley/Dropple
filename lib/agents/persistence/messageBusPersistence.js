/**
 * messageBusPersistence — Phase 2.4 (LOCKED)
 *
 * Purpose:
 * - Attach persistence behavior to MessageBus
 * - Record every emitted event for replay, timeline & multiplayer
 *
 * GUARANTEES:
 * - Does NOT modify MessageBus internals
 * - Does NOT block execution
 * - Does NOT assume any storage backend
 * - Can be removed without breaking runtime
 *
 * This file is a PLUGIN, not a dependency.
 */

/* ---------------------------------------------
   In-memory event store (Phase 2 only)
   NOTE: Will be replaced by DB / Convex / Redis
--------------------------------------------- */

const eventStore = new Map(); // runId -> events[]

function ensureRun(runId) {
    if (!eventStore.has(runId)) {
        eventStore.set(runId, []);
    }
    return eventStore.get(runId);
}

/* ---------------------------------------------
   Public API
--------------------------------------------- */

/**
 * Attach persistence to a MessageBus instance
 *
 * @param {MessageBus} bus
 * @param {Object} options
 * @param {string} options.runId
 *
 * @returns {Function} detach()
 */
export function attachMessageBusPersistence(bus, { runId }) {
    if (!bus) {
        throw new Error('attachMessageBusPersistence requires MessageBus');
    }

    if (!runId) {
        throw new Error('attachMessageBusPersistence requires runId');
    }

    const events = ensureRun(runId);

    // Subscribe to all MessageBus events
    const unsubscribe = bus.subscribe((event) => {
        // IMPORTANT:
        // We store the event EXACTLY as emitted
        // No mutation, no enrichment, no filtering
        events.push(event);
    });

    // Return cleanup function (future live sessions)
    return function detach() {
        unsubscribe();
    };
}

/* ---------------------------------------------
   Read APIs (Replay / Timeline)
--------------------------------------------- */

/**
 * Get all events for a run
 */
export function getRunEvents(runId) {
    return eventStore.get(runId) ? [...eventStore.get(runId)] : [];
}

/**
 * Get events filtered by agent/source
 */
export function getRunEventsBySource(runId, source) {
    return getRunEvents(runId).filter((e) => e.source === source);
}

/**
 * Get events filtered by level
 */
export function getRunEventsByLevel(runId, level) {
    return getRunEvents(runId).filter((e) => e.level === level);
}

/**
 * Clear all stored events
 * (useful for tests or hot reload)
 */
export function clearRunEvents(runId) {
    if (runId) {
        eventStore.delete(runId);
    } else {
        eventStore.clear();
    }
}
