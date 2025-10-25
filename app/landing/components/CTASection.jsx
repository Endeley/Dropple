'use client';

import { motion } from 'framer-motion';
import SectionShell from './SectionShell';
import SectionHeading from './SectionHeading';
import ActionButtons from './ActionButtons';
import MediaFrame from './MediaFrame';

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function CTASection({ section }) {
    return (
        <SectionShell section={{ ...section, background: section.background || 'surface', overlay: section.overlay }}>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                whileInView='show'
                viewport={{ once: true, amount: 0.5 }}
                className='relative grid gap-10 rounded-[3rem] border border-[rgba(139,92,246,0.22)] bg-[var(--color-surface)] px-10 py-14 text-center shadow-[0_30px_80px_rgba(139,92,246,0.18)] lg:grid-cols-[1.2fr_1fr] lg:text-left'
            >
                <span
                    aria-hidden
                    className='pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.28),_transparent_65%)] blur-3xl animate-float-slow'
                />
                <span
                    aria-hidden
                    className='pointer-events-none absolute -right-12 bottom-4 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.22),_transparent_70%)] blur-3xl animate-pulse-glow'
                />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className='flex flex-col items-center gap-8 lg:items-start'
                >
                    <SectionHeading
                        badge={section.badge}
                        title={section.title}
                        description={section.description}
                        align='left'
                        accent='var(--color-primary)'
                    />
                    <ActionButtons actions={section.actions} />
                    {section.supporting && (
                        <p className='max-w-xl text-sm text-[color:var(--color-text-secondary)]'>{section.supporting}</p>
                    )}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.18 }}
                    className='flex items-center justify-center'
                >
                    <MediaFrame media={section.media} />
                </motion.div>
            </motion.div>
        </SectionShell>
    );
}
