/**
 * MessageBus — Phase 0.2
 *
 * Responsibilities:
 * - Central event & log pipeline
 * - Timestamped messages
 * - Log levels
 * - Replay support
 * - Subscriptions (future streaming / UI)
 *
 * SAFE:
 * - Backward compatible with `.send(source, message)`
 */

export class MessageBus {
    constructor() {
        this.messages = [];
        this.listeners = new Set();
    }

    /* ---------------------------------------------
     Core emit (lowest-level)
  --------------------------------------------- */

    emit(event) {
        const normalized = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            level: event.level || 'info', // info | warn | error | debug
            source: event.source || 'system',
            type: event.type || 'log',
            payload: event.payload ?? null,
        };

        this.messages.push(normalized);

        // Notify listeners (UI, stream, debugger, etc)
        for (const listener of this.listeners) {
            try {
                listener(normalized);
            } catch (err) {
                console.error('MessageBus listener error:', err);
            }
        }

        return normalized;
    }

    /* ---------------------------------------------
     Backward-compatible API
  --------------------------------------------- */

    send(source, message, level = 'info') {
        return this.emit({
            source,
            level,
            payload: { message },
        });
    }

    info(source, message) {
        return this.send(source, message, 'info');
    }

    warn(source, message) {
        return this.send(source, message, 'warn');
    }

    error(source, message, extra = {}) {
        return this.emit({
            source,
            level: 'error',
            payload: {
                message,
                ...extra,
            },
        });
    }

    debug(source, message) {
        return this.send(source, message, 'debug');
    }

    /* ---------------------------------------------
     Replay & inspection
  --------------------------------------------- */

    getAll() {
        return [...this.messages];
    }

    getBySource(source) {
        return this.messages.filter((m) => m.source === source);
    }

    getByLevel(level) {
        return this.messages.filter((m) => m.level === level);
    }

    clear() {
        this.messages = [];
    }

    replay(listener) {
        this.messages.forEach(listener);
    }

    /* ---------------------------------------------
     Subscriptions (future live UI / multiplayer)
  --------------------------------------------- */

    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }
}
