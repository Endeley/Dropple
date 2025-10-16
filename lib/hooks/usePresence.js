"use client";

import { useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const isValidUserId = (value) =>
    typeof value === 'string' && value.length > 12 && !value.startsWith('guest') && !value.startsWith('preview');

export function usePresence(designId, user) {
    const updatePresence = useMutation(api.presence.updatePresence);
    const canSync = Boolean(designId) && isValidUserId(user?.id);
    const presences = useQuery(api.presence.list, canSync ? { designId } : 'skip') || [];

    useEffect(() => {
        if (!canSync) return;

        const handleMove = (event) => {
            updatePresence({
                userId: user.id,
                userName: user.name,
                userAvatar: user.image,
                designId,
                cursor: { x: event.clientX, y: event.clientY },
                active: true,
            });
        };

        const handleLeave = () => {
            updatePresence({
                userId: user.id,
                userName: user.name,
                userAvatar: user.image,
                designId,
                active: false,
            });
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('beforeunload', handleLeave);

        const interval = setInterval(() => {
            updatePresence({
                userId: user.id,
                userName: user.name,
                userAvatar: user.image,
                designId,
                active: true,
            });
        }, 5000);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('beforeunload', handleLeave);
            clearInterval(interval);
        };
    }, [user, designId, updatePresence, canSync]);

    return presences;
}
