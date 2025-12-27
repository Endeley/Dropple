// core/events/applyEvent.js
import { applyNodeCreate, applyNodeUpdate, applyNodeDelete, applyNodeParentSet } from './reducers/nodeReducers';
import { EVENT_TYPES } from './eventTypes';

/**
 * EVENT → REDUCER DISPATCHER
 * ------------------------
 * Single mapping point
 */

export function applyEvent(state, event) {
    if (!event || !event.type) return;

    switch (event.type) {
        case EVENT_TYPES.NODE_CREATE:
            applyNodeCreate(state, event);
            break;

        case EVENT_TYPES.NODE_UPDATE:
            applyNodeUpdate(state, event);
            break;

        case EVENT_TYPES.NODE_DELETE:
            applyNodeDelete(state, event);
            break;

        case EVENT_TYPES.NODE_PARENT_SET:
            applyNodeParentSet(state, event);
            break;

        default:
            // unknown events are ignored safely
            break;
    }
}
