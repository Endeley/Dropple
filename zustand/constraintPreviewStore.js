import { create } from 'zustand';

export const useConstraintPreviewStore = create(() => ({
    previewNodes: null,

    setPreviewNodes: (map) => ({ previewNodes: map }),
    clearPreview: () => ({ previewNodes: null }),
}));
