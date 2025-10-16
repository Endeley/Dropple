export async function generateAIText(prompt) {
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', prompt }),
    });
    return response.json();
}

export async function generateAIPalette(colorContext) {
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'palette', colorContext }),
    });
    return response.json();
}

export async function generateAILayout(layoutContext) {
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'layout', layoutContext }),
    });
    return response.json();
}
