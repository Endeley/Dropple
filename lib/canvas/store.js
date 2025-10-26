'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const initialState = {
    mode: 'design',
    zoom: 1,
    pan: { x: 0, y: 0 },
    isPanning: false,
    selection: [],
};

export const useCanvasStore = create(
    devtools((set) => ({
        ...initialState,
        setMode: (mode) => set({ mode }),
        setZoom: (zoom) => set({ zoom }),
        setPan: (pan) => set({ pan }),
        setIsPanning: (isPanning) => set({ isPanning }),
        setSelection: (selection) => set({ selection }),
        resetCanvasState: () => set(initialState),
    })),
);
