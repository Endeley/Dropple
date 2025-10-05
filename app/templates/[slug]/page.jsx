import Link from 'next/link';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { redirect, notFound } from 'next/navigation';
import { api } from '../../../convex/_generated/api';
import { requireUser } from '../../../lib/stack-auth';
import { Button } from '../../../components/ui/button';
import TemplateCard from '../../../components/templates/TemplateCard.jsx';

export default async function TemplateDetailPage({ params }) {
    const routeParams = await params;
    const template = await fetchQuery(api.templates.getBySlug, { slug: routeParams.slug });

    if (!template) {
        notFound();
    }

    const primarySource = template.category
        ? await fetchQuery(api.templateBrowser.listByCategory, { key: template.category, limit: 6 })
        : await fetchQuery(api.templateBrowser.listRecent, { limit: 6 });

    const relatedAccumulator = [];
    const seenIds = new Set([template._id]);

    for (const tpl of primarySource ?? []) {
        if (!seenIds.has(tpl._id)) {
            seenIds.add(tpl._id);
            relatedAccumulator.push(tpl);
            if (relatedAccumulator.length === 4) break;
        }
    }

    if (relatedAccumulator.length < 4) {
        const fallback = await fetchQuery(api.templateBrowser.listRecent, { limit: 12 });
        for (const tpl of fallback ?? []) {
            if (!seenIds.has(tpl._id)) {
                seenIds.add(tpl._id);
                relatedAccumulator.push(tpl);
                if (relatedAccumulator.length === 4) break;
            }
        }
    }

    const related = relatedAccumulator.slice(0, 4);

    async function startDesignAction() {
        'use server';
        const user = await requireUser(`/templates/${routeParams.slug}`);
        const convexUser = await fetchQuery(api.users.getByStackUserId, { stackUserId: user.id });
        if (!convexUser) {
            throw new Error('Convex user record not found for current session');
        }

        const designId = await fetchMutation(api.templates.startFromTemplate, {
            templateId: template._id,
            userId: convexUser._id,
        });

        redirect(`/editor/${designId}`);
    }

    return (
        <div className='mx-auto max-w-6xl space-y-10 px-6 py-10'>
            <nav className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                <Link href='/templates' className='transition hover:text-indigo-500'>All Templates</Link>
                <span>/</span>
                <span>{template.category ?? 'General'}</span>
                <span>/</span>
                <span className='text-slate-700 font-medium dark:text-slate-200'>{template.title}</span>
            </nav>

            <div className='grid gap-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,1fr)]'>
                <div className='space-y-6'>
                    <div className='overflow-hidden rounded-2xl border border-white/60 bg-[var(--surface-muted)] dark:border-slate-800'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={template.thumbnailUrl ?? '/placeholder.png'}
                            alt={template.title}
                            className='h-full w-full object-cover'
                        />
                    </div>
                    {template.tags && template.tags.length ? (
                        <div className='flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400'>
                            {template.tags.map((tag) => (
                                <span key={tag} className='rounded-full border border-[var(--border)] px-3 py-1'>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                <form action={startDesignAction} className='flex flex-col gap-6 rounded-2xl border border-white/70 bg-white/90 p-6 text-sm dark:border-slate-800 dark:bg-slate-900/80'>
                    <div className='space-y-2'>
                        <div className='inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'>
                            {template.isPremium ? 'Premium' : 'Free'}
                        </div>
                        <h1 className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>{template.title}</h1>
                        {template.description ? (
                            <p className='text-slate-600 dark:text-slate-300'>{template.description}</p>
                        ) : (
                            <p className='text-slate-600 dark:text-slate-300'>Customize this template to fit your brand and publish in minutes.</p>
                        )}
                    </div>

                    <div className='grid gap-3 text-xs text-slate-500 dark:text-slate-400'>
                        <div className='flex justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 font-medium text-slate-700 dark:bg-slate-900/60 dark:text-slate-200'>
                            <span>Category</span>
                            <span>{template.category ?? 'Uncategorized'}</span>
                        </div>
                        {template.usageCount !== undefined ? (
                            <div className='flex justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 font-medium text-slate-700 dark:bg-slate-900/60 dark:text-slate-200'>
                                <span>Uses</span>
                                <span>{template.usageCount}</span>
                            </div>
                        ) : null}
                    </div>

                    <div className='flex flex-col gap-3'>
                        <Button type='submit' className='w-full rounded-full text-sm'>
                            Use this template
                        </Button>
                        <Button type='button' variant='outline' className='w-full rounded-full text-sm'>
                            Add to favorites
                        </Button>
                    </div>
                </form>
            </div>

            {related.length ? (
                <section className='space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm'>
                    <h2 className='text-base font-semibold text-slate-900 dark:text-slate-100'>You may also like</h2>
                    <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4'>
                        {related.map((tpl) => (
                            <TemplateCard key={tpl._id} tpl={tpl} compact />
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
