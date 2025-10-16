'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function BrandMark({
    href = '/',
    showLabel = true,
    size = 36,
    className = '',
    labelClassName = '',
    priority = false,
    label = 'Dropple',
}) {
    const baseClass = `inline-flex items-center gap-2 ${className}`.trim();
    const content = (
        <>
            <Image src='/logo.svg' alt={`${label} logo`} width={size} height={size} priority={priority} />
            {showLabel ? <span className={`font-semibold tracking-tight ${labelClassName}`.trim()}>{label}</span> : null}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={baseClass}>
                {content}
            </Link>
        );
    }

    return <span className={baseClass}>{content}</span>;
}
