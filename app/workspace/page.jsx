'use client';

import Link from 'next/link';
import CanvasContainer from './components/canvas/CanvasContainer';
import ModeToolbar from './components/canvas/ModeToolbar';
import ToolSidebar from './components/canvas/ToolSidebar';
import CanvasControls from './components/canvas/CanvasControls';
import InspectorPanel from './components/canvas/InspectorPanel';
import { useCanvasStore } from './components/canvas/context/CanvasStore';
import PrototypeOverlay from './components/canvas/PrototypeOverlay';
import ToolOverlayLayer from './components/canvas/overlays/ToolOverlayLayer';

export default function WorkspacePage() {
    const mode = useCanvasStore((state) => state.mode);

    return (
        <div className='flex min-h-screen flex-col overflow-hidden bg-[#020617] text-[color:var(--color-text-primary)]'>
            <header className='flex items-center justify-between border-b border-[rgba(148,163,184,0.15)] bg-[rgba(15,23,42,0.75)] px-6 py-4 text-xs text-[rgba(226,232,240,0.7)] backdrop-blur'>
                <div>
                    <h1 className='text-lg font-semibold text-white'>Dropple Workspace</h1>
                    <p>Infinite canvas foundation • Mode: {mode}</p>
                </div>
                <Link
                    href='/'
                    className='rounded-full border border-[rgba(139,92,246,0.4)] px-4 py-2 font-semibold uppercase tracking-[0.25em] text-[rgba(236,233,254,0.85)] transition-colors hover:border-[rgba(236,233,254,0.75)] hover:text-white'
                >
                    Exit
                </Link>
            </header>
            <div className='relative flex flex-1 overflow-hidden'>
                <ToolSidebar />
                <main className='relative flex flex-1 flex-col overflow-hidden bg-[rgba(15,23,42,0.6)]'>
                    <ModeToolbar />
                    <div className='relative flex flex-1 overflow-hidden'>
                        <CanvasContainer />
                        <ToolOverlayLayer />
                    </div>
                    <CanvasControls />
                    <PrototypeOverlay />
                </main>
                <InspectorPanel />
            </div>
        </div>
    );
}
