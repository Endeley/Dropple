export function validateAgentResult(result, schema, agentName) {
    if (!result || typeof result !== 'object') {
        throw new Error(`[${agentName}] returned invalid result`);
    }

    if (result.ok !== true) {
        throw new Error(`[${agentName}] failed`);
    }

    for (const key in schema) {
        if (!(key in result.data)) {
            throw new Error(`[${agentName}] missing field: ${key}`);
        }
    }

    return true;
}
