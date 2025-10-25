import OpenAI from 'openai';
import { NextResponse } from 'next/server';

let client;
function getClient() {
    if (client) return client;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured.');
    }

    client = new OpenAI({ apiKey });
    return client;
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { type, prompt, colorContext, layoutContext, imagePrompt, threadContext, userPrompt } = body;

        if (type === 'chat') {
            const completion = await getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            "You are Dropple’s AI Copilot. You help with creative feedback, summarizing design discussions, and generating professional responses. Be concise, friendly, and helpful.",
                    },
                    {
                        role: 'user',
                        content: `Thread context: ${threadContext}\n\nUser: ${userPrompt}`,
                    },
                ],
            });

            const reply = completion.choices[0].message.content.trim();
            return NextResponse.json({ reply });
        }

        if (type === 'text') {
            const completion = await getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a creative copywriter for Dropple, generating short catchy design text.',
                    },
                    { role: 'user', content: prompt },
                ],
            });
            return NextResponse.json({ text: completion.choices[0].message.content.trim() });
        }

        if (type === 'palette') {
            const completion = await getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Generate a 5-color palette as HEX values based on a design theme.' },
                    { role: 'user', content: colorContext },
                ],
            });

            const colors = completion.choices[0].message.content.match(/#[0-9A-Fa-f]{6}/g)?.slice(0, 5);

            return NextResponse.json({ colors });
        }

        if (type === 'layout') {
            const completion = await getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a JSON layout structure with blocks, text, and image placeholders for a web section.',
                    },
                    { role: 'user', content: layoutContext },
                ],
            });

            const layoutJSON = completion.choices[0].message.content;
            return NextResponse.json({ layout: layoutJSON });
        }

        if (type === 'image') {
            const image = await getClient().images.generate({
                model: 'gpt-image-1',
                prompt: imagePrompt || 'a creative modern stock photo',
                size: '1024x1024',
            });
            return NextResponse.json({ url: image.data[0].url });
        }

        if (type === 'layoutSuggestion') {
            const completion = await getClient().chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Suggest layout improvements for a web design canvas.',
                    },
                    { role: 'user', content: layoutContext },
                ],
            });
            return NextResponse.json({ suggestions: completion.choices[0].message.content.trim() });
        }

        return NextResponse.json({ error: 'Invalid AI request type' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
