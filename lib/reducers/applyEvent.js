// lib/reducers/applyEvent.js

import { applyNodeCreate, applyNodeUpdate, applyNodeDelete, applyNodeParentSet } from './nodeReducers';

/**
 * EVENT → REDUCER DISPATCHER
 * ------------------------
 * Single mapping point
 */

export function applyEvent(state, event) {
    if (!event || !event.type) return;

    switch (event.type) {
        case 'NODE_CREATE':
            applyNodeCreate(state, event);
            break;

        case 'NODE_UPDATE':
            applyNodeUpdate(state, event);
            break;

        case 'NODE_DELETE':
            applyNodeDelete(state, event);
            break;

        case 'NODE_PARENT_SET':
            applyNodeParentSet(state, event);
            break;

        default:
            // unknown events are ignored safely
            break;
    }
}
