'use client';

import { useState } from 'react';

/* eslint-disable @next/next/no-img-element */

type ImageWithFallbackProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt'> & {
    alt: string;
    fallbackSrc?: string;
};

export function ImageWithFallback({
    src,
    alt,
    fallbackSrc = '/placeholder.png',
    onError,
    ...imgProps
}: ImageWithFallbackProps) {
    const [hasError, setHasError] = useState(false);

    const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
        if (!hasError) {
            setHasError(true);
        }
        onError?.(event);
    };

    const displaySrc = !hasError && src ? src : fallbackSrc;

    return <img {...imgProps} src={displaySrc} alt={alt} onError={handleError} />;
}
