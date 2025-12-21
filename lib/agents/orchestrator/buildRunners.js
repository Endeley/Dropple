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

import { brandContract, structureContract, wireframeContract, uiContract, animationContract } from '@/lib/agents/contracts';

import { runBrandKitAI, runStructureAI, runWireframeAI, runUIAI, runAssetAI, runPrototypeAI, runAnimationAI } from '@/lib/agents/legacy';

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
            return result;
        },

        structure: async () => {
            const result = await runAgentSafe('structure', async () => {
                bus.info('structure', 'Running Structure Agent');
                return runStructureAI(prompt);
            });

            validateAgentResult(result, structureContract, 'structure');
            return result;
        },

        wireframe: async ({ ctx }) => {
            const result = await runAgentSafe('wireframe', async () => {
                bus.info('wireframe', 'Running Wireframe Agent');
                return runWireframeAI(ctx.structure?.data);
            });

            validateAgentResult(result, wireframeContract, 'wireframe');
            return result;
        },

        ui: async ({ ctx }) => {
            const result = await runAgentSafe('ui', async () => {
                bus.info('ui', 'Running UI Agent');
                return runUIAI(ctx.wireframe?.data, ctx.brand?.data);
            });

            validateAgentResult(result, uiContract, 'ui');
            return result;
        },

        asset: async ({ ctx }) =>
            runAgentSafe('asset', async () => {
                bus.info('asset', 'Running Asset Agent');
                return runAssetAI(ctx.brand?.data, ctx.ui?.data);
            }),

        prototype: async ({ ctx }) =>
            runAgentSafe('prototype', async () => {
                bus.info('prototype', 'Running Prototype Agent');
                return runPrototypeAI(ctx.ui?.data);
            }),

        animation: async ({ ctx }) => {
            const result = await runAgentSafe('animation', async () => {
                bus.info('animation', 'Running Animation Agent');
                return runAnimationAI(ctx.ui?.data);
            });

            validateAgentResult(result, animationContract, 'animation');
            return result;
        },
    };
}
