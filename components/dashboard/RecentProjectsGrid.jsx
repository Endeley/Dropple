'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { recentProjects } from '../../lib/constants/dashboard.constants';

const slugify = (value = '') =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'project';

export default function RecentProjectsGrid() {
    const [shareMessage, setShareMessage] = useState(null);

    const projects = useMemo(
        () =>
            recentProjects.map((project) => ({
                ...project,
                slug: project.slug ?? slugify(project.title),
                href: project.href ?? `/editor?project=${project.slug ?? slugify(project.title)}`,
            })),
        []
    );

    const handleShare = useCallback(async (project) => {
        const shareUrl =
            project.shareUrl ??
            (typeof window !== 'undefined' ? `${window.location.origin}/projects/${project.slug}` : `/projects/${project.slug}`);

        if (navigator?.share) {
            try {
                await navigator.share({
                    title: project.title,
                    text: `Take a look at “${project.title}” on Dropple.`,
                    url: shareUrl,
                });
                setShareMessage(`Shared “${project.title}”`);
            } catch (error) {
                if (error?.name !== 'AbortError') {
                    console.error('Share failed', error);
                    setShareMessage('Unable to share right now');
                }
            }
            return;
        }

        if (navigator?.clipboard) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setShareMessage(`Copied link for “${project.title}”`);
                return;
            } catch (error) {
                console.error('Clipboard write failed', error);
            }
        }

        setShareMessage('Copy link manually from the address bar.');
    }, []);

    const dismissNotice = useCallback(() => setShareMessage(null), []);

    return (
        <section className='flex flex-col gap-4'>
            <h2 className='text-base font-semibold text-slate-900 dark:text-white'>Recent Projects</h2>
            {shareMessage ? (
                <div className='flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200'>
                    <span>{shareMessage}</span>
                    <button onClick={dismissNotice} className='text-indigo-500 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200'>
                        Dismiss
                    </button>
                </div>
            ) : null}
            <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'>
                {projects.map((project) => (
                    <article key={project.slug} className='flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md dark:shadow-slate-950/40'>
                        <Link href={project.href} className='group flex flex-col gap-3 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={project.image} alt={project.title} loading='lazy' className='h-36 w-full rounded-xl object-cover ring-0 transition group-hover:ring-2 group-hover:ring-indigo-200' />
                            <div className='text-sm font-medium text-slate-800 dark:text-slate-100'>{project.title}</div>
                        </Link>
                        <div className='flex items-center justify-between text-xs font-semibold'>
                            <Link href={project.href} className='rounded-full border border-[var(--border)] px-3 py-1 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:text-slate-200'>
                                Edit
                            </Link>
                            <button
                                type='button'
                                className='rounded-full border border-[var(--border)] px-3 py-1 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:text-slate-200'
                                onClick={() => handleShare(project)}>
                                Share
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
