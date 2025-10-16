import Link from 'next/link';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { redirect, notFound } from 'next/navigation';
import { api } from '../../../convex/_generated/api';
import { requireUser } from '../../../lib/stack-auth';
import { Button } from '../../../components/ui/button';
import TemplateCard from '../../../components/templates/TemplateCard.jsx';
import { TemplatePreview } from '@/components/templates/previews';
import { TEMPLATE_META } from '@/lib/templates/catalogData';
import { getTemplateComponentKey, getTemplateMetaBySlug, getTemplatePreviewInfo } from '@/lib/templates/preview';

function prepareTemplateData(source, { isCatalog = false } = {}) {
    if (!source?.slug) return null;

    const componentKey = source.componentKey ?? getTemplateComponentKey(source.slug);
    const previewInfo = getTemplatePreviewInfo(source.slug);
    const thumbnailCandidate = source.thumbnail ?? source.thumbnailUrl;

    let thumbnail;
    if (thumbnailCandidate && typeof thumbnailCandidate === 'object' && thumbnailCandidate.type) {
        thumbnail = thumbnailCandidate;
    } else if (typeof thumbnailCandidate === 'string') {
        thumbnail = {
            type: 'image',
            src: thumbnailCandidate,
        };
    }
    const thumbnailType = thumbnail && typeof thumbnail === 'object' ? thumbnail.type : undefined;
    const normalizedThumbnailUrl =
        thumbnailType === 'image'
            ? thumbnail.src
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.src
            : typeof thumbnailCandidate === 'string'
            ? thumbnailCandidate
            : undefined;

    return {
        _id: isCatalog ? null : (source._id ?? null),
        slug: source.slug,
        title: source.title ?? source.props?.title ?? source.componentProps?.title ?? 'Untitled template',
        category: source.category ?? source.props?.category ?? null,
        description: source.description ?? source.props?.description ?? source.componentProps?.description ?? '',
        tags: Array.isArray(source.tags) ? source.tags : Array.isArray(source.props?.tags) ? source.props.tags : Array.isArray(source.componentProps?.tags) ? source.componentProps.tags : [],
        isPremium: source.isPremium ?? source.componentProps?.isPremium ?? false,
        usageCount: source.usageCount,
        thumbnail,
        thumbnailUrl: normalizedThumbnailUrl,
        thumbnailLabel: source.thumbnailLabel,
        previewComponentKey: source.previewComponentKey ?? previewInfo?.componentKey ?? componentKey,
        previewVariant: source.previewVariant ?? previewInfo?.variant,
        componentKey,
        isCatalog,
    };
}

export default async function TemplateDetailPage({ params }) {
    const routeParams = await params;
    const slug = routeParams.slug;

    let templateRecord = null;

    try {
        templateRecord = await fetchQuery(api.templates.getBySlug, { slug });
    } catch (error) {
        console.warn('Convex template lookup failed; attempting catalog fallback', error);
    }

    let isCatalogTemplate = false;

    if (!templateRecord) {
        const catalogEntry = getTemplateMetaBySlug(slug);
        if (!catalogEntry) {
            notFound();
        }
        templateRecord = catalogEntry;
        isCatalogTemplate = true;
    }

    const template = prepareTemplateData(templateRecord, { isCatalog: isCatalogTemplate });

    if (!template) {
        notFound();
    }

    let primarySource = [];

    if (!isCatalogTemplate) {
        try {
            primarySource = template.category ? await fetchQuery(api.templateBrowser.listByCategory, { key: template.category, limit: 6 }) : await fetchQuery(api.templateBrowser.listRecent, { limit: 6 });
        } catch (error) {
            console.warn('Convex related template query failed; falling back to catalog', error);
        }
    }

    const relatedAccumulator = [];
    const seenIds = new Set([template.slug]);

    const collectRelated = (collection, { catalog = false } = {}) => {
        for (const item of collection ?? []) {
            const prepared = prepareTemplateData(item, { isCatalog: catalog });
            if (!prepared || !prepared.slug || prepared.slug === template.slug) continue;
            if (!seenIds.has(prepared.slug)) {
                seenIds.add(prepared.slug);
                relatedAccumulator.push(prepared);
                if (relatedAccumulator.length === 4) break;
            }
        }
    };

    collectRelated(primarySource);

    if (relatedAccumulator.length < 4) {
        if (!isCatalogTemplate) {
            try {
                const fallback = await fetchQuery(api.templateBrowser.listRecent, { limit: 12 });
                collectRelated(fallback);
            } catch (error) {
                console.warn('Convex recent templates unavailable; extending catalog fallback', error);
            }
        }
    }

    if (relatedAccumulator.length < 4) {
        collectRelated(
            TEMPLATE_META.filter((entry) => entry.slug !== template.slug && (!template.category || entry.category === template.category)),
            { catalog: true }
        );
    }

    if (relatedAccumulator.length < 4) {
        collectRelated(
            TEMPLATE_META.filter((entry) => entry.slug !== template.slug),
            { catalog: true }
        );
    }

    const related = relatedAccumulator.slice(0, 4);
    const canStartDesign = Boolean(template._id && !template.isCatalog);
    const thumbnail = template.thumbnail && typeof template.thumbnail === 'object' ? template.thumbnail : null;
    const thumbnailType = thumbnail?.type;
    const gradientStyle =
        thumbnailType === 'css'
            ? thumbnail.style
            : thumbnailType === 'hybrid'
            ? thumbnail.cssStyle
            : undefined;
    const overlayStyle =
        thumbnailType === 'image'
            ? thumbnail.overlayCss
            : thumbnailType === 'hybrid'
            ? thumbnail.overlayCss
            : undefined;
    const imageSource =
        thumbnailType === 'image'
            ? thumbnail.src
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.src
            : undefined;
    const imageAlt =
        thumbnailType === 'image'
            ? thumbnail.alt ?? template.title
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.alt ?? template.title
            : template.title;
    const focalPoint =
        thumbnailType === 'image'
            ? thumbnail.focalPoint
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.focalPoint
            : undefined;
    const previewComponentKey = template.previewComponentKey ?? template.componentKey;

    async function startDesignAction() {
        'use server';

        if (!canStartDesign) {
            throw new Error('This template is not yet available to start from.');
        }

        const user = await requireUser(`/templates/${routeParams.slug}`);
        const convexUser = await fetchQuery(api.users.getByStackUserId, { stackUserId: user.id });
        if (!convexUser) {
            throw new Error('Convex user record not found for current session');
        }

        const designId = await fetchMutation(api.templates.startFromTemplate, {
            templateId: template._id,
            userId: convexUser._id,
        });

        const designRouteId = typeof designId === 'string' ? designId : designId?.id ?? '';
        if (!designRouteId) {
            throw new Error('Failed to create design from template');
        }

        redirect(`/editor/${encodeURIComponent(designRouteId)}`);
    }

    return (
        <div className='mx-auto max-w-6xl space-y-10 px-6 py-10'>
            <nav className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                <Link href='/templates' className='transition hover:text-indigo-500'>
                    All Templates
                </Link>
                <span>/</span>
                <span>{template.category ?? 'General'}</span>
                <span>/</span>
                <span className='text-slate-700 font-medium dark:text-slate-200'>{template.title}</span>
            </nav>

            <div className='grid gap-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 lg:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.9fr)]'>
                {/* LEFT: Preview */}
                <div className='space-y-6 lg:px-3'>
                    {/* Frame with thin border; inner content fills 100% */}
                    <div
                        className='relative h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden rounded-3xl border border-white/60 bg-transparent shadow-lg shadow-slate-900/15 dark:border-slate-800'
                        style={gradientStyle}
                    >
                        {imageSource ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageSource}
                                    alt={imageAlt}
                                    className='h-full w-full object-cover'
                                    style={
                                        focalPoint
                                            ? {
                                                  objectPosition: `${(focalPoint.x ?? 0.5) * 100}% ${(focalPoint.y ?? 0.5) * 100}%`,
                                              }
                                            : undefined
                                    }
                                />
                                <div className='absolute inset-0 bg-black/20' aria-hidden='true' />
                                {overlayStyle ? <div className='absolute inset-0' style={overlayStyle} /> : null}
                            </>
                        ) : null}

                        {!imageSource && thumbnailType === 'css' ? <div className='absolute inset-0 bg-black/20' aria-hidden='true' /> : null}

                        {!imageSource && thumbnailType !== 'css' ? (
                            <div className='absolute inset-0 bg-white'>
                                <TemplatePreview componentKey={previewComponentKey} variant={template.previewVariant} className='h-full w-full' />
                            </div>
                        ) : null}

                        {template.thumbnailLabel ? (
                            <div className='absolute inset-0 flex items-center justify-center p-3'>
                                <span className='text-white text-center text-sm font-extrabold leading-tight drop-shadow md:text-base'>
                                    {template.thumbnailLabel}
                                </span>
                            </div>
                        ) : null}
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

                {/* RIGHT: Details */}
                <form action={startDesignAction} className='flex flex-col gap-6 rounded-2xl border border-white/70 bg-white/90 p-6 text-sm dark:border-slate-800 dark:bg-slate-900/80'>
                    <div className='space-y-2'>
                        <div className='inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'>{template.isPremium ? 'Premium' : 'Free'}</div>
                        <h1 className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>{template.title}</h1>
                        {template.description ? <p className='text-slate-600 dark:text-slate-300'>{template.description}</p> : <p className='text-slate-600 dark:text-slate-300'>Customize this template to fit your brand and publish in minutes.</p>}
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
                        <Button type='submit' className='w-full rounded-full text-sm' disabled={!canStartDesign}>
                            {canStartDesign ? 'Use this template' : 'Coming soon'}
                        </Button>
                        <Button type='button' variant='outline' className='w-full rounded-full text-sm' disabled={!canStartDesign}>
                            Add to favorites
                        </Button>
                        {!canStartDesign ? <p className='text-xs text-slate-500 dark:text-slate-400'>This catalog preview template will be available to start once it&apos;s published to Dropple.</p> : null}
                    </div>
                </form>
            </div>

            {related.length ? (
                <section className='space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm'>
                    <h2 className='text-base font-semibold text-slate-900 dark:text-slate-100'>You may also like</h2>
                    <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4'>
                        {related.map((tpl) => (
                            <TemplateCard key={tpl.slug ?? tpl._id} tpl={tpl} compact />
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
