import clsx from 'clsx';

export default function SectionHeading({ badge, title, description, align = 'left', kicker, eyebrow, accent }) {
    const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
    return (
        <div className={clsx('flex flex-col gap-4', alignment)}>
            {(badge || eyebrow) && (
                <span
                    className={clsx(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                        align === 'center' ? 'mx-auto' : '',
                    )}
                    style={{
                        borderColor: accent || 'rgba(139,92,246,0.25)',
                        color: accent || 'var(--color-accent-blue)',
                        backgroundColor: 'rgba(139,92,246,0.08)',
                    }}
                >
                    {badge || eyebrow}
                </span>
            )}
            <div className='flex flex-col gap-3'>
                <h2 className={clsx('text-3xl font-semibold leading-tight text-[color:var(--color-text-primary)] sm:text-4xl')}>
                    {title}
                </h2>
                {kicker && <p className='text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-secondary)]'>{kicker}</p>}
                {description && <p className='text-lg text-[color:var(--color-text-secondary)] sm:text-xl'>{description}</p>}
            </div>
        </div>
    );
}
