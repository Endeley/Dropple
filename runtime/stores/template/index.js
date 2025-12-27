import { create } from 'zustand';
import { createLayerEngine } from './layerEngine';
import { createClipboardEngine } from './clipboardEngine';

export const useTemplateBuilderStore = create((set, get) => ({
    ...createLayerEngine(set, get),
    ...createClipboardEngine(set, get),

    // global state
    currentTemplate: {},
    pages: [],
    activePageId: 'page_1',
}));
