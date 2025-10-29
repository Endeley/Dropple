'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '../context/CanvasStore';
import { shallow } from 'zustand/shallow';

const SAVE_DEBOUNCE_MS = 1200;
const RESET_IDLE_MS = 4000;

export function useAutosaveMonitor() {
    useEffect(() => {
        let saveTimeoutId = null;
        let idleTimeoutId = null;

        const triggerAutosave = () => {
            const store = useCanvasStore.getState();
            if (store.autosaveStatus !== 'saving') {
                store.setAutosaveStatus('saving');
            }
            if (saveTimeoutId) window.clearTimeout(saveTimeoutId);
            if (idleTimeoutId) window.clearTimeout(idleTimeoutId);
            saveTimeoutId = window.setTimeout(() => {
                const timestamp = Date.now();
                useCanvasStore.getState().markAutosaveComplete(timestamp);
                idleTimeoutId = window.setTimeout(() => {
                    const latest = useCanvasStore.getState();
                    if (latest.autosaveStatus === 'saved') {
                        latest.setAutosaveStatus('idle');
                    }
                }, RESET_IDLE_MS);
            }, SAVE_DEBOUNCE_MS);
        };

        const unsubscribe = useCanvasStore.subscribe(
            (state) => ({
                frames: state.frames,
                comments: state.comments,
                timelineAssets: state.timelineAssets,
                modeState: state.modeState,
                assetLibrary: state.assetLibrary,
            }),
            triggerAutosave,
            { equalityFn: shallow },
        );

        const handleBeforeUnload = () => {
            const store = useCanvasStore.getState();
            if (store.autosaveStatus === 'saving') {
                store.markAutosaveComplete(Date.now());
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (saveTimeoutId) window.clearTimeout(saveTimeoutId);
            if (idleTimeoutId) window.clearTimeout(idleTimeoutId);
        };
    }, []);
}
