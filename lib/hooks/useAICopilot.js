"use client";

export function useAICopilot() {
    const askCopilot = async (threadContext, userPrompt) => {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'chat', threadContext, userPrompt }),
        });
        return response.json();
    };

    return { askCopilot };
}
