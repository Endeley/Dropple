"use client";

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEditorStore } from '@/lib/stores/editorStore';

const isValidUserId = (value) =>
    typeof value === 'string' && value.length > 12 && !value.startsWith('guest') && !value.startsWith('preview');

export function useDesignSync(userId, currentDesignId) {
    const saveDesign = useMutation(api.designs.update);
    const createDesign = useMutation(api.designs.create);
    const canSync = isValidUserId(userId);
    const designList = useQuery(api.designs.list, canSync ? { userId } : 'skip');

    const title = useEditorStore((state) => state.title);
    const screens = useEditorStore((state) => state.screens);

    useEffect(() => {
        if (!canSync) return;
        const timer = setTimeout(async () => {
            if (currentDesignId) {
                await saveDesign({ id: currentDesignId, title, pages: screens });
            } else {
                await createDesign({ userId, title, pages: screens });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [title, screens, userId, currentDesignId, saveDesign, createDesign, canSync]);

    return { designList };
}
