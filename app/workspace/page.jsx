'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCanvasStore } from '@/lib/canvas/store';

const CanvasStage = dynamic(
    () => import('./components/CanvasStage').then((mod) => mod.CanvasStage),
    {
        ssr: false,
        loading: () => (
            <div className='flex flex-1 items-center justify-center text-sm text-[color:var(--color-text-secondary)]'>
                Preparing workspace…
            </div>
        ),
    },
);

export default function WorkspacePage() {
    const zoom = useCanvasStore((state) => state.zoom);
    const pan = useCanvasStore((state) => state.pan);
    const mode = useCanvasStore((state) => state.mode);

    return (
        <div className='flex min-h-screen flex-col overflow-hidden bg-[var(--color-canvas)] text-[color:var(--color-text-primary)]'>
            <header className='flex items-center justify-between border-b border-[rgba(15,23,42,0.08)] px-6 py-4 backdrop-blur'>
                <div>
                    <h1 className='text-lg font-semibold'>Dropple Workspace</h1>
                    <p className='text-xs text-[color:var(--color-text-secondary)]'>Infinite canvas foundation • Mode: {mode}</p>
                </div>
                <div className='flex items-center gap-4 text-xs text-[color:var(--color-text-secondary)]'>
                    <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
                    <span>Pan: {pan.x.toFixed(0)} × {pan.y.toFixed(0)}</span>
                    <Link
                        href='/'
                        className='rounded-full border border-[rgba(15,23,42,0.1)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-secondary)] transition-colors hover:border-[rgba(139,92,246,0.4)] hover:text-[color:var(--color-primary)]'
                    >
                        Exit
                    </Link>
                </div>
            </header>
            <div className='flex flex-1 overflow-hidden'>
                <aside className='hidden w-64 flex-col border-r border-[rgba(15,23,42,0.08)] bg-[var(--color-surface)] px-5 py-6 text-sm text-[color:var(--color-text-secondary)] lg:flex'>
                    <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(15,23,42,0.65)]'>Modes</p>
                    <nav className='mt-4 flex flex-col gap-3'>
                        {['design', 'video', 'podcast', 'docs', 'ui'].map((item) => (
                            <button
                                key={item}
                                className='flex items-center justify-between rounded-xl border border-transparent bg-transparent px-3 py-2 text-left text-sm capitalize transition-colors hover:border-[rgba(139,92,246,0.3)] hover:text-[color:var(--color-primary)]'
                            >
                                <span>{item}</span>
                                <span className='text-[10px] text-[rgba(15,23,42,0.35)]'>soon</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className='relative flex flex-1 flex-col'>
                    <CanvasStage />
                </main>
            </div>
        </div>
    );
}
