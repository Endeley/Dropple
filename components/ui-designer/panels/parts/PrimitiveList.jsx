'use client';

import { Rows3, Dock, RectangleHorizontal, Type, Image as ImageIcon, Square, Component as ComponentIcon } from 'lucide-react';

const defaultPrimitives = [
    { id: 'navbar', icon: Dock, label: 'Navbar' },
    { id: 'hero', icon: RectangleHorizontal, label: 'Hero' },
    { id: 'cards3', icon: Rows3, label: 'Cards x3' },
    { id: 'section', icon: Square, label: 'Section' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
];

export default function PrimitiveList({ primitives, onAddPrimitive, onPrimitiveDragStart, onPrimitiveDragEnd }) {
    const list = primitives?.length ? primitives : defaultPrimitives;
    return (
        <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <ComponentIcon className="h-4 w-4" /> UI Primitives
            </div>
            <div className="grid grid-cols-2 gap-2">
                {list.map((primitive) => (
                    <button
                        key={primitive.id}
                        onClick={() => onAddPrimitive?.(primitive.id)}
                        draggable
                        onDragStart={(event) => onPrimitiveDragStart?.(event, primitive.id)}
                        onDragEnd={onPrimitiveDragEnd}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50/60"
                    >
                        <primitive.icon className="h-4 w-4 text-slate-500" />
                        <span>{primitive.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
