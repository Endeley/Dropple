'use client';

import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEditorStore } from '@/lib/stores/editorStore';

export default function EditorSync({ designId, userId }) {
    const { screens, title } = useEditorStore();
    const saveDesign = useMutation(api.designs.update);

    useEffect(() => {
        if (!designId || !userId) return;
        const timer = setTimeout(() => {
            saveDesign({
                id: designId,
                title,
                pages: screens,
                userId,
                updatedAt: Date.now(),
            });
        }, 1200);
        return () => clearTimeout(timer);
    }, [screens, title, designId, userId, saveDesign]);

    return null;
}
