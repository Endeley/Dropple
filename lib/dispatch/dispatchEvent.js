// lib/dispatch/dispatchEvent.js

import { applyEvent } from '@/core/events/applyEvent';
import { useNodeTreeStore } from '@/runtime/stores/nodeTreeStore';

/**
 * SINGLE WRITE ENTRY
 * ------------------
 * The ONLY place allowed to mutate canvas state
 */

export function dispatchEvent(event) {
    useNodeTreeStore.setState(
        (state) => {
            applyEvent(state, event);
            // Return a shallow clone so Zustand applies the mutated state
            return { ...state };
        },
        true // replace to ensure state is set even if the reference is the same
    );
}
