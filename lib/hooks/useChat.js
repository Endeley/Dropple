"use client";

import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAICopilot } from './useAICopilot';

const canSyncUser = (user) =>
    Boolean(user?.id) && typeof user.id === 'string' && user.id.length > 12 && !user.id.startsWith('guest');

export function useChat(threadId, user) {
    const eligible = Boolean(threadId) && canSyncUser(user);
    const messagesQuery = useQuery(api.messages.list, eligible ? { threadId } : 'skip');
    const messages = messagesQuery ? [...messagesQuery].reverse() : [];
    const sendMessage = useMutation(api.messages.send);
    const { askCopilot } = useAICopilot();
    const ref = useRef(null);

    const send = async (text, auto = false) => {
        if (!text?.trim() || !eligible) return;
        await sendMessage({
            threadId,
            userId: user.id,
            userName: user.name,
            userAvatar: user.image,
            text,
        });

        if (auto && text.includes('@copilot')) {
            const threadContext = messages
                .map((message) => `${message.userName}: ${message.text}`)
                .join('\n');
            const { reply } = await askCopilot(threadContext, text);
            await sendMessage({
                threadId,
                userId: 'ai-bot',
                userName: 'Dropple Copilot 🤖',
                userAvatar: '/bot.png',
                text: reply ?? 'Copilot could not respond right now.',
            });
        }
    };

    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, [messages]);

    return { messages, send, ref };
}
