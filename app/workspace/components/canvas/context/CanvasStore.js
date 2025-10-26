'use client';

import { create } from 'zustand';

const initialFrame = {
    id: 'frame-1',
    name: 'Home Page',
    x: 160,
    y: 120,
    width: 1440,
    height: 1024,
    elements: [
        {
            id: 'text-hero',
            type: 'text',
            props: {
                text: 'Welcome to Dropple',
                fontSize: 48,
                fill: 'rgba(236,233,254,0.95)',
                fontStyle: 'bold',
                x: 120,
                y: 140,
                width: 520,
            },
        },
        {
            id: 'rect-card',
            type: 'rect',
            props: {
                x: 120,
                y: 260,
                width: 420,
                height: 220,
                fill: 'rgba(139,92,246,0.18)',
                cornerRadius: 24,
            },
        },
    ],
};

export const useCanvasStore = create((set, get) => ({
    mode: 'design',
    scale: 1,
    position: { x: 0, y: 0 },
    frames: [initialFrame],
    selectedFrameId: initialFrame.id,
    selectedElementId: null,
    selectedTool: 'pointer',
    setMode: (mode) => set({ mode }),
    setScale: (scale) => set({ scale }),
    setPosition: (position) => set({ position }),
    setSelectedTool: (tool) => set({ selectedTool: tool }),
    setSelectedFrame: (id) => set({ selectedFrameId: id, selectedElementId: null }),
    setSelectedElement: (frameId, elementId) => set({ selectedFrameId: frameId, selectedElementId: elementId }),
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
    resetCanvas: () =>
        set({
            scale: 1,
            position: { x: 0, y: 0 },
            frames: [initialFrame],
            selectedFrameId: initialFrame.id,
            selectedElementId: null,
        }),
    getFrameById: (id) => get().frames.find((frame) => frame.id === id),
}));
