'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '@/lib/stores/editorStore';
import { DEVICE_PRESETS, TEMPLATE_PRESETS } from '@/lib/utils/constants';
import UILayersPanel from './panels/UILayersPanel';
import UILibraryPanel from './panels/UILibraryPanel';
import UIPagesPanel from './panels/UIPagesPanel';
import UIInspectorPanel from './panels/UIInspectorPanel';
import EditorToolbar from './EditorToolbar';
import UIDesignerCanvas from './UIDesignerCanvas';
import AIPalettePanel from './AIPalettePanel';
import DesignExportPanel from './DesignExportPanel';
import { useChat } from '@/lib/hooks/useChat';
import ChatBox from '@/components/chat/ChatBox';
import OnlineUsers from './OnlineUsers';
import { usePresence } from '@/lib/hooks/usePresence';
import CollaborativeCursors from './CollaborativeCursors';
import { useSharedCanvas } from '@/lib/hooks/useSharedCanvas';

export default function UIDesignerWorkspace({ userId, designId }) {
    const screens = useEditorStore((state) => state.screens);
    const activeScreenId = useEditorStore((state) => state.activeScreenId);
    const activeScreen = useEditorStore((state) => state.activeScreen);
    const addScreen = useEditorStore((state) => state.addScreen);
    const renameScreen = useEditorStore((state) => state.renameScreen);
    const deleteScreen = useEditorStore((state) => state.deleteScreen);
    const duplicateScreen = useEditorStore((state) => state.duplicateScreen);
    const selectScreen = useEditorStore((state) => state.selectScreen);
    const selectedIds = useEditorStore((state) => state.selectedIds);
    const setSelectedIds = useEditorStore((state) => state.setSelectedIds);

    const [darkMode, setDarkMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [showGrid, setShowGrid] = useState(true);
    const [assets, setAssets] = useState([]);

    const designKey = useMemo(() => designId ?? `design-${Math.random().toString(36).slice(2, 10)}`, [designId]);

    useEffect(() => {
        if (!designKey) return;
        const existing = screens.find((screen) => screen.id === designKey);
        if (!existing) {
            addScreen({ id: designKey, label: 'Blank Canvas', kind: 'blank' });
        } else if (activeScreenId !== designKey) {
            selectScreen(designKey);
        }
    }, [designKey, screens, addScreen, selectScreen, activeScreenId]);

    const handleSelectLayer = useCallback(
        (id) => {
            setSelectedIds(id ? [id] : []);
        },
        [setSelectedIds]
    );

    const handleUploadAssets = useCallback((files) => {
        if (!files || !files.length) return;
        const nextAssets = Array.from(files).map((file) => ({
            id: `${file.name}-${file.lastModified}`,
            name: file.name,
            type: file.type,
            size: file.size,
            src: URL.createObjectURL(file),
        }));
        setAssets((prev) => [...prev, ...nextAssets]);
    }, []);

    const handleInsertAsset = useCallback(() => {
        // Hook into canvas insertion workflow here.
    }, []);
    const isRealUser = typeof userId === 'string' && userId.length > 12 && !userId.startsWith('guest');
    const user = {
        id: isRealUser ? userId : undefined,
        name: isRealUser ? 'Endeley' : 'Guest',
        image: isRealUser ? '/avatar.png' : undefined,
    };
    const sharedCanvas = useSharedCanvas({ designId: designKey, user });
    const threadId = `design:${designKey}`;
    const { messages, send, ref } = useChat(threadId, user);
    const presences = usePresence(designKey, user);

    return (
        <div className={`${darkMode ? 'dark' : ''} h-screen w-full overflow-hidden`}>
            <div className="flex h-full">
                <aside className="h-full w-64 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-4 p-3">
                        <OnlineUsers presences={presences} />
                        <UIPagesPanel
                            screens={screens}
                            activeScreenId={activeScreenId}
                            onSelectScreen={selectScreen}
                            onAddScreen={addScreen}
                            onDuplicateScreen={duplicateScreen}
                            onDeleteScreen={deleteScreen}
                            onRenameScreen={renameScreen}
                            templates={TEMPLATE_PRESETS}
                            devices={DEVICE_PRESETS}
                        />
                        <UILibraryPanel
                            assets={assets}
                            onUploadAssets={handleUploadAssets}
                            onInsertAsset={handleInsertAsset}
                            onCreateLayer={sharedCanvas.broadcastLayer}
                            onAddPrimitive={() => {}}
                            onPrimitiveDragStart={() => {}}
                            onPrimitiveDragEnd={() => {}}
                            templates={TEMPLATE_PRESETS}
                        />
                        <UILayersPanel
                            root={activeScreen?.root}
                            selectedIds={selectedIds}
                            onSelectLayer={handleSelectLayer}
                            onToggleVisibility={() => {}}
                            onToggleLock={() => {}}
                        />
                    </div>
                </aside>

                <main className="relative flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
                    <EditorToolbar
                        zoom={zoom}
                        onZoomIn={() => setZoom((value) => Math.min(2, value + 0.1))}
                        onZoomOut={() => setZoom((value) => Math.max(0.5, value - 0.1))}
                        onToggleGrid={() => setShowGrid((value) => !value)}
                        onToggleTheme={() => setDarkMode((value) => !value)}
                        darkMode={darkMode}
                        showGrid={showGrid}
                    />
                    <div className="relative flex-1 overflow-auto">
                        <CollaborativeCursors presences={presences} />
                        {activeScreen ? (
                            <UIDesignerCanvas
                                screen={activeScreen}
                                showGrid={showGrid}
                                zoom={zoom}
                                onZoomChange={setZoom}
                                onLayerChange={sharedCanvas.broadcastLayer}
                                onLayerRemove={sharedCanvas.removeLayer}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-600">
                                No screen selected.
                            </div>
                        )}
                    </div>
                </main>

                <aside className="sticky top-0 h-screen w-72 overflow-y-auto border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="p-3">
                        <UIInspectorPanel onLayerChange={sharedCanvas.broadcastLayer} />
                        <AIPalettePanel />
                        <DesignExportPanel userId={userId} currentDesignId={designId} />
                        <section className="mt-4">
                            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Project Chat</h3>
                            <ChatBox messages={messages} send={send} ref={ref} />
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
}
