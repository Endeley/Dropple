'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import CanvasContainer from './components/canvas/CanvasContainer';
import ModeToolbar from './components/canvas/ModeToolbar';
import ToolSidebar from './components/canvas/ToolSidebar';
import CanvasControls from './components/canvas/CanvasControls';
import InspectorPanel from './components/canvas/InspectorPanel';
import { useCanvasStore } from './components/canvas/context/CanvasStore';
import PrototypeOverlay from './components/canvas/PrototypeOverlay';
import ToolOverlayLayer from './components/canvas/overlays/ToolOverlayLayer';
import { MODE_ASSETS } from './components/canvas/modeConfig';
import { deriveModeTheme } from './components/canvas/utils/themeUtils';
import VideoWorkspace from './components/video/VideoWorkspace';

export default function WorkspacePage() {
    const mode = useCanvasStore((state) => state.mode);
    const accentHex = MODE_ASSETS[mode]?.accent ?? '#6366F1';
    const theme = useMemo(() => deriveModeTheme(accentHex), [accentHex]);
    const themeVars = useMemo(
        () => ({
            '--mode-accent': theme.accent,
            '--mode-accent-hex': theme.accentHex,
            '--mode-accent-soft': theme.accentSoft,
            '--mode-toolbar-bg': theme.toolbarBg,
            '--mode-sidebar-bg': theme.sidebarBg,
            '--mode-panel-bg': theme.panelBg,
            '--mode-border': theme.border,
            '--mode-text': theme.textPrimary,
            '--mode-text-muted': theme.textMuted,
            '--mode-canvas-bg': theme.canvasBg,
            '--mode-canvas-overlay': theme.canvasOverlay,
        }),
        [theme],
    );

    const accentHexLower = typeof theme.accentHex === 'string' ? theme.accentHex.toLowerCase() : '';

    const isVideoMode = mode === 'video';

    if (isVideoMode) {
        return (
            <div
                data-workspace-root
                data-mode={mode}
                data-accent-hex={accentHexLower}
                className='flex h-screen flex-col overflow-hidden'
                style={{ ...themeVars, background: 'var(--mode-canvas-bg)', color: 'var(--mode-text)' }}>
                <header
                    className='flex items-center justify-between border-b px-6 py-4 text-xs backdrop-blur'
                    style={{ background: 'var(--mode-toolbar-bg)', borderColor: 'var(--mode-border)', color: 'var(--mode-text-muted)' }}>
                    <div>
                        <h1 className='text-lg font-semibold' style={{ color: 'var(--mode-text)' }}>
                            Dropple Workspace
                        </h1>
                        <p>Infinite canvas foundation • Mode: {mode}</p>
                    </div>
                    <Link
                        href='/'
                        className='rounded-full border px-4 py-2 font-semibold uppercase tracking-[0.25em] text-[color:var(--mode-text)] transition-colors hover:bg-[var(--mode-accent-soft)]'
                        style={{ borderColor: 'var(--mode-border)' }}>
                        Exit
                    </Link>
                </header>
                <main className='relative flex flex-1 flex-col overflow-hidden' style={{ background: 'var(--mode-panel-bg)' }}>
                    <ModeToolbar />
                    <VideoWorkspace />
                </main>
            </div>
        );
    }

    return (
        <div
            data-workspace-root
            data-mode={mode}
            data-accent-hex={accentHexLower}
            className='flex h-screen flex-col overflow-hidden'
            style={{ ...themeVars, background: 'var(--mode-canvas-bg)', color: 'var(--mode-text)' }}>
            <header
                className='flex items-center justify-between border-b px-6 py-4 text-xs backdrop-blur'
                style={{ background: 'var(--mode-toolbar-bg)', borderColor: 'var(--mode-border)', color: 'var(--mode-text-muted)' }}>
                <div>
                    <h1 className='text-lg font-semibold' style={{ color: 'var(--mode-text)' }}>
                        Dropple Workspace
                    </h1>
                    <p>Infinite canvas foundation • Mode: {mode}</p>
                </div>
                <Link
                    href='/'
                    className='rounded-full border px-4 py-2 font-semibold uppercase tracking-[0.25em] text-[color:var(--mode-text)] transition-colors hover:bg-[var(--mode-accent-soft)]'
                    style={{ borderColor: 'var(--mode-border)' }}>
                    Exit
                </Link>
            </header>
            <div className='relative flex flex-1 overflow-hidden'>
                <ToolSidebar />
                <main className='relative flex flex-1 flex-col overflow-hidden' style={{ background: 'var(--mode-panel-bg)' }}>
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
