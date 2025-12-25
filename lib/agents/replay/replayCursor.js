/**
 * Replay Cursor Controller — Phase 2.2
 *
 * Responsibilities:
 * - Control playback time
 * - Play / pause / seek
 * - Expose current replay state
 * - Drive replay consumers (UI, engine, multiplayer)
 *
 * IMPORTANT:
 * - No rendering
 * - No side effects outside callbacks
 * - Uses requestAnimationFrame when playing
 */

export function createReplayCursor({ reader, onUpdate }) {
    if (!reader) {
        throw new Error('ReplayCursor requires a ReplayReader');
    }

    let currentTime = 0; // ms since start
    let playing = false;
    let rafId = null;
    let lastFrameTime = null;

    function emit() {
        if (typeof onUpdate === 'function') {
            onUpdate({
                time: currentTime,
                playing,
                events: reader.getUntil(currentTime),
            });
        }
    }

    function step(timestamp) {
        if (!playing) return;

        if (lastFrameTime == null) {
            lastFrameTime = timestamp;
        }

        const delta = timestamp - lastFrameTime;
        lastFrameTime = timestamp;

        currentTime += delta;

        if (currentTime >= reader.duration) {
            currentTime = reader.duration;
            pause();
        }

        emit();
        rafId = requestAnimationFrame(step);
    }

    function play() {
        if (playing) return;
        playing = true;
        lastFrameTime = null;
        emit();
        rafId = requestAnimationFrame(step);
    }

    function pause() {
        if (!playing) return;
        playing = false;
        lastFrameTime = null;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        emit();
    }

    function seek(timeMs) {
        currentTime = Math.max(0, Math.min(timeMs, reader.duration));
        emit();
    }

    function reset() {
        pause();
        currentTime = 0;
        emit();
    }

    return {
        /* -------- State -------- */

        get time() {
            return currentTime;
        },

        get playing() {
            return playing;
        },

        get duration() {
            return reader.duration;
        },

        /* -------- Controls -------- */

        play,
        pause,
        seek,
        reset,
    };
}
