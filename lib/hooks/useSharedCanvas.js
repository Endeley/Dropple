"use client";

import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEditorStore } from '@/lib/stores/editorStore';

const isValidUserId = (value) =>
    typeof value === 'string' && value.length > 12 && !value.startsWith('guest') && !value.startsWith('preview');

export function useSharedCanvas({ designId, user, enabled = true }) {
    const nodes = useQuery(api.canvas.list, enabled && designId ? { designId } : 'skip') || [];
    const upsert = useMutation(api.canvas.upsert);
    const remove = useMutation(api.canvas.remove);

    const hydrateCanvasNodes = useEditorStore((state) => state.hydrateCanvasNodes);
    const lastSignatureRef = useRef(null);

    useEffect(() => {
        if (!enabled || !designId) return;
        const signature = nodes
            .map((node) => `${node.nodeId ?? node.id}:${node.updatedAt ?? ''}`)
            .join('|');
        if (lastSignatureRef.current === signature) return;
        lastSignatureRef.current = signature;
        hydrateCanvasNodes(designId, nodes);
    }, [nodes, enabled, designId, hydrateCanvasNodes]);

    const broadcastLayer = async (layer) => {
        if (!designId || !layer) return;
        const frame = {
            x: layer.x ?? layer.frame?.x ?? 0,
            y: layer.y ?? layer.frame?.y ?? 0,
            width: layer.width ?? layer.frame?.width ?? 120,
            height: layer.height ?? layer.frame?.height ?? 120,
        };
        const style = {
            fill: layer.fill ?? layer.color,
            color: layer.color ?? undefined,
            opacity: layer.opacity ?? 1,
            angle: layer.angle ?? 0,
            fontSize: layer.fontSize,
        };
        const layout = layer.layout && layer.layout.auto
            ? {
                  auto: true,
                  direction: layer.layout.direction ?? 'vertical',
                  spacing: layer.layout.spacing ?? 24,
                  padding: layer.layout.padding ?? 32,
                  alignment: layer.layout.alignment ?? 'start',
                  distribute: layer.layout.distribute ?? 'start',
              }
            : undefined;
        const constraints = layer.constraints
            ? {
                  horizontal: layer.constraints.horizontal ?? 'left',
                  vertical: layer.constraints.vertical ?? 'top',
              }
            : undefined;

        await upsert({
            designId,
            nodeId: layer.id,
            type: layer.type,
            props: {
                frame,
                style,
                text: layer.text,
                name: layer.name,
                layout,
                constraints,
                visible: layer.visible !== false,
                locked: !!layer.locked,
            },
            updatedBy: isValidUserId(user?.id) ? user?.id : undefined,
        });
    };

    const removeLayer = async (layerId) => {
        if (!designId || !layerId) return;
        await remove({ designId, nodeId: layerId });
    };

    return { broadcastLayer, removeLayer };
}
