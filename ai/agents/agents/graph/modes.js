/**
 * Phase 1 — Mode → Allowed Agents
 */

export const MODE_AGENT_WHITELIST = {
    full: null, // null = allow all

    ui: ['brand', 'structure', 'wireframe', 'ui', 'asset'],

    motion: ['ui', 'animation'],

    component: ['brand', 'ui', 'prototype'],

    prototype: ['structure', 'ui', 'prototype'],
};
