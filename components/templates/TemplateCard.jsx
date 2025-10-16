"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TemplatePreview } from '@/components/templates/previews';

export default function TemplateCard({ tpl, compact = false, onEdit }) {
    const [hovered, setHovered] = useState(false);
    const Wrapper = onEdit ? 'div' : Link;
    const wrapperProps = onEdit ? {} : { href: `/templates/${tpl.slug}` };
    const thumbnail = tpl?.thumbnail && typeof tpl.thumbnail === 'object' ? tpl.thumbnail : null;
    const thumbnailType = thumbnail?.type;
    const gradientStyle =
        thumbnailType === 'css'
            ? thumbnail.style
            : thumbnailType === 'hybrid'
            ? thumbnail.cssStyle
            : undefined;
    const fallbackPreview = !thumbnail && !tpl.thumbnailUrl;
    const shouldRenderPreview = fallbackPreview || thumbnailType === 'css';
    const label = tpl?.thumbnailLabel;

    const imageSource =
        thumbnailType === 'image'
            ? thumbnail.src
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.src
            : tpl.thumbnailUrl ?? null;

    const imageAlt =
        thumbnailType === 'image'
            ? thumbnail.alt ?? tpl.title
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.alt ?? tpl.title
            : tpl.title;

    const focalPoint =
        thumbnailType === 'image'
            ? thumbnail.focalPoint
            : thumbnailType === 'hybrid'
            ? thumbnail.image?.focalPoint
            : null;

    return (
        <Wrapper
            className='group block'
            {...wrapperProps}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <article
                className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg ${
                    compact ? 'p-3 sm:p-4' : ''
                }`}
                onClick={onEdit}
            >
                <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${compact ? 'h-32' : 'h-44'}`} style={gradientStyle}>
                    {imageSource ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageSource}
                                alt={imageAlt}
                                className='h-full w-full object-cover transition group-hover:scale-[1.02]'
                                style={
                                    focalPoint
                                        ? {
                                              objectPosition: `${(focalPoint.x ?? 0.5) * 100}% ${(focalPoint.y ?? 0.5) * 100}%`,
                                          }
                                        : undefined
                                }
                            />
                            {(thumbnailType === 'image' && thumbnail?.overlayCss) || (thumbnailType === 'hybrid' && thumbnail?.overlayCss) ? (
                                <div
                                    className='absolute inset-0 transition group-hover:bg-black/25'
                                    style={thumbnail?.overlayCss}
                                />
                            ) : (
                                <div className='absolute inset-0 bg-black/20 transition group-hover:bg-black/25' aria-hidden='true' />
                            )}
                        </>
                    ) : null}
                    {shouldRenderPreview ? (
                        <div className='absolute inset-0 pointer-events-none'>
                            <TemplatePreview componentKey={tpl.previewComponentKey ?? tpl.componentKey} variant={tpl.previewVariant} className='h-full w-full' />
                        </div>
                    ) : null}
                    {thumbnailType === 'css' && !imageSource ? <div className='absolute inset-0 bg-black/10' aria-hidden='true' /> : null}
                    {label ? (
                        <div className='absolute inset-0 flex items-center justify-center p-3'>
                            <span className='text-white text-center text-sm font-extrabold leading-tight drop-shadow md:text-base'>{label}</span>
                        </div>
                    ) : null}
                    {onEdit && hovered && (
                        <div className='absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-slate-900/60 backdrop-blur-sm'>
                            <Button size='sm' className='gap-2' onClick={onEdit}>
                                <Edit className='h-4 w-4' />
                                Edit Template
                            </Button>
                        </div>
                    )}
                </div>
                <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{tpl.title}</h3>
                    {tpl.category && !compact ? <span className='text-xs text-slate-500'>{tpl.category}</span> : null}
                </div>
            </article>
        </Wrapper>
    );
}
