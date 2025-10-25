'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

const PLACEHOLDER_MAP = {
    collage: 'Creative collage in motion',
    canvas: 'Interactive canvas preview',
    prompt: 'Prompt → Output animation',
    dashboard: 'Analytics dashboard',
    code: 'Developer console',
    globe: 'Global reach visualization',
    community: 'Community montage',
};

export default function MediaFrame({ media }) {
    if (!media) return null;

    const label = media.label || PLACEHOLDER_MAP[media.variant] || 'Dropple preview';

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className={clsx(
                'relative overflow-hidden rounded-[2rem] border border-[rgba(17,24,39,0.08)]',
                'bg-[linear-gradient(135deg,_rgba(139,92,246,0.18),_rgba(59,130,246,0.16))]',
                'shadow-[0_30px_70px_rgba(15,23,42,0.15)] backdrop-blur',
                media.className,
            )}
        >
            <span
                aria-hidden
                className='pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.35),_transparent_65%)] blur-3xl animate-pulse-glow'
            />
            <span
                aria-hidden
                className='pointer-events-none absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.28),_transparent_70%)] blur-3xl animate-float-slower'
            />
            {media.src ? (
                media.type === 'video' ? (
                    <video
                        src={media.src}
                        className='h-full w-full object-cover'
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={media.poster}
                    />
                ) : (
                    <img src={media.src} alt={media.alt || label} className='h-full w-full object-cover' />
                )
            ) : (
                <div className='flex h-full min-h-[320px] flex-col items-center justify-center gap-4 p-10 text-center text-[color:var(--color-text-dark)]'>
                    <span className='rounded-full bg-[rgba(255,255,255,0.35)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white'>
                        {media.badge || 'Preview'}
                    </span>
                    <p className='max-w-xs text-lg font-semibold text-white'>{label}</p>
                    <p className='text-sm text-[rgba(255,255,255,0.75)]'>{media.caption || 'Motion and media slot for this section.'}</p>
                </div>
            )}
            {media.overlay && <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgba(15,23,42,0.35)]' />}
        </motion.div>
    );
}
