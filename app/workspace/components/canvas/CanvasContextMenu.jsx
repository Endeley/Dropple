'use client';

import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { useCanvasStore } from './context/CanvasStore';

const MENU_WIDTH = 208;

export default function CanvasContextMenu() {
    const contextMenu = useCanvasStore((state) => state.contextMenu);
    const clipboard = useCanvasStore((state) => state.clipboard);
    const closeContextMenu = useCanvasStore((state) => state.closeContextMenu);
    const copyElement = useCanvasStore((state) => state.copyElement);
    const duplicateElement = useCanvasStore((state) => state.duplicateElement);
    const pasteElement = useCanvasStore((state) => state.pasteElement);
    const removeElement = useCanvasStore((state) => state.removeElement);
    const copyFrame = useCanvasStore((state) => state.copyFrame);
    const duplicateFrame = useCanvasStore((state) => state.duplicateFrame);
    const pasteFrame = useCanvasStore((state) => state.pasteFrame);
    const removeFrame = useCanvasStore((state) => state.removeFrame);

    useEffect(() => {
        if (!contextMenu) return undefined;

        const handlePointer = (event) => {
            if (!(event.target instanceof Element)) {
                closeContextMenu();
                return;
            }
            if (!event.target.closest('[data-canvas-context-menu]')) {
                closeContextMenu();
            }
        };

        const handleKey = (event) => {
            if (event.key === 'Escape') {
                closeContextMenu();
            }
        };

        window.addEventListener('pointerdown', handlePointer, true);
        window.addEventListener('contextmenu', handlePointer, true);
        window.addEventListener('keydown', handleKey);

        return () => {
            window.removeEventListener('pointerdown', handlePointer, true);
            window.removeEventListener('contextmenu', handlePointer, true);
            window.removeEventListener('keydown', handleKey);
        };
    }, [contextMenu, closeContextMenu]);

    const menuPosition = useMemo(() => {
        if (!contextMenu) return null;
        if (typeof window === 'undefined') {
            return { top: contextMenu.position.y, left: contextMenu.position.x };
        }
        const { innerWidth, innerHeight } = window;
        const estimatedHeight = 200;
        let left = contextMenu.position.x;
        let top = contextMenu.position.y;
        if (left + MENU_WIDTH > innerWidth - 12) {
            left = Math.max(12, innerWidth - MENU_WIDTH - 12);
        }
        if (top + estimatedHeight > innerHeight - 12) {
            top = Math.max(12, innerHeight - estimatedHeight - 12);
        }
        return { top, left };
    }, [contextMenu]);

    if (!contextMenu || !menuPosition) return null;

    const { type, frameId, elementId, canvasPoint } = contextMenu;
    const isElementClipboard = clipboard?.type === 'element';
    const isFrameClipboard = clipboard?.type === 'frame';

    const handleAction = (action) => {
        action();
        closeContextMenu();
    };

    const menuItems = [];

    if (type === 'element' && frameId && elementId) {
        menuItems.push(
            {
                key: 'copy-element',
                label: 'Copy',
                onSelect: () => handleAction(() => copyElement(frameId, elementId)),
            },
            {
                key: 'duplicate-element',
                label: 'Duplicate',
                onSelect: () => handleAction(() => duplicateElement(frameId, elementId)),
            },
            {
                key: 'paste-element',
                label: 'Paste',
                disabled: !isElementClipboard,
                onSelect: () => handleAction(() => pasteElement(frameId, canvasPoint)),
            },
            {
                key: 'delete-element',
                label: 'Delete',
                danger: true,
                onSelect: () => handleAction(() => removeElement(frameId, elementId)),
            },
        );
    } else if (type === 'frame' && frameId) {
        menuItems.push(
            {
                key: 'copy-frame',
                label: 'Copy Frame',
                onSelect: () => handleAction(() => copyFrame(frameId)),
            },
            {
                key: 'duplicate-frame',
                label: 'Duplicate Frame',
                onSelect: () => handleAction(() => duplicateFrame(frameId)),
            },
            {
                key: 'paste-frame',
                label: 'Paste Frame',
                disabled: !isFrameClipboard,
                onSelect: () => handleAction(() => pasteFrame(canvasPoint)),
            },
            {
                key: 'paste-element-frame',
                label: 'Paste Element',
                disabled: !isElementClipboard,
                onSelect: () => handleAction(() => pasteElement(frameId, canvasPoint)),
            },
            {
                key: 'delete-frame',
                label: 'Delete Frame',
                danger: true,
                onSelect: () => handleAction(() => removeFrame(frameId)),
            },
        );
    } else if (type === 'canvas') {
        menuItems.push(
            {
                key: 'paste-frame',
                label: 'Paste Frame',
                disabled: !isFrameClipboard,
                onSelect: () => handleAction(() => pasteFrame(canvasPoint)),
            },
            {
                key: 'paste-element',
                label: 'Paste Element',
                disabled: !isElementClipboard,
                onSelect: () => handleAction(() => pasteElement(null, canvasPoint)),
            },
        );
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <div
            data-canvas-context-menu
            className='fixed z-50 min-w-[200px] rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.96)] p-1 shadow-2xl shadow-[rgba(15,23,42,0.45)] backdrop-blur'
            style={{ top: menuPosition.top, left: menuPosition.left }}
        >
            {menuItems.map((item) => (
                <button
                    key={item.key}
                    type='button'
                    onClick={item.disabled ? undefined : item.onSelect}
                    className={clsx(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                        item.disabled
                            ? 'cursor-not-allowed text-[rgba(148,163,184,0.45)]'
                            : item.danger
                                ? 'text-[rgba(248,113,113,0.85)] hover:bg-[rgba(248,113,113,0.15)]'
                                : 'text-[rgba(226,232,240,0.85)] hover:bg-[rgba(139,92,246,0.18)] hover:text-white',
                    )}
                >
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
}
