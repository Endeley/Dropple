/**
 * replayTimeline — Phase 2.5 (LOCKED)
 *
 * Purpose:
 * - Convert raw MessageBus events into a time-based replay model
 * - Provide cursor-based playback (forward / backward / seek)
 * - Power UI replay, debugging, and multiplayer sync
 *
 * GUARANTEES:
 * - Read-only (never mutates stored events)
 * - Deterministic ordering
 * - Backend-agnostic
 * - Safe to run multiple times
 */

import { getRunEvents } from './messageBusPersistence';

/* ---------------------------------------------
   Timeline Construction
--------------------------------------------- */

/**
 * Build a replay timeline for a given run
 *
 * @param {string} runId
 * @returns {Object} timeline
 */
export function buildReplayTimeline(runId) {
    const events = getRunEvents(runId);

    // Defensive copy + sort (timestamp is authoritative)
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);

    const startTime = sorted[0]?.timestamp || 0;

    const frames = sorted.map((event, index) => ({
        id: event.id,
        index,
        t: event.timestamp - startTime, // relative time (ms)
        event,
    }));

    return {
        runId,
        startTime,
        durationMs: frames.length ? frames[frames.length - 1].t : 0,
        frames,
    };
}

/* ---------------------------------------------
   Cursor Model
--------------------------------------------- */

/**
 * Create a replay cursor
 *
 * Cursor is PURE STATE.
 * UI controls move it.
 */
export function createReplayCursor(timeline) {
    if (!timeline || !Array.isArray(timeline.frames)) {
        throw new Error('Invalid timeline');
    }

    return {
        timeline,
        index: 0,
    };
}

/**
 * Get current frame at cursor
 */
export function getCurrentFrame(cursor) {
    return cursor.timeline.frames[cursor.index] || null;
}

/**
 * Move cursor forward by N frames
 */
export function stepForward(cursor, step = 1) {
    const max = cursor.timeline.frames.length - 1;
    cursor.index = Math.min(max, cursor.index + step);
    return getCurrentFrame(cursor);
}

/**
 * Move cursor backward by N frames
 */
export function stepBackward(cursor, step = 1) {
    cursor.index = Math.max(0, cursor.index - step);
    return getCurrentFrame(cursor);
}

/**
 * Seek cursor to a specific time (ms)
 */
export function seekToTime(cursor, timeMs) {
    const frames = cursor.timeline.frames;

    const idx = frames.findIndex((f) => f.t >= timeMs);

    cursor.index = idx === -1 ? frames.length - 1 : idx;
    return getCurrentFrame(cursor);
}

/**
 * Seek cursor to a specific frame index
 */
export function seekToIndex(cursor, index) {
    const max = cursor.timeline.frames.length - 1;
    cursor.index = Math.max(0, Math.min(index, max));
    return getCurrentFrame(cursor);
}

/* ---------------------------------------------
   Filters (Read-only views)
--------------------------------------------- */

/**
 * Filter frames by agent/source
 */
export function filterTimelineBySource(timeline, source) {
    return timeline.frames.filter((f) => f.event.source === source);
}

/**
 * Filter frames by level
 */
export function filterTimelineByLevel(timeline, level) {
    return timeline.frames.filter((f) => f.event.level === level);
}

/**
 * Filter frames by event type
 */
export function filterTimelineByType(timeline, type) {
    return timeline.frames.filter((f) => f.event.type === type);
}
