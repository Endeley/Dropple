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
        critical: true,
    },
    structure: {
        id: 'structure',
        label: 'Structure Agent',
        dependsOn: [],
        critical: true,
    },
    wireframe: {
        id: 'wireframe',
        label: 'Wireframe Agent',
        dependsOn: ['structure'],
        critical: true,
    },
    ui: {
        id: 'ui',
        label: 'UI Agent',
        dependsOn: ['wireframe', 'brand'],
        critical: true,
    },
    asset: {
        id: 'asset',
        label: 'Asset Agent',
        dependsOn: ['brand', 'ui'],
        critical: false,
    },
    prototype: {
        id: 'prototype',
        label: 'Prototype Agent',
        dependsOn: ['ui'],
        critical: false,
    },
    animation: {
        id: 'animation',
        label: 'Animation Agent',
        dependsOn: ['ui'],
        critical: false,
    },
};
