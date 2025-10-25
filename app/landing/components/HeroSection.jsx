'use client';

import { motion } from 'framer-motion';
import SectionShell from './SectionShell';
import SectionHeading from './SectionHeading';
import ActionButtons from './ActionButtons';
import MediaFrame from './MediaFrame';

export default function HeroSection({ section }) {
    return (
        <SectionShell section={{ ...section, overlay: 'glow', background: section.background || 'gradient' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className='relative flex flex-col items-center gap-12 text-center'
            >
                <SectionHeading
                    badge={section.badge}
                    title={section.title}
                    description={section.description}
                    align='center'
                    accent='var(--color-primary)'
                />
                <ActionButtons actions={section.actions} align='center' />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
            >
                <MediaFrame media={section.media} />
            </motion.div>
        </SectionShell>
    );
}
