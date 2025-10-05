'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { stackClientApp } from '../stack/client';

export default function UserSyncClient() {
    const user = stackClientApp.useUser();
    const upsertUser = useMutation(api.users.upsert);
    const lastSyncedUserId = useRef(null);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        if (lastSyncedUserId.current === user.id) {
            return;
        }

        lastSyncedUserId.current = user.id;

        const primaryEmail = user.primaryEmail?.emailAddress ?? '';
        const displayName = user.displayName ?? (primaryEmail || 'Dropple user');
        const profileImageUrl = user.profileImageUrl ?? undefined;

        void upsertUser({
            stackUserId: user.id,
            displayName,
            primaryEmail,
            profileImageUrl,
        });
    }, [user, upsertUser]);

    return null;
}
