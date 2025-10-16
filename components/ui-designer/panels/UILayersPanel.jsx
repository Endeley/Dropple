'use client';

import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import LayerItem from './parts/LayerItem';

function flattenLayers(node, depth = 0, list = []) {
    if (!node) return list;
    if (node.type !== 'root') {
        list.push({ depth, node });
    }
    if (Array.isArray(node.children)) {
        node.children.forEach((child) => flattenLayers(child, depth + (node.type === 'root' ? 0 : 1), list));
    }
    return list;
}

export default function UILayersPanel({
    root,
    selectedIds = [],
    onSelectLayer,
    onToggleVisibility,
    onToggleLock,
}) {
    const layers = useMemo(() => flattenLayers(root ?? null, 0, []), [root]);

    return (
        <section className="mb-4 rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Layers className="h-4 w-4" /> Layers
            </div>
            {layers.length ? (
                <div className="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
                    {layers.map(({ node, depth }) => (
                        <LayerItem
                            key={node.id}
                            node={node}
                            depth={depth}
                            isSelected={Array.isArray(selectedIds) ? selectedIds.includes(node.id) : false}
                            onSelectLayer={onSelectLayer}
                            onToggleVisibility={onToggleVisibility}
                            onToggleLock={onToggleLock}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    No layers yet. Add primitives to populate this artboard.
                </div>
            )}
        </section>
    );
}
