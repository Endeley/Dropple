'use client';

import { useEffect } from 'react';
import { useSelectionStore } from '@/zustand/selectionStore';
import { useHistoryStore } from '@/zustand/historyStore';
import { dispatchEvent } from '@/lib/dispatch/dispatchEvent';

export default function KeyboardShortcuts() {
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const setSelected = useSelectionStore((s) => s.setSelectedManual);
    const clearSelection = useSelectionStore((s) => s.clearSelection);

    const record = useHistoryStore((s) => s.recordSnapshot);
    const undo = useHistoryStore((s) => s.undo);
    const redo = useHistoryStore((s) => s.redo);

    useEffect(() => {
        const onKeyDown = (e) => {
            const key = e.key.toLowerCase();
            const meta = e.metaKey || e.ctrlKey;

            /* -----------------------------
         DELETE
      ----------------------------- */
            if (key === 'delete' || key === 'backspace') {
                if (!selectedIds.length) return;

                record('before-delete');

                selectedIds.forEach((id) => {
                    dispatchEvent({
                        type: 'NODE_DELETE',
                        payload: { id },
                    });
                });

                clearSelection();
                record('after-delete');
                e.preventDefault();
                return;
            }

            /* -----------------------------
         DUPLICATE (Cmd/Ctrl + D)
      ----------------------------- */
            if (meta && key === 'd') {
                if (!selectedIds.length) return;

                record('before-duplicate');

                selectedIds.forEach((id) => {
                    dispatchEvent({
                        type: 'NODE_DUPLICATE',
                        payload: { id },
                    });
                });

                record('after-duplicate');
                e.preventDefault();
                return;
            }

            /* -----------------------------
         MOVE (ARROWS)
      ----------------------------- */
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                if (!selectedIds.length) return;

                const offset = e.shiftKey ? 10 : 1;
                record('before-move');

                selectedIds.forEach((id) => {
                    const dx = key === 'arrowleft' ? -offset : key === 'arrowright' ? offset : 0;
                    const dy = key === 'arrowup' ? -offset : key === 'arrowdown' ? offset : 0;

                    dispatchEvent({
                        type: 'NODE_TRANSLATE',
                        payload: { id, dx, dy },
                    });
                });

                record('after-move');
                e.preventDefault();
                return;
            }

            /* -----------------------------
         GROUP / UNGROUP (PLACEHOLDER)
      ----------------------------- */
            if (meta && key === 'g') {
                e.preventDefault();
                return;
            }

            /* -----------------------------
         UNDO / REDO
      ----------------------------- */
            if (meta && key === 'z' && !e.shiftKey) {
                undo();
                e.preventDefault();
                return;
            }

            if ((meta && e.shiftKey && key === 'z') || (meta && key === 'y')) {
                redo();
                e.preventDefault();
                return;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedIds, clearSelection, setSelected, record, undo, redo]);

    return null;
}
