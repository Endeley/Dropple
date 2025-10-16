import Link from 'next/link';

import { TemplatePreview } from '@/components/templates/previews';
import { TEMPLATE_META } from '@/lib/templates/catalogData';
import { getTemplatePreviewInfo } from '@/lib/templates/preview';

const CATEGORY_LABELS = {
    popular: 'Popular',
    business: 'Business',
    enterprise: 'Enterprise',
    ecommerce: 'E-commerce',
    education: 'Education',
    marketing: 'Marketing',
    realestate: 'Real Estate',
    food: 'Food & Dining',
    medical: 'Medical',
    travel: 'Travel',
    tech: 'Tech',
    logistics: 'Logistics',
    campaigns: 'Campaigns',
};

function sampleTemplatesFromCatalog(count) {
    const pool = TEMPLATE_META;
    const limit = Math.min(count, pool.length);
    const selections = [];
    const usedIndices = new Set();

    while (selections.length < limit) {
        const index = Math.floor(Math.random() * pool.length);
        if (usedIndices.has(index)) continue;
        usedIndices.add(index);
        selections.push(pool[index]);
    }

    return selections;
}

export default function TemplateScroller() {
    const templates = sampleTemplatesFromCatalog(6).map((meta) => {
        const previewInfo = getTemplatePreviewInfo(meta.slug);
        return {
            slug: meta.slug,
            title: meta.title,
            category: meta.category,
            thumbnail: meta.thumbnail,
            thumbnailLabel: meta.thumbnailLabel,
            previewComponentKey: previewInfo?.componentKey ?? meta.componentKey,
            previewVariant: previewInfo?.variant,
        };
    });

    return (
        <section className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <h2 className='text-base font-semibold text-slate-900 dark:text-white'>Templates</h2>
                <Link href='/templates' className='text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200'>
                    View all
                </Link>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6'>
                {templates.map((template) => {
                    const thumbnail =
                        template.thumbnail && typeof template.thumbnail === 'object' ? template.thumbnail : null;
                    const thumbnailType = thumbnail?.type;
                    const gradientStyle =
                        thumbnailType === 'css'
                            ? thumbnail.style
                            : thumbnailType === 'hybrid'
                            ? thumbnail.cssStyle
                            : undefined;
                    const imageSource =
                        thumbnailType === 'image'
                            ? thumbnail.src
                            : thumbnailType === 'hybrid'
                            ? thumbnail.image?.src
                            : undefined;
                    const focalPoint =
                        thumbnailType === 'image'
                            ? thumbnail.focalPoint
                            : thumbnailType === 'hybrid'
                            ? thumbnail.image?.focalPoint
                            : undefined;
                    const overlayStyle =
                        thumbnailType === 'image'
                            ? thumbnail.overlayCss
                            : thumbnailType === 'hybrid'
                            ? thumbnail.overlayCss
                            : undefined;
                    const shouldRenderPreview = !imageSource;

                    return (
                        <Link
                            key={template.slug}
                            href={`/templates/${template.slug}`}
                            className='group flex h-32 flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs shadow-sm shadow-slate-200/40 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:shadow-slate-950/40'
                        >
                            <div className='relative h-16 overflow-hidden rounded-xl bg-white/60 dark:bg-slate-800/60' style={gradientStyle}>
                                {imageSource ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageSource}
                                            alt={template.title}
                                            className='h-full w-full object-cover'
                                            style={
                                                focalPoint
                                                    ? {
                                                          objectPosition: `${(focalPoint.x ?? 0.5) * 100}% ${(focalPoint.y ?? 0.5) * 100}%`,
                                                      }
                                                    : undefined
                                            }
                                        />
                                        <div className='absolute inset-0 bg-black/15' aria-hidden='true' />
                                        {overlayStyle ? <div className='absolute inset-0' style={overlayStyle} /> : null}
                                    </>
                                ) : null}
                                {!imageSource && thumbnailType === 'css' ? <div className='absolute inset-0 bg-black/15' aria-hidden='true' /> : null}
                                {shouldRenderPreview ? (
                                    <div className='absolute inset-0 pointer-events-none'>
                                        <TemplatePreview
                                            componentKey={template.previewComponentKey}
                                            variant={template.previewVariant}
                                            className='h-full w-full'
                                        />
                                    </div>
                                ) : null}
                                {template.thumbnailLabel ? (
                                    <div className='absolute inset-0 flex items-center justify-center p-2'>
                                        <span className='text-white text-center text-[10px] font-extrabold leading-tight drop-shadow'>
                                            {template.thumbnailLabel}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                            <div className='space-y-1 text-slate-600 dark:text-slate-300'>
                                <p className='truncate text-xs font-semibold text-slate-900 dark:text-white'>{template.title}</p>
                                <span className='text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500'>
                                    {CATEGORY_LABELS[template.category] ?? template.category}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
