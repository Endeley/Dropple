'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '../context/CanvasStore';
import { MODE_LIST } from '../modeConfig';

function isEditableTarget(target) {
    if (!target) return false;
    if (target instanceof HTMLElement) {
        const tag = target.tagName;
        return (
            target.isContentEditable ||
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT'
        );
    }
    return false;
}

function cycleMode(direction) {
    const store = useCanvasStore.getState();
    const currentMode = store.mode;
    const index = MODE_LIST.indexOf(currentMode);
    if (index === -1) return;
    const nextIndex = (index + direction + MODE_LIST.length) % MODE_LIST.length;
    store.sendModeIntent(MODE_LIST[nextIndex], {
        source: 'hotkey',
        badge: 'Mode Switch',
        message: direction > 0 ? 'Loading next creative mode…' : 'Returning to previous mode…',
    });
}

function ungroupSelection() {
    const store = useCanvasStore.getState();
    const { selectedFrameId, selectedElementIds } = store;
    if (!selectedFrameId || selectedElementIds.length === 0) return;
    const frame = store.getFrameById(selectedFrameId);
    if (!frame) return;
    selectedElementIds
        .map((id) => frame.elements.find((element) => element.id === id))
        .filter((element) => element && element.type === 'group')
        .forEach((group) => {
            store.ungroupElement(selectedFrameId, group.id);
        });
}

export function useGlobalHotkeys() {
    useEffect(() => {
        const handleKeyDown = (event) => {
            const meta = event.metaKey || event.ctrlKey;
            const alt = event.altKey;
            const shift = event.shiftKey;
            const key = event.key.toLowerCase();

            const target = event.target;
            if (isEditableTarget(target)) {
                return;
            }

            if (meta && !shift && !alt && key === 'a') {
                event.preventDefault();
                useCanvasStore.getState().selectAllElements();
                return;
            }

            if (meta && !shift && !alt && key === 'd') {
                event.preventDefault();
                useCanvasStore.getState().duplicateSelectedElements();
                return;
            }

            if (meta && !alt && !shift && key === 'g') {
                event.preventDefault();
                useCanvasStore.getState().groupSelectedElements();
                return;
            }

            if (meta && shift && !alt && key === 'g') {
                event.preventDefault();
                ungroupSelection();
                return;
            }

            if (meta && alt && !shift && event.key === 'ArrowRight') {
                event.preventDefault();
                cycleMode(1);
                return;
            }

            if (meta && alt && !shift && event.key === 'ArrowLeft') {
                event.preventDefault();
                cycleMode(-1);
                return;
            }

            if (!meta && !alt && !shift && (key === 'delete' || key === 'backspace')) {
                const store = useCanvasStore.getState();
                if (store.selectedElementIds.length > 0) {
                    event.preventDefault();
                    store.removeSelectedElements();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
