'use client';

import { useState } from 'react';
import { Palette, Loader2 } from 'lucide-react';
import { generateAIPalette } from '@/lib/ai';

export default function AIPalettePanel() {
    const [loading, setLoading] = useState(false);
    const [colors, setColors] = useState([]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateAIPalette('modern brand with clean tech aesthetic');
            setColors(result?.colors ?? []);
        } catch (error) {
            console.error('Failed to generate palette', error);
            setColors([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mt-4 rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                <Palette className="h-4 w-4" /> AI Palette
            </div>
            <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-md border border-indigo-300 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-60"
            >
                {loading ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Generate Palette'}
            </button>
            <div className="mt-3 flex gap-2">
                {colors.map((color) => (
                    <div
                        key={color}
                        className="h-8 w-8 rounded border border-slate-200"
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                ))}
            </div>
        </section>
    );
}
