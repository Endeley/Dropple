'use client';

export default function AutoLayoutHandles({ bounds, direction, padding, gap, onPaddingChange, onGapChange }) {
    if (!bounds) return null;

    const isRow = direction === 'row';

    return (
        <>
            {/* Padding handle */}
            <div
                className='absolute w-3 h-3 bg-blue-500 rounded-full cursor-ew-resize pointer-events-auto'
                style={{
                    left: bounds.x + padding,
                    top: bounds.y + padding,
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    const start = e.clientX;

                    const move = (ev) => {
                        onPaddingChange(padding + (ev.clientX - start));
                    };

                    const up = () => {
                        window.removeEventListener('mousemove', move);
                        window.removeEventListener('mouseup', up);
                    };

                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                }}
            />

            {/* Gap handle */}
            <div
                className='absolute w-3 h-3 bg-green-500 rounded-full cursor-ew-resize pointer-events-auto'
                style={{
                    left: bounds.x + bounds.width / 2,
                    top: bounds.y - 10,
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    const start = e.clientX;

                    const move = (ev) => {
                        onGapChange(gap + (ev.clientX - start));
                    };

                    const up = () => {
                        window.removeEventListener('mousemove', move);
                        window.removeEventListener('mouseup', up);
                    };

                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                }}
            />
        </>
    );
}
