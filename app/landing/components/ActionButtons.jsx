import Link from 'next/link';
import clsx from 'clsx';

export default function ActionButtons({ actions = [], align = 'left' }) {
    if (!actions.length) return null;
    return (
        <div className={clsx('flex flex-col gap-3 sm:flex-row sm:items-center', align === 'center' ? 'justify-center' : 'justify-start')}>
            {actions.map((action) => {
                const Component = action.href ? Link : 'button';
                const props = action.href ? { href: action.href } : { type: 'button', onClick: action.onClick };
                return (
                    <Component
                        key={action.label}
                        {...props}
                        className={clsx(
                            'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                            action.variant === 'secondary'
                                ? 'border border-[rgba(17,24,39,0.12)] bg-[var(--color-surface)] text-[color:var(--color-text-primary)] hover:border-[rgba(59,130,246,0.35)]'
                                : 'text-white shadow-lg shadow-[rgba(139,92,246,0.35)]',
                        )}
                        style={action.variant === 'secondary' ? undefined : { backgroundImage: 'var(--color-accent-gradient)' }}
                    >
                        {action.icon && <span>{action.icon}</span>}
                        {action.label}
                        {action.trailing && <span>{action.trailing}</span>}
                    </Component>
                );
            })}
        </div>
    );
}
