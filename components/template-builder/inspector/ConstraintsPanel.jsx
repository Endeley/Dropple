'use client';

import { useNodeTreeStore } from '@/zustand/nodeTreeStore';
import ConstraintsWidget from '@/components/ui/ConstraintsWidget';

export default function ConstraintsPanel({ layer }) {
    const updateNode = useNodeTreeStore((s) => s.updateNode);

    if (!layer?.parent) {
        return <div className='text-sm text-neutral-500'>Constraints apply only to layers inside frames.</div>;
    }

    return (
        <div className='space-y-4 border-b pb-4'>
            <h3 className='font-medium'>Constraints</h3>

            <ConstraintsWidget node={layer} updateNode={updateNode} />
        </div>
    );
}
