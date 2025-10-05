"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Image as ImageIcon, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function TemplateCard({ tpl, compact = false, onEdit }) {
    const [hovered, setHovered] = useState(false);
    const Wrapper = onEdit ? 'div' : Link;
    const wrapperProps = onEdit ? {} : { href: `/templates/${tpl.slug}` };

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
                <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${compact ? 'h-32' : 'h-44'}`}>
                    {tpl.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tpl.thumbnailUrl} alt={tpl.title} className='h-full w-full object-cover transition group-hover:scale-[1.02]' />
                    ) : (
                        <div className='flex h-full items-center justify-center text-slate-400'>
                            <ImageIcon className='h-10 w-10' />
                        </div>
                    )}
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
