'use client';

import clsx from 'clsx';

export default function ConstraintPins({ constraints, onChange }) {
    const h = constraints.horizontal || 'left';
    const v = constraints.vertical || 'top';

    const is = (axis, value) => (axis === 'h' ? h === value : v === value);

    const set = (axis, value) => {
        onChange({
            ...constraints,
            [axis === 'h' ? 'horizontal' : 'vertical']: value,
        });
    };

    return (
        <div className='grid grid-cols-3 grid-rows-3 gap-2 w-28 h-28 mx-auto'>
            {/* Top */}
            <Pin active={is('v', 'top') || is('v', 'top-bottom')} onClick={() => set('v', 'top')} />
            <Pin active={is('v', 'center')} onClick={() => set('v', 'center')} />
            <Pin active={is('v', 'top') || is('v', 'top-bottom')} onClick={() => set('v', 'top')} />

            {/* Middle */}
            <Pin active={is('h', 'left') || is('h', 'left-right')} onClick={() => set('h', 'left')} />
            <Pin active={is('h', 'center')} onClick={() => set('h', 'center')} />
            <Pin active={is('h', 'right') || is('h', 'left-right')} onClick={() => set('h', 'right')} />

            {/* Bottom */}
            <Pin active={is('v', 'bottom') || is('v', 'top-bottom')} onClick={() => set('v', 'bottom')} />
            <Pin active={is('v', 'center')} onClick={() => set('v', 'center')} />
            <Pin active={is('v', 'bottom') || is('v', 'top-bottom')} onClick={() => set('v', 'bottom')} />
        </div>
    );
}

function Pin({ active, onClick }) {
    return <button onClick={onClick} className={clsx('w-4 h-4 rounded-full border transition', active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300 hover:border-indigo-400')} />;
}
