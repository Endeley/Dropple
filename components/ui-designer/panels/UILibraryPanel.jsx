'use client';

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Dock, RectangleHorizontal, Rows3, Square, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useEditorStore } from '@/lib/stores/editorStore';
import { generateAILayout } from '@/lib/ai';
import TemplateMenu from './parts/TemplateMenu';
import AssetUploader from './parts/AssetUploader';
import PrimitiveList from './parts/PrimitiveList';

const FALLBACK_TEMPLATES = [
    { id: 'tpl-landing', label: 'Landing Page', kind: 'landing' },
    { id: 'tpl-dashboard', label: 'Dashboard', kind: 'dashboard' },
    { id: 'tpl-mobile', label: 'Mobile App', kind: 'mobile' },
];

const DEFAULT_PRIMITIVES = [
    { id: 'navbar', icon: Dock, label: 'Navbar' },
    { id: 'hero', icon: RectangleHorizontal, label: 'Hero' },
    { id: 'cards3', icon: Rows3, label: 'Cards x3' },
    { id: 'section', icon: Square, label: 'Section' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
];

export default function UILibraryPanel({
    assets = [],
    onUploadAssets,
    onInsertAsset,
    onCreateLayer = () => {},
    onAddPrimitive,
    onPrimitiveDragStart,
    onPrimitiveDragEnd,
    templates = [],
}) {
    const addLayer = useEditorStore((state) => state.addLayer);

    const addLayerAndCanvas = useCallback(
        (definition) => {
            const id = `layer-${nanoid(10)}`;
            const layerPayload = {
                id,
                type: definition.type ?? 'rect',
                x: definition.x ?? 120,
                y: definition.y ?? 120,
                width: definition.width ?? 200,
                height: definition.height ?? 140,
                text: definition.text,
                fontSize: definition.fontSize,
                fill: definition.fill,
                color: definition.color ?? definition.fill,
                visible: definition.visible ?? true,
                cornerRadius: definition.cornerRadius ?? definition.rx ?? definition.ry ?? undefined,
            };

            addLayer(layerPayload);
            onCreateLayer?.({
                ...layerPayload,
                frame: {
                    x: layerPayload.x,
                    y: layerPayload.y,
                    width: layerPayload.width,
                    height: layerPayload.height,
                },
            });
            onAddPrimitive?.(layerPayload.type);
        },
        [addLayer, onAddPrimitive, onCreateLayer]
    );

    const insertPrimitive = useCallback(
        (type) => {
            if (type === 'text') {
                addLayerAndCanvas({
                    type: 'text',
                    x: 190,
                    y: 190,
                    width: 240,
                    height: 60,
                    text: 'Hello Dropple',
                    fontSize: 26,
                });
                return;
            }

            addLayerAndCanvas({
                type: 'rect',
                x: 150,
                y: 150,
                width: 200,
                height: 140,
                fill: '#93c5fd',
            });
        },
        [addLayerAndCanvas]
    );

    const insertTemplate = useCallback(
        (template) => {
            const templateId = template?.templateId ?? template?.slug ?? template?.kind ?? template?.id;

            const elements = (() => {
                switch (templateId) {
                    case 'tpl-landing':
                    case 'landing':
                        return [
                            { type: 'rect', x: 110, y: 120, width: 540, height: 320, fill: '#eef2ff', rx: 32, ry: 32 },
                            { type: 'text', x: 140, y: 150, width: 360, height: 90, text: 'Launch your next idea', fontSize: 34 },
                            { type: 'text', x: 140, y: 230, width: 360, height: 70, text: 'Design, collaborate, and ship with Dropple.', fontSize: 20 },
                            { type: 'rect', x: 140, y: 310, width: 160, height: 52, fill: '#4f46e5', rx: 14, ry: 14 },
                            { type: 'text', x: 162, y: 322, width: 120, height: 32, text: 'Get Started', fontSize: 18, color: '#ffffff' },
                        ];
                    case 'tpl-dashboard':
                    case 'dashboard':
                        return [
                            { type: 'rect', x: 110, y: 140, width: 540, height: 320, fill: '#f8fafc', rx: 28, ry: 28 },
                            { type: 'rect', x: 130, y: 160, width: 230, height: 120, fill: '#c7d2fe', rx: 18, ry: 18 },
                            { type: 'rect', x: 380, y: 160, width: 230, height: 120, fill: '#fecdd3', rx: 18, ry: 18 },
                            { type: 'rect', x: 130, y: 300, width: 460, height: 140, fill: '#e2e8f0', rx: 22, ry: 22 },
                            { type: 'text', x: 150, y: 180, width: 180, height: 40, text: 'Total Revenue', fontSize: 18 },
                            { type: 'text', x: 400, y: 180, width: 180, height: 40, text: 'Active Users', fontSize: 18 },
                            { type: 'text', x: 150, y: 320, width: 220, height: 60, text: 'Performance Overview', fontSize: 20 },
                        ];
                    case 'tpl-mobile':
                    case 'mobile':
                        return [
                            { type: 'rect', x: 200, y: 130, width: 260, height: 520, fill: '#111827', rx: 40, ry: 40 },
                            { type: 'rect', x: 222, y: 200, width: 216, height: 160, fill: '#f97316', rx: 24, ry: 24 },
                            { type: 'text', x: 230, y: 380, width: 200, height: 70, text: 'Mobile Showcase', fontSize: 24, color: '#f8fafc' },
                            { type: 'rect', x: 230, y: 470, width: 160, height: 44, fill: '#38bdf8', rx: 16, ry: 16 },
                            { type: 'text', x: 250, y: 482, width: 120, height: 28, text: 'Download', fontSize: 18, color: '#0b1120' },
                        ];
                    default:
                        return [
                            { type: 'rect', x: 140, y: 160, width: 420, height: 260, fill: '#e2e8f0', rx: 24, ry: 24 },
                            { type: 'text', x: 170, y: 190, width: 320, height: 60, text: template?.label ?? 'Template', fontSize: 28 },
                        ];
                }
            })();

            elements.forEach((element) => addLayerAndCanvas(element));
        },
        [addLayerAndCanvas]
    );

    const handleAIGenerateLayout = useCallback(async () => {
        try {
            const { layout } = await generateAILayout('Generate a simple hero layout with image and headline');
            if (!layout) return;
            const parsed = JSON.parse(layout);
            parsed?.blocks?.forEach((block) => {
                addLayerAndCanvas({
                    type: block.type ?? 'rect',
                    x: block.x ?? 140,
                    y: block.y ?? 140,
                    width: block.width ?? 200,
                    height: block.height ?? 140,
                    text: block.text,
                    fontSize: block.fontSize,
                    fill: block.fill,
                });
            });
        } catch (error) {
            console.error('Invalid layout JSON', error);
        }
    }, [addLayerAndCanvas]);

    const handlePrimitiveDragStart = useCallback(
        (event, primitiveId) => {
            event.dataTransfer.effectAllowed = 'copy';
            try {
                event.dataTransfer.setData('application/x-dropple-primitive', primitiveId);
                event.dataTransfer.setData('text/plain', primitiveId);
            } catch {
                // Safari may throw; ignore.
            }
            onPrimitiveDragStart?.(primitiveId);
        },
        [onPrimitiveDragStart]
    );

    const handlePrimitiveDragEnd = useCallback(() => {
        onPrimitiveDragEnd?.();
    }, [onPrimitiveDragEnd]);

    return (
        <div className="space-y-5">
            <button
                type="button"
                onClick={handleAIGenerateLayout}
                className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
                <Sparkles className="h-4 w-4" /> AI Generate Layout
            </button>

            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => insertPrimitive('rect')}
                        className="rounded border border-slate-200 p-2 text-left text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                        Rectangle
                    </button>
                    <button
                        type="button"
                        onClick={() => insertPrimitive('text')}
                        className="rounded border border-slate-200 p-2 text-left text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                        Text
                    </button>
                </div>
            </div>

            <TemplateMenu templates={templates.length ? templates : FALLBACK_TEMPLATES} onUseTemplate={insertTemplate} />
            <AssetUploader assets={assets} onUploadAssets={onUploadAssets} onInsertAsset={onInsertAsset} />
            <PrimitiveList
                primitives={DEFAULT_PRIMITIVES}
                onAddPrimitive={onAddPrimitive}
                onPrimitiveDragStart={handlePrimitiveDragStart}
                onPrimitiveDragEnd={handlePrimitiveDragEnd}
            />
        </div>
    );
}
