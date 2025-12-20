'use client';

import { useEffect } from 'react';
import { useTemplateBuilderStore } from '@/store/useTemplateBuilderStore';

export default function KeyboardShortcuts() {
    const { selectedLayers, copyLayers, pasteLayers, duplicateLayer, copyStyle, pasteStyle } = useTemplateBuilderStore();

    useEffect(() => {
        const handle = (e) => {
            // COPY
            if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
                if (e.altKey && selectedLayers?.length) {
                    copyStyle(selectedLayers[0]);
                } else {
                    copyLayers(selectedLayers || []);
                }
                e.preventDefault();
                return;
            }

            // PASTE
            if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
                if (e.altKey) {
                    pasteStyle(selectedLayers || []);
                } else {
                    pasteLayers();
                }
                e.preventDefault();
                return;
            }

            // UNDO
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                useTemplateBuilderStore.getState().undoHistory();
                e.preventDefault();
            }

            // REDO
            if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                useTemplateBuilderStore.getState().redoHistory();
                e.preventDefault();
            }

            // DUPLICATE (⌘D / Ctrl+D)
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                if (!selectedLayers?.length) return;

                selectedLayers.forEach((id) => {
                    duplicateLayer(id);
                });

                e.preventDefault();
            }
        };;

        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [selectedLayers, copyLayers, pasteLayers, duplicateLayer, copyStyle, pasteStyle]);

    return null;
}
