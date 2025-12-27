'use client';

import { useTemplateBuilderStore } from '@/runtime/stores/useTemplateBuilderStore';
import LayerTreeItem from './LayerTreeItem';

export default function LayerTree() {
    const layers = useTemplateBuilderStore((s) => s.currentTemplate.layers || []);

    const moveNode = useTemplateBuilderStore((s) => s.moveNode);

    const rootLayers = layers.filter((l) => !l.parentId);

    return (
        <div
            className='p-3 space-y-1 overflow-y-auto h-full'
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                const sourceId = e.dataTransfer.getData('layer-drag-id');
                if (!sourceId) return;

                moveNode(sourceId, null, rootLayers.length, {
                    undoable: true,
                });
            }}>
            {rootLayers.length === 0 && <div className='text-sm text-slate-500 italic'>Drop layers here</div>}

            {rootLayers.map((layer) => (
                <LayerTreeItem key={layer.id} layer={layer} depth={0} />
            ))}
        </div>
    );
}
