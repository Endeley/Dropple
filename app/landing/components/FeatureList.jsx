'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

const COLUMN_CLASS = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
};

const listVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

export default function FeatureList({ items = [], columns = 1, dense = false }) {
    if (!items.length) return null;

    return (
        <motion.ul
            variants={listVariants}
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.4 }}
            className={clsx(
                'grid gap-4 sm:gap-5',
                COLUMN_CLASS[columns] || COLUMN_CLASS[1],
                dense && 'gap-3 sm:gap-4',
            )}
        >
            {items.map((item) => (
                <motion.li
                    key={item.title || item}
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className='group relative flex items-start gap-3 rounded-2xl border border-[rgba(17,24,39,0.08)] bg-[var(--color-surface)] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm'
                >
                    <span className='mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[rgba(139,92,246,0.12)] text-base'>
                        {item.icon || '✦'}
                    </span>
                    <div className='space-y-1.5'>
                        <p className='text-sm font-semibold text-[color:var(--color-text-primary)]'>
                            {item.title || (typeof item === 'string' ? item : '')}
                        </p>
                        {item.description && (
                            <p className='text-sm text-[color:var(--color-text-secondary)]'>{item.description}</p>
                        )}
                    </div>
                    <span className='pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-colors duration-300 group-hover:border-[rgba(139,92,246,0.35)]' />
                </motion.li>
            ))}
        </motion.ul>
    );
}
