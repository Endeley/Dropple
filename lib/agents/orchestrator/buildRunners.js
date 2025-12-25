/**
 * buildRunners — Phase 1.3 (LOCKED)
 *
 * Responsibilities:
 * - Create SAFE agent runners
 * - Enforce Agent Contracts
 * - Normalize outputs (AgentResult)
 * - Prevent agent crashes from breaking orchestration
 *
 * GUARANTEES:
 * - No agent throws past this layer
 * - All agents return AgentResult
 */

import { runAgentSafe } from '@/lib/agents/contracts/agentContract';
import { validateAgentResult } from '@/lib/agents/contracts/validateAgentResult';

import { ANIMATION_CONTRACT_VERSION, BRAND_CONTRACT_VERSION, STRUCTURE_CONTRACT_VERSION, UI_CONTRACT_VERSION, WIREFRAME_CONTRACT_VERSION, animationContract, brandContract, structureContract, uiContract, wireframeContract } from '@/lib/agents/contracts';

import { runBrandKitAI, runStructureAI, runWireframeAI, runUIAI, runAssetAI, runPrototypeAI, runAnimationAI } from '@/lib/agents/legacy';

const ASSET_CONTRACT_VERSION = '1.0.0';
const PROTOTYPE_CONTRACT_VERSION = '1.0.0';

function withVersion(result, agent, version) {
    if (result && typeof result === 'object') {
        return { ...result, meta: { ...(result.meta || {}), agent, version } };
    }
    return {
        ok: result.ok,
        data: result.data,
        warnings: result.warnings,
        meta: { ...(result.meta || {}), agent, version },
    };
}

export function buildRunners({ prompt, bus }) {
    if (!bus) {
        throw new Error('buildRunners requires MessageBus');
    }

    return {
        brand: async () => {
            const result = await runAgentSafe('brand', async () => {
                bus.info('brand', 'Running Brand Agent');
                return runBrandKitAI(prompt);
            });

            validateAgentResult(result, brandContract, 'brand');
            return withVersion(result, 'brand', BRAND_CONTRACT_VERSION);
        },

        structure: async () => {
            const result = await runAgentSafe('structure', async () => {
                bus.info('structure', 'Running Structure Agent');
                return runStructureAI(prompt);
            });

            validateAgentResult(result, structureContract, 'structure');
            return withVersion(result, 'structure', STRUCTURE_CONTRACT_VERSION);
        },

        wireframe: async ({ ctx }) => {
            const result = await runAgentSafe('wireframe', async () => {
                bus.info('wireframe', 'Running Wireframe Agent');
                return runWireframeAI(ctx.structure?.data);
            });

            validateAgentResult(result, wireframeContract, 'wireframe');
            return withVersion(result, 'wireframe', WIREFRAME_CONTRACT_VERSION);
        },

        ui: async ({ ctx }) => {
            const result = await runAgentSafe('ui', async () => {
                bus.info('ui', 'Running UI Agent');
                return runUIAI(ctx.wireframe?.data, ctx.brand?.data);
            });

            validateAgentResult(result, uiContract, 'ui');
            return withVersion(result, 'ui', UI_CONTRACT_VERSION);
        },

        asset: async ({ ctx }) =>
            runAgentSafe('asset', async () => {
                bus.info('asset', 'Running Asset Agent');
                return runAssetAI(ctx.brand?.data, ctx.ui?.data);
            }).then((res) => withVersion(res, 'asset', ASSET_CONTRACT_VERSION)),

        prototype: async ({ ctx }) =>
            runAgentSafe('prototype', async () => {
                bus.info('prototype', 'Running Prototype Agent');
                return runPrototypeAI(ctx.ui?.data);
            }).then((res) => withVersion(res, 'prototype', PROTOTYPE_CONTRACT_VERSION)),

        animation: async ({ ctx }) => {
            const result = await runAgentSafe('animation', async () => {
                bus.info('animation', 'Running Animation Agent');
                return runAnimationAI(ctx.ui?.data);
            });

            validateAgentResult(result, animationContract, 'animation');
            return withVersion(result, 'animation', ANIMATION_CONTRACT_VERSION);
        },
    };
}
