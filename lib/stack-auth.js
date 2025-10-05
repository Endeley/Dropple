'use server';

import { redirect } from 'next/navigation';
import { stackServerApp } from '../stack/server';

const SIGN_IN_PATH = '/handler/sign-in';

/**
 * Returns the current Stack user if one exists, otherwise null.
 */
export async function getCurrentUser() {
    return await stackServerApp.getUser({ or: 'return-null' });
}

/**
 * Ensures a Stack user exists for the current request; redirects to sign-in when missing.
 */
export async function requireUser(returnTo = '/dashboard') {
    const user = await getCurrentUser();
    if (user) {
        return user;
    }

    const searchParams = new URLSearchParams();
    if (returnTo) {
        searchParams.set('after_auth_return_to', returnTo);
    }

    redirect(`${SIGN_IN_PATH}${searchParams.toString() ? `?${searchParams}` : ''}`);
}
