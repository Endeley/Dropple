'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import SectionShell from './SectionShell';
import SectionHeading from './SectionHeading';
import FeatureList from './FeatureList';
import ActionButtons from './ActionButtons';
import MediaFrame from './MediaFrame';

const columnVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

export default function SplitSection({ section }) {
    const reverse = section.mediaPosition === 'left';

    return (
        <SectionShell section={section}>
            <div className={clsx('grid gap-12 lg:grid-cols-2 lg:items-center', reverse && 'lg:[&>*:first-child]:order-last')}>
                <motion.div
                    variants={columnVariants}
                    initial='hidden'
                    whileInView='show'
                    viewport={{ once: true, amount: 0.5 }}
                    className='flex flex-col gap-6'
                >
                    <SectionHeading
                        badge={section.badge}
                        title={section.title}
                        description={section.description}
                        eyebrow={section.eyebrow}
                        kicker={section.kicker}
                        accent={section.accent}
                        align='left'
                    />
                    {section.points && <FeatureList items={section.points} columns={section.featureColumns || 1} />}
                    {section.details && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.7 }}
                            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
                            className='rounded-2xl border border-[rgba(17,24,39,0.08)] bg-[rgba(139,92,246,0.08)] p-4 text-sm text-[color:var(--color-text-secondary)] shadow-[0_16px_40px_rgba(15,23,42,0.08)]'
                        >
                            {section.details}
                        </motion.div>
                    )}
                    <ActionButtons actions={section.actions} />
                </motion.div>
                <motion.div
                    variants={columnVariants}
                    initial='hidden'
                    whileInView='show'
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: 0.1 }}
                >
                    <MediaFrame media={section.media} />
                </motion.div>
            </div>
        </SectionShell>
    );
}
