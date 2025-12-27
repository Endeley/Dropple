'use client';

import { useMemo, useCallback, useState, useRef } from 'react';
import { useTemplateBuilderStore } from '@/runtime/stores/useTemplateBuilderStore';

export default function LayerTreeItem({ layer, depth = 0 }) {
    /* ================================
     NORMALIZE INPUT
  ================================= */

    const safeLayer = layer ?? null;
    const layerId = safeLayer?.id ?? null;
    const layerType = safeLayer?.type ?? null;
    const isExpanded = safeLayer?.expanded !== false;

    /* ================================
     STORE (ALWAYS CALLED)
  ================================= */

    const layers = useTemplateBuilderStore((s) => s.currentTemplate.layers || []);
    const selectedLayers = useTemplateBuilderStore((s) => s.selectedLayers || []);
    const setSelectedLayers = useTemplateBuilderStore((s) => s.setSelectedLayers);

    const toggleLayerExpand = useTemplateBuilderStore((s) => s.toggleLayerExpand);
    const toggleLayerLock = useTemplateBuilderStore((s) => s.toggleLayerLock);
    const toggleLayerVisibility = useTemplateBuilderStore((s) => s.toggleLayerVisibility);
    const renameLayer = useTemplateBuilderStore((s) => s.renameLayer);
    const moveNode = useTemplateBuilderStore((s) => s.moveNode);

    /* ================================
     LOCAL STATE
  ================================= */

    const [isOver, setIsOver] = useState(false);
    const expandTimer = useRef(null);

    /* ================================
     DERIVED
  ================================= */

    const children = useMemo(() => {
        const layerChildren = safeLayer?.children ?? [];
        if (!layerId || !Array.isArray(layerChildren)) return [];
        return layerChildren.map((id) => layers.find((l) => l.id === id)).filter(Boolean);
    }, [layerId, safeLayer, layers]);

    const isSelected = layerId ? selectedLayers.includes(layerId) : false;

    const canAcceptChildren = layerType === 'frame' || layerType === 'group' || layerType === 'component-instance';

    /* ================================
     DRAG & DROP
  ================================= */

    const handleDragStart = useCallback(
        (e) => {
            if (!layerId) return;
            e.stopPropagation();
            e.dataTransfer.setData('layer-drag-id', layerId);
            e.dataTransfer.effectAllowed = 'move';
        },
        [layerId]
    );

    const handleDragOver = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!canAcceptChildren) return;

            setIsOver(true);

            // ⏱ auto-expand after delay
            if (!isExpanded && !expandTimer.current) {
                expandTimer.current = setTimeout(() => {
                    toggleLayerExpand(layerId);
                    expandTimer.current = null;
                }, 400);
            }
        },
        [canAcceptChildren, isExpanded, layerId, toggleLayerExpand]
    );

    const clearExpandTimer = () => {
        if (expandTimer.current) {
            clearTimeout(expandTimer.current);
            expandTimer.current = null;
        }
    };

    const handleDragLeave = useCallback(() => {
        setIsOver(false);
        clearExpandTimer();
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOver(false);
            clearExpandTimer();

            if (!layerId || !canAcceptChildren) return;

            const sourceId = e.dataTransfer.getData('layer-drag-id');
            if (!sourceId || sourceId === layerId) return;

            moveNode(sourceId, layerId, children.length, { undoable: true });
        },
        [layerId, canAcceptChildren, children.length, moveNode]
    );

    /* ================================
     RENDER GUARD
  ================================= */

    if (!safeLayer) return null;

    /* ================================
     RENDER
  ================================= */

    return (
        <div className='flex flex-col'>
            <div
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => setSelectedLayers([layerId])}
                className={`flex items-center px-2 py-1 rounded cursor-pointer select-none transition
          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
          ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        `}
                style={{ paddingLeft: depth * 16 }}>
                {children.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerExpand(layerId);
                        }}
                        className='mr-2 text-xs opacity-70'>
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}

                <span className='text-xs opacity-70 mr-2'>{iconFor(layerType)}</span>

                <input value={safeLayer.name || layerType} onClick={(e) => e.stopPropagation()} onChange={(e) => renameLayer(layerId, e.target.value)} className={`bg-transparent outline-none text-sm flex-1 ${isSelected ? 'text-white' : 'text-gray-800'}`} />

                <button
                    className='ml-2 text-xs'
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layerId);
                    }}>
                    {safeLayer.locked ? '🔒' : '🔓'}
                </button>

                <button
                    className='ml-2 text-xs'
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layerId);
                    }}>
                    {safeLayer.hidden ? '🙈' : '👁'}
                </button>
            </div>

            {isExpanded && children.map((child) => <LayerTreeItem key={child.id} layer={child} depth={depth + 1} />)}
        </div>
    );
}

/* ================================
   ICONS
================================= */

function iconFor(type) {
    switch (type) {
        case 'text':
            return 'T';
        case 'image':
            return '🖼';
        case 'frame':
            return '▭';
        case 'component-instance':
            return '🧩';
        case 'group':
            return '📦';
        default:
            return '■';
    }
}
