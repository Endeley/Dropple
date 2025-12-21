/**
 * runDroppleAgent — Phase 0 (Brain Entry)
 *
 * This is the ONLY public entry point for Dropple AI runs.
 *
 * Responsibilities:
 * - Validate input
 * - Initialize MessageBus
 * - Route execution mode
 * - Call orchestrator ONCE
 * - Normalize output
 */

import * as Agents from './roles';
import { MessageBus } from './shared/messageBus';
import { runDesignTeam } from './orchestrator';

function camel(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .map((word, idx) => {
            const lower = word.toLowerCase();
            if (idx === 0) return lower;
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
}

/* ---------------------------------------------
   Public API
--------------------------------------------- */

export async function runDroppleAgent(
    firstArg,
    input,
    existingBus = null,
) {
    // Legacy direct agent execution support
    if (typeof firstArg === 'string') {
        const agentName = firstArg;
        const key = camel(agentName);
        const fn =
            Agents[key] || Agents[agentName] || Agents[agentName.replace(/\s+/g, '')];

        if (!fn) throw new Error(`Agent not found: ${agentName}`);

        const bus = existingBus || new MessageBus();
        return fn(input, bus);
    }

    const {
        prompt,
        mode = 'full', // full | ui | motion | component | prototype
        options = {},
    } = firstArg || {};

    if (!prompt || typeof prompt !== 'string') {
        throw new Error('runDroppleAgent requires a prompt string');
    }

    const bus = new MessageBus();

    bus.info('Dropple', '🚀 Dropple agent started');
    bus.info('Dropple', `Mode: ${mode}`);

    try {
        const result = await runDesignTeam({
            prompt,
            mode,
            bus,
            options,
        });

        bus.info('Dropple', '✅ Dropple agent completed');

        return {
            ok: true,
            mode,
            result,
            messages: bus.getAll(),
        };
    } catch (error) {
        bus.error('Dropple', error.message, {
            stack: error.stack,
        });

        return {
            ok: false,
            mode,
            error: error.message,
            messages: bus.getAll(),
        };
    }
}
