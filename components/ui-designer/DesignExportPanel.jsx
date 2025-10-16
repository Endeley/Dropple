'use client';

import { useState } from 'react';
import { Download, Save, Share2 } from 'lucide-react';
import { useEditorStore } from '@/lib/stores/editorStore';
import { useDesignSync } from '@/lib/hooks/useDesignSync';

export default function DesignExportPanel({ userId, currentDesignId }) {
    const screens = useEditorStore((state) => state.screens);
    const title = useEditorStore((state) => state.title);
    const { designList } = useDesignSync(userId, currentDesignId);
    const [saving, setSaving] = useState(false);

    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify({ title, pages: screens }, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title || 'dropple-design'}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPNG = async () => {
        const canvas = window.document.querySelector('canvas');
        if (!canvas) {
            alert('No canvas found.');
            return;
        }
        const link = document.createElement('a');
        link.download = `${title || 'dropple-design'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handlePublish = () => {
        navigator.clipboard.writeText(window.location.href).catch(() => {
            alert('Unable to copy link');
        });
        alert('Share link copied!');
    };

    return (
        <section className="mt-4 rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                <Save className="h-4 w-4" /> Save & Export
            </div>

            <button
                type="button"
                onClick={() => setSaving(true)}
                disabled={saving}
                className="mb-2 w-full rounded-md border border-indigo-300 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
                {saving ? 'Saving…' : 'Save Design'}
            </button>

            <button
                type="button"
                onClick={handleExportPNG}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 py-1.5 text-xs font-semibold transition hover:bg-slate-50"
            >
                <Download className="h-3.5 w-3.5" /> Export PNG
            </button>

            <button
                type="button"
                onClick={handleExportJSON}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 py-1.5 text-xs font-semibold transition hover:bg-slate-50"
            >
                <Download className="h-3.5 w-3.5" /> Export JSON
            </button>

            <button
                type="button"
                onClick={handlePublish}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-300 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
                <Share2 className="h-3.5 w-3.5" /> Share / Publish
            </button>

            <div className="mt-3 text-[10px] text-slate-400">
                {designList?.length ? `You have ${designList.length} saved designs.` : 'No saved designs yet.'}
            </div>
        </section>
    );
}
