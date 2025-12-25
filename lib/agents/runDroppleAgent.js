/**
 * runDroppleAgent — Phase 2 (Brain Entry + Persistence)
 *
 * SINGLE public entry point for all Dropple AI runs.
 *
 * Responsibilities:
 * - Validate input
 * - Generate runId
 * - Initialize MessageBus
 * - Attach persistence hook
 * - Route execution mode
 * - Call orchestrator ONCE
 * - Finalize run status
 * - Normalize output
 */

import { nanoid } from 'nanoid';

import * as Agents from './roles';
import { MessageBus } from './shared/messageBus';
import { runDesignTeam } from './orchestrator';
import { attachMessageBusPersistence } from './persistence/messageBusPersistence';

/* ---------------------------------------------
   Utils
--------------------------------------------- */

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

export async function runDroppleAgent(firstArg, input, existingBus = null) {
    /**
     * -----------------------------------------
     * Legacy: Direct agent execution
     * -----------------------------------------
     */
    if (typeof firstArg === 'string') {
        const agentName = firstArg;
        const key = camel(agentName);
        const fn = Agents[key] || Agents[agentName] || Agents[agentName.replace(/\s+/g, '')];

        if (!fn) throw new Error(`Agent not found: ${agentName}`);

        const bus = existingBus || new MessageBus();
        return fn(input, bus);
    }

    /**
     * -----------------------------------------
     * Normal Dropple AI Run
     * -----------------------------------------
     */
    const {
        prompt,
        mode = 'full', // full | ui | motion | component | prototype
        options = {},
    } = firstArg || {};

    if (!prompt || typeof prompt !== 'string') {
        throw new Error('runDroppleAgent requires a prompt string');
    }

    // 1️⃣ Generate runId
    const runId = nanoid();

    // 2️⃣ Create MessageBus
    const bus = new MessageBus();

    // 3️⃣ Attach persistence hook (SINGLE source of truth)
    const persistence = attachMessageBusPersistence({
        bus,
        runId,
        prompt,
        mode,
    });

    bus.info('Dropple', '🚀 Dropple agent started');
    bus.info('Dropple', `Mode: ${mode}`);
    bus.info('Dropple', `Run ID: ${runId}`);

    try {
        // 4️⃣ Execute orchestration ONCE
        const result = await runDesignTeam({
            prompt,
            mode,
            bus,
            options,
        });

        // 5️⃣ Mark run completed
        persistence.complete('completed');

        bus.info('Dropple', '✅ Dropple agent completed');

        return {
            ok: true,
            runId,
            mode,
            result,
            messages: bus.getAll(),
        };
    } catch (error) {
        // 6️⃣ Mark run failed
        persistence.complete('failed');

        bus.error('Dropple', error.message, {
            stack: error.stack,
        });

        return {
            ok: false,
            runId,
            mode,
            error: error.message,
            messages: bus.getAll(),
        };
    }
}
