'use client';

import { useMemo } from 'react';
import { UserButton } from '@stackframe/stack';
import { Menu } from 'lucide-react';

export default function DashboardHeader({ userName, profileImage, searchPlaceholder = 'Search', onToggleSidebar }) {
    const fallbackAvatar = useMemo(
        () =>
            profileImage ??
            'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
        [profileImage]
    );

    return (
        <header className='flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/40 md:px-6'>
            <button
                type='button'
                onClick={() => onToggleSidebar?.()}
                className='inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 p-2 text-slate-700 transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/70 md:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle navigation</span>
            </button>
            <label className='flex w-full items-center gap-3 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400'>
                <span>🔍</span>
                <input
                    type='search'
                    placeholder={searchPlaceholder}
                    className='w-full bg-transparent text-slate-700 outline-none dark:text-slate-200'
                />
            </label>
            <UserButton
                type='button'
                variant='ghost'
                asChild
                className='rounded-full border border-[var(--border)] bg-white/80 p-0 text-slate-700 hover:bg-white/90 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/70'>
                <span className='flex items-center gap-3 px-4 py-2 text-sm font-medium'>
                    <span className='max-w-[140px] truncate text-left'>{userName}</span>
                    <img src={fallbackAvatar} alt='Profile avatar' className='h-9 w-9 rounded-full object-cover' />
                </span>
            </UserButton>
        </header>
    );
}
