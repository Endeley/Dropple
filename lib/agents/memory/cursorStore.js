/**
 * cursorStore — Phase 2.3
 *
 * Stores replay cursors per run/user.
 */

const cursors = new Map();
// key = `${runId}:${userId || 'system'}`

export function initCursor({ runId, userId = 'system' }) {
    const key = `${runId}:${userId}`;

    const cursor = {
        runId,
        userId,
        timeMs: 0,
        speed: 1,
        status: 'idle', // idle | playing | paused | ended
        updatedAt: Date.now(),
    };

    cursors.set(key, cursor);
    return cursor;
}

export function updateCursor(runId, userId, patch) {
    const key = `${runId}:${userId}`;
    const cursor = cursors.get(key);
    if (!cursor) return null;

    Object.assign(cursor, patch, { updatedAt: Date.now() });
    return cursor;
}

export function getCursor(runId, userId = 'system') {
    return cursors.get(`${runId}:${userId}`) || null;
}

export function listCursors(runId) {
    return Array.from(cursors.values()).filter((c) => c.runId === runId);
}
