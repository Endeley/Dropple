/**
 * eventStore — Phase 2.3
 *
 * Stores MessageBus events per run.
 * Append-only, immutable.
 */

const eventsByRun = new Map();

export function appendEvent(runId, event) {
    if (!eventsByRun.has(runId)) {
        eventsByRun.set(runId, []);
    }

    eventsByRun.get(runId).push(event);
}

export function getEvents(runId) {
    return eventsByRun.get(runId) || [];
}

export function getEventsUntil(runId, timestamp) {
    const events = getEvents(runId);
    return events.filter((e) => e.timestamp <= timestamp);
}

export function clearRunEvents(runId) {
    eventsByRun.delete(runId);
}
