'use client';

import { ZoomIn, ZoomOut, Grid, Sun, Moon } from 'lucide-react';

export default function EditorToolbar({
    zoom = 1,
    onZoomIn = () => {},
    onZoomOut = () => {},
    onToggleGrid = () => {},
    onToggleTheme = () => {},
    darkMode = false,
    showGrid = true,
}) {
    return (
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onZoomOut}
                    className="rounded p-1 transition hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:hover:text-indigo-400"
                    title="Zoom out"
                >
                    <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-[3ch] text-center font-semibold">{Math.round(zoom * 100)}%</span>
                <button
                    type="button"
                    onClick={onZoomIn}
                    className="rounded p-1 transition hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:hover:text-indigo-400"
                    title="Zoom in"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onToggleGrid}
                    className={`ml-3 inline-flex items-center gap-1 rounded px-2 py-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        showGrid
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                            : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300'
                    }`}
                    title="Toggle grid overlay"
                >
                    <Grid className="h-3.5 w-3.5" />
                    Grid
                </button>
            </div>

            <button
                type="button"
                onClick={onToggleTheme}
                className="rounded-md border border-slate-200 p-2 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-slate-700 dark:hover:bg-slate-800"
                title="Toggle theme"
            >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
        </div>
    );
}
