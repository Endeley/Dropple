'use client';

import { nanoid } from 'nanoid';
import type { CanvasHistoryEntry, CanvasHistorySnapshot, CanvasHistoryState } from './historyTypes';

const MAX_HISTORY = 50;

const historyState: CanvasHistoryState = {
    past: [],
    present: null,
    future: [],
};

type SnapshotProducer = () => CanvasHistorySnapshot['payload'];

let snapshotProducer: SnapshotProducer | null = null;
let listeners: Array<() => void> = [];

export function configureHistory(producer: SnapshotProducer) {
    snapshotProducer = producer;
}

function notify() {
    computeStatus();
    listeners.forEach((listener) => listener());
}

export function subscribeHistory(listener: () => void) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((fn) => fn !== listener);
    };
}

export function getHistoryState() {
    return historyState;
}

let cachedStatus = {
    canUndo: false,
    canRedo: false,
};

function computeStatus() {
    const nextCanUndo = historyState.past.length > 0;
    const nextCanRedo = historyState.future.length > 0;
    if (cachedStatus.canUndo === nextCanUndo && cachedStatus.canRedo === nextCanRedo) {
        return cachedStatus;
    }
    cachedStatus = {
        canUndo: nextCanUndo,
        canRedo: nextCanRedo,
    };
    return cachedStatus;
}

export function getHistoryStatus() {
    return computeStatus();
}

function createSnapshot(label?: string): CanvasHistorySnapshot | null {
    if (!snapshotProducer) return null;
    const payload = snapshotProducer();
    return {
        id: `snap-${nanoid(8)}`,
        label,
        timestamp: Date.now(),
        payload,
    };
}

export function pushHistory(label?: string, source: CanvasHistoryEntry['source'] = 'user') {
    const snapshot = createSnapshot(label);
    if (!snapshot) return;

    if (historyState.present) {
        historyState.past.push(historyState.present);
        if (historyState.past.length > MAX_HISTORY) {
            historyState.past.shift();
        }
    }

    historyState.present = {
        id: `entry-${nanoid(8)}`,
        snapshot,
        source,
    };
    historyState.future = [];
    notify();
}

export function canUndo() {
    return historyState.past.length > 0;
}

export function canRedo() {
    return historyState.future.length > 0;
}

export function undo() {
    if (!canUndo()) return null;
    const previous = historyState.past.pop();
    if (!previous) return null;
    if (historyState.present) {
        historyState.future.unshift(historyState.present);
    }
    historyState.present = previous;
    notify();
    return previous.snapshot;
}

export function redo() {
    if (!canRedo()) return null;
    const next = historyState.future.shift();
    if (!next) return null;
    if (historyState.present) {
        historyState.past.push(historyState.present);
    }
    historyState.present = next;
    notify();
    return next.snapshot;
}

export function clearHistory() {
    historyState.past = [];
    historyState.future = [];
    historyState.present = null;
    notify();
}
