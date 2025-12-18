'use client';
//  test imports temporary
import { normalizeExportTree } from '@/lib/export/normalizeExportTree';
import { renderHTML } from '@/lib/export/renderHTML';
import { useNodeTreeStore } from '@/zustand/nodeTreeStore';

//  test imports temporary
import { useTemplateBuilderStore } from '@/store/useTemplateBuilderStore';

import SizePanel from './inspector/SizePanel';
import PositionPanel from './inspector/PositionPanel';
import TypographyPanel from './inspector/TypographyPanel';
import ColorPanel from './inspector/ColorPanel';
import BorderPanel from './inspector/BorderPanel';
import RadiusPanel from './inspector/RadiusPanel';
import EffectsPanel from './inspector/EffectsPanel';
import ConstraintsPanel from './inspector/ConstraintsPanel';
import StylePicker from './inspector/styles/StylePicker';
import PrototypePanel from './inspector/PrototypePanel';
import ResponsivePanel from './inspector/ResponsivePanel';
import TimelinePanel from './TimelinePanel';
import MotionPanel from './inspector/MotionPanel';
import SlotsPanel from './inspector/SlotsPanel';
import AutoLayoutPanel from './inspector/AutoLayoutPanel';

export default function InspectorPanel() {
    const { currentTemplate, selectedLayerId, isEditingComponent, editingComponentId, editingVariantId, components, enterComponentEdit, setExportModalOpen, detachInstanceToLayers } = useTemplateBuilderStore();

    let layer = currentTemplate.layers.find((l) => l.id === selectedLayerId);
    let componentForInstance = null;

    // ----- COMPONENT EDIT MODE -----
    if (isEditingComponent && editingComponentId) {
        const comp = components.find((c) => c._id === editingComponentId);
        const nodes = editingVariantId ? comp?.variants?.find((v) => v.id === editingVariantId)?.nodes : comp?.nodes;

        layer = nodes?.find((n) => n.id === selectedLayerId);
    }

    // ----- COMPONENT INSTANCE -----
    if (layer?.type === 'component-instance') {
        componentForInstance = components.find((c) => c._id === layer.componentId) || null;
    }

    if (!layer) {
        return <div className='p-4 text-gray-500'>Select a layer to edit its properties.</div>;
    }

    const title = layer.type.charAt(0).toUpperCase() + layer.type.slice(1) + ' Properties';

    return (
        <div className='p-2 space-y-6 overflow-y-auto h-full'>
            {/* ---------- HEADER ---------- */}
            <h2 className='font-semibold text-lg'>{title}</h2>
            <div className='flex gap-2'>
                <button className='px-3 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm' onClick={() => setExportModalOpen(true)}>
                    Export Code
                </button>
            </div>
     
            {/* ---------- COMPONENT INSTANCE CONTROLS ---------- */}
            {layer.type === 'component-instance' && (
                <>
                    <SlotsPanel layer={layer} component={componentForInstance} />

                    <button
                        className='px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
                        onClick={() =>
                            enterComponentEdit(layer.componentId, layer.variantId, {
                                name: componentForInstance?.name || 'Component',
                                nodes: componentForInstance?.nodes || layer.componentNodes || layer.nodes || [],
                                variants: componentForInstance?.variants || layer.componentVariants || [],
                            })
                        }>
                        Edit Component
                    </button>

                    <button className='px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200' onClick={() => detachInstanceToLayers(layer.id)}>
                        Detach to Layers
                    </button>
                </>
            )}
            {/* ==================================================
                AUTO LAYOUT (MUST COME BEFORE POSITION & SIZE)
            ================================================== */}
            <AutoLayoutPanel node={layer} />
            {/* ---------- LAYOUT / POSITION ---------- */}
            <PositionPanel layer={layer} />
            <SizePanel layer={layer} />
            <ConstraintsPanel />
            {/* ---------- STYLE ---------- */}
            <StylePicker layer={layer} />
            <MotionPanel layer={layer} />
            <ResponsivePanel layer={layer} />
            <PrototypePanel layer={layer} />
            {layer.animations?.length ? <TimelinePanel layer={layer} /> : null}
            {/* ---------- TEXT ---------- */}
            {layer.type === 'text' && (
                <>
                    <TypographyPanel layer={layer} />
                    <ColorPanel layer={layer} />
                </>
            )}
            {/* ---------- NON-TEXT COLOR ---------- */}
            {layer.type !== 'text' && <ColorPanel layer={layer} />}
            {/* ---------- DECORATION ---------- */}
            <BorderPanel layer={layer} />
            <RadiusPanel layer={layer} />
            <EffectsPanel layer={layer} />
        </div>
    );
}
