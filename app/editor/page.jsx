"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Upload, FileText, LayoutDashboard, Shapes, Star, Clock, Sparkles } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import { stackClientApp } from '../../stack/client';

const NAV_SECTIONS = [
    {
        label: 'Workspaces',
        items: [
            { label: 'All Projects', href: '/editor', icon: LayoutDashboard },
            { label: 'Templates', href: '/templates', icon: Shapes },
            { label: 'Favourites', href: '/editor?filter=favourites', icon: Star },
            { label: 'Recent', href: '/editor?filter=recent', icon: Clock },
        ],
    },
    {
        label: 'Teams',
        items: [
            { label: 'Dropple', href: '/editor?team=dropple', badge: 'Team' },
            { label: 'Education', href: '/editor?team=education', badge: 'Classroom' },
        ],
    },
];

const QUICK_ACTIONS = [
    { label: 'New Design', icon: Plus, href: '/editor?filter=new' },
    { label: 'Upload Design File', icon: Upload, href: '/editor?import=upload' },
    { label: 'Import from Template', icon: FileText, href: '/templates' },
];

const RECENT_PROJECTS = [
    { title: 'Product Launch Deck', date: 'Mar 20' },
    { title: 'Weekly Class Slides', date: 'Mar 18' },
    { title: 'Pitch – Spring Cohort', date: 'Mar 16' },
];

function Sidebar() {
    return (
        <aside className='hidden h-full w-60 flex-shrink-0 border-r border-[var(--border,#e2e8f0)] bg-white pb-6 pt-8 md:flex md:flex-col'>
            <div className='px-6 text-lg font-semibold tracking-tight text-slate-900'>Dropple</div>
            <nav className='mt-8 flex-1 space-y-6 px-4 text-sm'>
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} className='space-y-2'>
                        <p className='px-2 text-xs font-semibold uppercase tracking-wide text-slate-400'>{section.label}</p>
                        <div className='space-y-1'>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className='flex items-center justify-between rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900'
                                    >
                                        <span className='flex items-center gap-2'>
                                            {Icon ? <Icon className='h-4 w-4 text-slate-400' /> : null}
                                            {item.label}
                                        </span>
                                        {item.badge ? (
                                            <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500'>
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            <div className='px-4'>
                <div className='rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-5 text-xs text-indigo-600'>
                    <div className='mb-2 inline-flex items-center gap-2 text-sm font-semibold'>
                        <Sparkles className='h-4 w-4' /> Brand Kits
                    </div>
                    Keep colours and fonts consistent across every design.
                </div>
            </div>
        </aside>
    );
}

function QuickActions() {
    return (
        <div className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <h3 className='text-sm font-semibold text-slate-900'>Quick Actions</h3>
            <div className='space-y-2 text-sm'>
                {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className='flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600'
                        >
                            <Icon className='h-4 w-4' />
                            {action.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function RecentProjects() {
    return (
        <div className='space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <h3 className='text-sm font-semibold text-slate-900'>Recent Projects</h3>
            <div className='space-y-3 text-sm text-slate-600'>
                {RECENT_PROJECTS.map((project) => (
                    <div key={project.title} className='flex items-center justify-between rounded-md px-1 py-1 hover:bg-slate-50'>
                        <span>{project.title}</span>
                        <span className='text-xs text-slate-400'>{project.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TemplateGridCard({ template, onUse, isBusy }) {
    return (
        <div className='group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'>
            <Link href={`/templates/${template.slug}`} className='relative block aspect-[4/3] bg-slate-200'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={template.thumbnailUrl ?? '/placeholder.png'}
                    alt={template.title}
                    className='h-full w-full object-cover transition group-hover:scale-[1.02]'
                />
            </Link>
            <div className='flex flex-1 flex-col gap-3 p-4'>
                <div className='space-y-1'>
                    <h3 className='text-sm font-semibold text-slate-900'>{template.title}</h3>
                    <p className='text-xs text-slate-500'>{template.category ?? 'General'}</p>
                </div>
                <p className='text-xs text-slate-400'>Updated {new Date(template.updatedAt ?? Date.now()).toLocaleDateString()}</p>
                <div className='mt-auto flex items-center gap-2 text-xs'>
                    <Link
                        href={`/templates/${template.slug}`}
                        className='inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 px-2 py-2 font-medium text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600'
                    >
                        Preview
                    </Link>
                    <button
                        onClick={() => onUse?.(template)}
                        disabled={isBusy}
                        className='inline-flex items-center justify-center rounded-md bg-indigo-500 px-3 py-2 font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300'
                    >
                        {isBusy ? 'Opening…' : 'Use'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function PopularTemplates({ templates, onUse, pendingId }) {
    return (
        <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-slate-900'>Popular templates</h3>
                <Link href='/templates' className='text-xs font-medium text-indigo-600 hover:text-indigo-700'>View all</Link>
            </div>
            <div className='space-y-3'>
                {templates.map((template) => (
                    <div key={template._id} className='flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm'>
                        <div>
                            <Link href={`/templates/${template.slug}`} className='font-medium text-slate-800 hover:text-indigo-600'>
                                {template.title}
                            </Link>
                            <p className='text-xs text-slate-400'>{template.category ?? 'General'}</p>
                        </div>
                        <button
                            onClick={() => onUse?.(template)}
                            disabled={pendingId === template._id}
                            className='rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:border-indigo-400 hover:text-indigo-700 disabled:cursor-not-allowed disabled:border-indigo-100 disabled:text-indigo-300'
                        >
                            {pendingId === template._id ? 'Opening…' : 'Use'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function EditorHomePage() {
    const router = useRouter();
    const user = stackClientApp.useUser();
    const convexUser = useQuery(api.users.getByStackUserId, user ? { stackUserId: user.id } : 'skip');
    const templatesRecent = useQuery(api.templateBrowser.listRecent, { limit: 9 });
    const templatesPopular = useQuery(api.templateBrowser.listPopular, { limit: 6 });
    const createFromTemplate = useMutation(api.templates.startFromTemplate);

    const [pendingTemplateId, setPendingTemplateId] = useState(null);

    const handleCreateNew = () => {
        router.push('/templates');
    };

    const handleUseTemplate = async (template) => {
        if (!template?._id) return;
        if (!user) {
            router.push('/handler/sign-in?after_auth_return_to=/editor');
            return;
        }
        if (!convexUser?._id) {
            console.warn('Convex user record not ready yet.');
            return;
        }

        try {
            setPendingTemplateId(template._id);
            const designId = await createFromTemplate({
                templateId: template._id,
                userId: convexUser._id,
                title: `${template.title}`,
            });
            router.push(`/editor/${designId}`);
        } catch (error) {
            console.error('Failed to start from template', error);
            setPendingTemplateId(null);
        }
    };

    const recentTemplates = useMemo(() => templatesRecent ?? [], [templatesRecent]);
    const popularTemplates = useMemo(() => templatesPopular ?? [], [templatesPopular]);

    return (
        <div className='flex min-h-screen bg-slate-50 text-slate-900'>
            <Sidebar />
            <div className='flex flex-1 flex-col'>
                <header className='flex flex-col gap-6 border-b border-[var(--border,#e2e8f0)] bg-white px-6 py-6 shadow-sm md:flex-row md:items-center md:justify-between'>
                    <div className='flex-1'>
                        <h1 className='text-2xl font-semibold tracking-tight'>Your Designs</h1>
                        <p className='text-sm text-slate-500'>Pick up where you left off or start something fresh.</p>
                    </div>
                    <div className='flex w-full items-center gap-3 md:w-80'>
                        <div className='relative flex flex-1 items-center'>
                            <input
                                type='search'
                                placeholder='Search designs or templates...'
                                className='w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200'
                            />
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className='inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
                        >
                            <Plus className='h-4 w-4' />
                            New
                        </button>
                    </div>
                </header>

                <div className='flex flex-1 flex-col gap-6 px-6 pb-10 pt-6 xl:flex-row'>
                    <section className='flex flex-1 flex-col gap-6'>
                        <div>
                            <h2 className='text-lg font-semibold text-slate-900'>Dropple</h2>
                            <p className='text-sm text-slate-500'>Recent templates, classroom projects, and drafts.</p>
                        </div>
                        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
                            {recentTemplates.map((template) => (
                                <TemplateGridCard
                                    key={template._id}
                                    template={template}
                                    onUse={handleUseTemplate}
                                    isBusy={pendingTemplateId === template._id}
                                />
                            ))}
                            <button
                                onClick={handleCreateNew}
                                className='flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600'
                            >
                                <Plus className='mb-2 h-5 w-5' />
                                Browse all templates
                            </button>
                        </div>
                    </section>

                    <aside className='hidden w-full max-w-sm flex-shrink-0 flex-col gap-4 xl:flex'>
                        <QuickActions />
                        {popularTemplates.length ? <PopularTemplates templates={popularTemplates} onUse={handleUseTemplate} pendingId={pendingTemplateId} /> : <RecentProjects />}
                    </aside>
                </div>
            </div>
        </div>
    );
}
