'use client';

import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import Image from 'next/image';
import ChatCopilot from './ChatCopilot';

export default function ChatBox({ messages, send, ref }) {
    const [input, setInput] = useState('');

    const handleSend = async (event) => {
        event.preventDefault();
        await send(input);
        setInput('');
    };

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200">
            <div ref={ref} className="flex-1 space-y-2 overflow-y-auto bg-white p-3">
                {messages.map((message) => (
                    <div key={message._id} className="flex items-start gap-2">
                        {message.userAvatar ? (
                            <Image
                                src={message.userAvatar}
                                width={24}
                                height={24}
                                alt={message.userName}
                                className="rounded-full"
                            />
                        ) : null}
                        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm">
                            <div className="font-semibold text-slate-700">{message.userName}</div>
                            <div className="text-slate-600">{message.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="flex border-t border-slate-200 p-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    className="flex-1 rounded-md border border-slate-200 px-3 py-1 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                />
                <button
                    type="submit"
                    className="ml-2 rounded-md bg-indigo-600 p-2 text-white transition hover:bg-indigo-500"
                >
                    <SendHorizonal className="h-4 w-4" />
                </button>
            </form>

            <ChatCopilot threadMessages={messages} />
        </div>
    );
}
