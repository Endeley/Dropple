'use client';

import { create } from 'zustand';

const initialFrame = {
    id: 'frame-1',
    name: 'Home Page',
    x: 160,
    y: 120,
    width: 1440,
    height: 1024,
    elements: [],
};

export const useCanvasStore = create((set, get) => ({
    mode: 'design',
    scale: 1,
    position: { x: 0, y: 0 },
    frames: [initialFrame],
    setMode: (mode) => set({ mode }),
    setScale: (scale) => set({ scale }),
    setPosition: (position) => set({ position }),
    addFrame: (frame) => set((state) => ({ frames: [...state.frames, frame] })),
    updateFrame: (id, updates) =>
        set((state) => ({
            frames: state.frames.map((frame) => (frame.id === id ? { ...frame, ...updates } : frame)),
        })),
    addElementToFrame: (frameId, element) =>
        set((state) => ({
            frames: state.frames.map((frame) =>
                frame.id === frameId ? { ...frame, elements: [...frame.elements, element] } : frame,
            ),
        })),
    updateElement: (frameId, elementId, updates) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    elements: frame.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
                };
            }),
        })),
    removeElement: (frameId, elementId) =>
        set((state) => ({
            frames: state.frames.map((frame) => {
                if (frame.id !== frameId) return frame;
                return {
                    ...frame,
                    elements: frame.elements.filter((el) => el.id !== elementId),
                };
            }),
        })),
    resetCanvas: () => set({ scale: 1, position: { x: 0, y: 0 }, frames: [initialFrame] }),
    getFrameById: (id) => get().frames.find((frame) => frame.id === id),
}));
