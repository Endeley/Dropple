'use client';

import { useEffect, useMemo, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { useEditorStore } from '@/lib/stores/editorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TextInputControl from '../inspector/TextInputControl';
import RangeControl from '../inspector/RangeControl';
import ColorControl from '../inspector/ColorControl';
import { generateAIText } from '@/lib/ai';

const INITIAL_LAYOUT = {
    auto: false,
    direction: 'vertical',
    spacing: 24,
    padding: 32,
    alignment: 'start',
    distribute: 'start',
};

export default function UIInspectorPanel({ onLayerChange = () => {} }) {
    const selectedIds = useEditorStore((state) => state.selectedIds);
    const activeScreen = useEditorStore((state) => state.activeScreen);
    const updateLayer = useEditorStore((state) => state.updateLayer);
    const updateRootLayout = useEditorStore((state) => state.updateRootLayout);

    const [selectedLayer, setSelectedLayer] = useState(null);

    useEffect(() => {
        if (!activeScreen) {
            setSelectedLayer(null);
            return;
        }
        if (!selectedIds.length) {
            setSelectedLayer({ ...activeScreen.root, id: `${activeScreen.id}-root`, isRoot: true });
            return;
        }
        const id = selectedIds[0];
        const layer = activeScreen.layers?.find((item) => item.id === id) ?? null;
        setSelectedLayer(layer);
    }, [selectedIds, activeScreen]);

    const layout = useMemo(
        () => ({ ...INITIAL_LAYOUT, ...(selectedLayer?.layout ?? (selectedLayer?.isRoot ? activeScreen?.root?.layout : {})) }),
        [selectedLayer, activeScreen]
    );

    const handleChange = (payload) => {
        if (!selectedLayer) return;
        if (selectedLayer.isRoot) {
            updateRootLayout(payload.layout ?? {});
            return;
        }
        updateLayer(selectedLayer.id, payload);
        onLayerChange({
            ...selectedLayer,
            ...payload,
            frame: {
                ...(selectedLayer.frame ?? {}),
                ...(payload.x !== undefined ? { x: payload.x } : {}),
                ...(payload.y !== undefined ? { y: payload.y } : {}),
                ...(payload.width !== undefined ? { width: payload.width } : {}),
                ...(payload.height !== undefined ? { height: payload.height } : {}),
            },
        });
    };

    if (!selectedLayer) {
        return <div className="py-10 text-center text-sm text-slate-400">No element selected.</div>;
    }

    const supportsAutoLayout = selectedLayer.isRoot || selectedLayer.type === 'container' || selectedLayer.type === 'group';

    const applyLayoutChanges = (changes) => {
        const nextLayout = { ...layout, ...changes };
        if (!supportsAutoLayout) return;
        if (selectedLayer.isRoot) {
            updateRootLayout(nextLayout);
        } else {
            handleChange({ layout: nextLayout });
        }
    };

    const toggleAutoLayout = () => {
        if (!supportsAutoLayout) return;
        applyLayoutChanges({ auto: !layout.auto });
    };

    const updateConstraints = (axis, value) => {
        if (selectedLayer.isRoot) return;
        handleChange({ constraints: { ...selectedLayer.constraints, [axis]: value } });
    };

    const handleAIGenerateText = async () => {
        if (selectedLayer.isRoot) return;
        const prompt = `Write a catchy line related to ${selectedLayer.text || 'design'} for a modern creative poster`;
        const { text } = await generateAIText(prompt);
        if (text) {
            handleChange({ text });
        }
    };

    return (
        <div className="space-y-4 text-xs">
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Inspector</h3>
            <Tabs defaultValue="layout" className="w-full">
                <TabsList className="grid grid-cols-4 gap-2">
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                    <TabsTrigger value="style" disabled={selectedLayer.isRoot}>Style</TabsTrigger>
                    <TabsTrigger value="interactions">Interactions</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                </TabsList>

                <TabsContent value="layout" className="space-y-3">
                    {!selectedLayer.isRoot ? (
                        <Section title="Frame">
                            <div className="grid grid-cols-2 gap-2">
                                <TextInputControl
                                    label="X"
                                    type="number"
                                    value={selectedLayer.x ?? selectedLayer.frame?.x ?? 0}
                                    onChange={(val) => handleChange({ x: Number(val) || 0 })}
                                />
                                <TextInputControl
                                    label="Y"
                                    type="number"
                                    value={selectedLayer.y ?? selectedLayer.frame?.y ?? 0}
                                    onChange={(val) => handleChange({ y: Number(val) || 0 })}
                                />
                                <TextInputControl
                                    label="Width"
                                    type="number"
                                    value={selectedLayer.width ?? selectedLayer.frame?.width ?? 120}
                                    onChange={(val) => handleChange({ width: Math.max(1, Number(val) || 0) })}
                                />
                                <TextInputControl
                                    label="Height"
                                    type="number"
                                    value={selectedLayer.height ?? selectedLayer.frame?.height ?? 120}
                                    onChange={(val) => handleChange({ height: Math.max(1, Number(val) || 0) })}
                                />
                            </div>
                        </Section>
                    ) : null}

                    {supportsAutoLayout ? (
                        <Section title="Auto Layout">
                            <button
                                type="button"
                                onClick={toggleAutoLayout}
                                className={`w-full rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                                    layout.auto
                                        ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                        : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                            >
                                {layout.auto ? 'Disable Auto Layout' : 'Enable Auto Layout'}
                            </button>
                            {layout.auto ? (
                                <div className="mt-3 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <SelectControl
                                            label="Direction"
                                            value={layout.direction}
                                            options={[
                                                { value: 'vertical', label: 'Vertical' },
                                                { value: 'horizontal', label: 'Horizontal' },
                                            ]}
                                            onChange={(value) => applyLayoutChanges({ direction: value })}
                                        />
                                        <SelectControl
                                            label="Alignment"
                                            value={layout.alignment}
                                            options={[
                                                { value: 'start', label: 'Start' },
                                                { value: 'center', label: 'Center' },
                                                { value: 'end', label: 'End' },
                                                { value: 'space-between', label: 'Space Between' },
                                            ]}
                                            onChange={(value) => applyLayoutChanges({ alignment: value })}
                                        />
                                    </div>
                                    <RangeControl
                                        label="Spacing"
                                        value={layout.spacing}
                                        min={0}
                                        max={160}
                                        step={1}
                                        onChange={(val) => applyLayoutChanges({ spacing: val })}
                                    />
                                    <RangeControl
                                        label="Padding"
                                        value={layout.padding}
                                        min={0}
                                        max={160}
                                        step={1}
                                        onChange={(val) => applyLayoutChanges({ padding: val })}
                                    />
                                </div>
                            ) : null}
                        </Section>
                    ) : null}

                    {!selectedLayer.isRoot ? (
                        <Section title="Constraints">
                            <div className="grid grid-cols-2 gap-2">
                                <SelectControl
                                    label="Horizontal"
                                    value={selectedLayer.constraints?.horizontal ?? 'left'}
                                    options={[
                                        { value: 'left', label: 'Left' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'right', label: 'Right' },
                                        { value: 'scale', label: 'Scale' },
                                    ]}
                                    onChange={(value) => updateConstraints('horizontal', value)}
                                />
                                <SelectControl
                                    label="Vertical"
                                    value={selectedLayer.constraints?.vertical ?? 'top'}
                                    options={[
                                        { value: 'top', label: 'Top' },
                                        { value: 'middle', label: 'Middle' },
                                        { value: 'bottom', label: 'Bottom' },
                                        { value: 'scale', label: 'Scale' },
                                    ]}
                                    onChange={(value) => updateConstraints('vertical', value)}
                                />
                            </div>
                        </Section>
                    ) : null}
                </TabsContent>

                <TabsContent value="style" className="space-y-3">
                    {!selectedLayer.isRoot ? (
                        <>
                            <Section title="Typography">
                                <TextInputControl
                                    label="Layer Name"
                                    value={selectedLayer.name ?? ''}
                                    onChange={(val) => handleChange({ name: val })}
                                />
                                <RangeControl
                                    label="Font Size"
                                    value={selectedLayer.fontSize ?? 16}
                                    min={8}
                                    max={96}
                                    onChange={(val) => handleChange({ fontSize: val })}
                                />
                                <button
                                    type="button"
                                    onClick={handleAIGenerateText}
                                    className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-indigo-200 px-2 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                >
                                    <Wand2 className="h-3 w-3" /> AI Suggest Copy
                                </button>
                            </Section>
                            <Section title="Colors & Effects">
                                <ColorControl
                                    label="Fill Color"
                                    value={selectedLayer.fill ?? '#a5b4fc'}
                                    onChange={(val) => handleChange({ fill: val, color: val })}
                                />
                                <RangeControl
                                    label="Opacity"
                                    value={selectedLayer.opacity ?? 1}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={(val) => handleChange({ opacity: val })}
                                />
                            </Section>
                        </>
                    ) : (
                        <PlaceholderCard message="Select a layer to adjust typography, fill, and visual styles." />
                    )}
                </TabsContent>

                <TabsContent value="interactions">
                    <PlaceholderCard message="Interaction designer coming soon—link this layer to prototypes, hover states, and custom events." />
                </TabsContent>

                <TabsContent value="assets">
                    <PlaceholderCard message="Connect brand tokens, imagery, and reusable components. Design token syncing lands here." />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <Collapsible defaultOpen>
            <div className="rounded-lg border border-slate-200 bg-white">
                <CollapsibleTrigger asChild>
                    <button type="button" className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600">
                        {title}
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 border-t border-slate-200 px-3 py-3">{children}</CollapsibleContent>
            </div>
        </Collapsible>
    );
}

function SelectControl({ label, value, options, onChange }) {
    return (
        <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
            {label}
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function PlaceholderCard({ message }) {
    return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">{message}</div>;
}
