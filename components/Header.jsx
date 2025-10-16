'use client';
import Link from 'next/link';
import { useCallback } from 'react';
import { stackClientApp } from '../stack/client';
import { headerLinks } from '../lib/constants/home.constants';
import BrandMark from './BrandMark.jsx';

export default function Header() {
    const user = stackClientApp.useUser();
    const handleSignOut = useCallback(async () => {
        await stackClientApp.signOut({ redirectTo: '/' });
    }, []);

    return (
        <header className='flex items-center justify-between gap-6 rounded-full border border-slate-100 bg-white/90 px-6 py-4 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-slate-900/50'>
            <BrandMark
                href='/'
                size={36}
                priority
                className='font-semibold text-slate-900 dark:text-white'
                labelClassName='text-lg tracking-tight'
            />

            <nav className='hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300'>
                {headerLinks.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className='transition-colors hover:text-slate-900 dark:hover:text-white'
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className='flex items-center gap-3'>
                {user ? (
                    <>
                        <Link
                            href='/dashboard'
                            className='hidden rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-50 md:inline-flex dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-500/10'
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className='rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-400/30 transition hover:bg-indigo-600 dark:shadow-indigo-900/40'
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href='/handler/sign-in'
                            className='rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-500/10'
                        >
                            Sign in
                        </Link>
                        <Link
                            href='/handler/sign-up'
                            className='rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-400/30 transition hover:bg-indigo-600 dark:shadow-indigo-900/40'
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
