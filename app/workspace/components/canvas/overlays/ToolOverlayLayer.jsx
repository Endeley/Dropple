'use client';

import { useCanvasStore } from '../context/CanvasStore';
import GradientToolOverlay from './panels/GradientToolOverlay';
import EffectsToolOverlay from './panels/EffectsToolOverlay';
import LayersToolOverlay from './panels/LayersToolOverlay';
import CommentToolOverlay from './panels/CommentToolOverlay';
import ComponentLibraryOverlay from './panels/ComponentLibraryOverlay';
import PrototypeLinkOverlay from './panels/PrototypeLinkOverlay';
import TimelineAssetsOverlay from './panels/TimelineAssetsOverlay';
import CodeExportOverlay from './panels/CodeExportOverlay';
import GridSettingsOverlay from './panels/GridSettingsOverlay';
import SnapSettingsOverlay from './panels/SnapSettingsOverlay';
import AiBalanceOverlay from './panels/AiBalanceOverlay';

const PANEL_COMPONENTS = {
    gradient: GradientToolOverlay,
    effects: EffectsToolOverlay,
    layers: LayersToolOverlay,
    comment: CommentToolOverlay,
    components: ComponentLibraryOverlay,
    link: PrototypeLinkOverlay,
    timeline: TimelineAssetsOverlay,
    'code-export': CodeExportOverlay,
    grid: GridSettingsOverlay,
    snapping: SnapSettingsOverlay,
    'ai-layout': AiBalanceOverlay,
};

export default function ToolOverlayLayer() {
    const activeToolOverlay = useCanvasStore((state) => state.activeToolOverlay);

    if (!activeToolOverlay) return null;

    const PanelComponent = PANEL_COMPONENTS[activeToolOverlay];
    if (!PanelComponent) return null;

    return (
        <div className='pointer-events-none absolute inset-0 z-40 flex justify-end'>
            <div className='pointer-events-auto m-6 w-80 max-w-full'>
                <PanelComponent />
            </div>
        </div>
    );
}
