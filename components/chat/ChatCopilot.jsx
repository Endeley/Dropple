'use client';

import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { useAICopilot } from '@/lib/hooks/useAICopilot';

export default function ChatCopilot({ threadMessages }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const { askCopilot } = useAICopilot();

    const handleAsk = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const threadContext = threadMessages
            .map((message) => `${message.userName}: ${message.text}`)
            .join('\n')
            .slice(-4000);

        const result = await askCopilot(threadContext, input);
        setResponse(result?.reply ?? '');
        setLoading(false);
    };

    return (
        <section className="mt-4 rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                <Bot className="h-4 w-4" /> AI Copilot
            </div>
            <textarea
                className="h-16 w-full resize-none rounded-md border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-indigo-300"
                placeholder="Ask Copilot (e.g. summarize chat, suggest a brand slogan...)"
                value={input}
                onChange={(event) => setInput(event.target.value)}
            />
            <button
                type="button"
                onClick={handleAsk}
                disabled={loading}
                className="mt-2 w-full rounded-md border border-indigo-300 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
                {loading ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Ask Copilot'}
            </button>

            {response ? (
                <div className="mt-3 whitespace-pre-wrap rounded-md border border-indigo-200 bg-indigo-50 p-2 text-xs text-slate-700">
                    {response}
                </div>
            ) : null}
        </section>
    );
}
