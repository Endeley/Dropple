'use client';

import { useWorkspaceStore } from '@/runtime/stores/useWorkspaceStore';

export default function RenderLayer({ layer }) {
    const setSelected = useWorkspaceStore((s) => s.setSelectedLayer);
    const updateLayer = useWorkspaceStore((s) => s.updateLayer);
    const syncToBackend = useWorkspaceStore((s) => s.syncToBackend);

    const style = {
        position: 'absolute',
        top: layer.y,
        left: layer.x,
        width: layer.width,
        height: layer.height,
        background: layer.fill ?? 'transparent',
        ...layer.customCSS,
    };

    const dragProps = {
        draggable: true,
        onDragStart: (e) => {
            e.stopPropagation();
            e.dataTransfer.setData('layer-drag-id', layer.id);
            e.dataTransfer.effectAllowed = 'move';
        },
    };

    return (
        <div
            className='layer-node border cursor-pointer'
            style={style}
            {...dragProps}
            onClick={() => setSelected(layer.id)}
            onMouseDown={(e) => {
                updateLayer(
                    layer.id,
                    {
                        x: e.clientX,
                        y: e.clientY,
                    },
                    'human'
                );
                syncToBackend();
            }}>
            {layer.text}
            {layer.children?.map((child) => (
                <RenderLayer key={child.id} layer={child} />
            ))}
        </div>
    );
}
