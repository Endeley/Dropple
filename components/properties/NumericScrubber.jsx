'use client';

import { useRef } from 'react';

export default function NumericScrubber({ value, onChange, step = 1, min = -Infinity, max = Infinity, label }) {
    const startX = useRef(0);
    const startValue = useRef(0);

    const onMouseDown = (e) => {
        e.preventDefault();
        startX.current = e.clientX;
        startValue.current = value;

        const onMove = (ev) => {
            const dx = ev.clientX - startX.current;

            let multiplier = step;
            if (ev.shiftKey) multiplier *= 0.1;
            if (ev.altKey) multiplier *= 10;

            const next = Math.min(max, Math.max(min, startValue.current + dx * multiplier));

            onChange(Math.round(next));
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    return (
        <div className='flex items-center gap-2 select-none'>
            {label && <span className='text-xs opacity-70'>{label}</span>}

            <div className='px-2 py-1 text-sm rounded bg-neutral-800 cursor-ew-resize' onMouseDown={onMouseDown}>
                {value}
            </div>
        </div>
    );
}
