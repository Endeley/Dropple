'use client';

import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react';
import { stackClientApp } from '../stack/client';
import UserSyncClient from '../components/UserSyncClient.jsx';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

function useStackConvexAuth() {
    const user = stackClientApp.useUser();
    const fetchAccessToken = stackClientApp.getConvexClientAuth({ tokenStore: 'nextjs-cookie' });

    return {
        isLoading: false,
        isAuthenticated: Boolean(user),
        fetchAccessToken,
    };
}

export default function ConvexClientProvider({ children }) {
    if (!convexClient) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Convex client could not be initialised. Check NEXT_PUBLIC_CONVEX_URL.');
        }

        return <>{children}</>;
    }

    return (
        <ConvexProviderWithAuth client={convexClient} useAuth={useStackConvexAuth}>
            <UserSyncClient />
            {children}
        </ConvexProviderWithAuth>
    );
}
