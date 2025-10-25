'use client';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const BACKGROUNDS = {
    default: 'bg-[var(--color-canvas)]',
    surface: 'bg-[var(--color-surface)]',
    gradient: 'bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_60%)]',
    night: 'bg-[linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(59,130,246,0.25))]',
};

export default function SectionShell({ section, className, children }) {
    const backgroundClass = BACKGROUNDS[section.background || 'default'] || BACKGROUNDS.default;
    const contentLayout = clsx(
        'relative overflow-hidden',
        'py-24 sm:py-28',
        backgroundClass,
        section.overlay === 'glow' && 'before:absolute before:inset-x-10 before:-top-16 before:h-48 before:rounded-full before:bg-[var(--color-accent-gradient)] before:opacity-25 before:blur-3xl before:content-[""]',
    );

    return (
        <motion.section
            id={section.id}
            className={clsx(contentLayout, className)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
        >
            <span
                aria-hidden
                className='pointer-events-none absolute -left-24 top-10 hidden h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.35),_transparent_65%)] blur-3xl sm:block animate-float-slow'
            />
            <span
                aria-hidden
                className='pointer-events-none absolute -right-24 bottom-8 hidden h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.28),_transparent_60%)] blur-3xl sm:block animate-float-slower'
            />
            <span
                aria-hidden
                className='pointer-events-none absolute inset-x-1/4 top-1/3 hidden h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.22),_transparent_70%)] blur-2xl sm:block animate-pulse-glow'
            />
            <div className='relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6'>{children}</div>
        </motion.section>
    );
}
