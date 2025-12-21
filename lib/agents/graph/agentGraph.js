/**
 * Agent Dependency Graph — Phase 1
 *
 * Defines:
 * - Agent IDs
 * - Dependencies
 * - Execution order
 *
 * Object keyed by agent id so the executor can look up dependencies quickly.
 */

export const agentGraph = {
    brand: {
        id: 'brand',
        label: 'Brand Agent',
        dependsOn: [],
    },
    structure: {
        id: 'structure',
        label: 'Structure Agent',
        dependsOn: [],
    },
    wireframe: {
        id: 'wireframe',
        label: 'Wireframe Agent',
        dependsOn: ['structure'],
    },
    ui: {
        id: 'ui',
        label: 'UI Agent',
        dependsOn: ['wireframe', 'brand'],
    },
    asset: {
        id: 'asset',
        label: 'Asset Agent',
        dependsOn: ['brand', 'ui'],
    },
    prototype: {
        id: 'prototype',
        label: 'Prototype Agent',
        dependsOn: ['ui'],
    },
    animation: {
        id: 'animation',
        label: 'Animation Agent',
        dependsOn: ['ui'],
    },
};
