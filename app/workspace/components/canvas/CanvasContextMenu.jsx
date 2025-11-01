'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useCanvasStore } from './context/CanvasStore';
import { useHistoryStatus } from './history/useHistoryStatus';

const MENU_WIDTH = 320;

const EMPTY_ARRAY = Object.freeze([]);
const NOOP = () => {};

export default function CanvasContextMenu() {
    const contextMenu = useCanvasStore((state) => state.contextMenu);
    const mode = useCanvasStore((state) => state.mode);
    const clipboard = useCanvasStore((state) => state.clipboard);
    const closeContextMenu = useCanvasStore((state) => state.closeContextMenu) ?? NOOP;
    const copyElement = useCanvasStore((state) => state.copyElement) ?? NOOP;
    const duplicateElement = useCanvasStore((state) => state.duplicateElement) ?? NOOP;
    const pasteElement = useCanvasStore((state) => state.pasteElement) ?? NOOP;
    const removeElement = useCanvasStore((state) => state.removeElement) ?? NOOP;
    const removeTimelineAsset = useCanvasStore((state) => state.removeTimelineAsset) ?? NOOP;
    const removeTimelineAssets = useCanvasStore((state) => state.removeTimelineAssets) ?? NOOP;
    const copyFrame = useCanvasStore((state) => state.copyFrame) ?? NOOP;
    const duplicateFrame = useCanvasStore((state) => state.duplicateFrame) ?? NOOP;
    const pasteFrame = useCanvasStore((state) => state.pasteFrame) ?? NOOP;
    const removeFrame = useCanvasStore((state) => state.removeFrame) ?? NOOP;
    const bringElementForward = useCanvasStore((state) => state.bringElementForward) ?? NOOP;
    const bringElementToFront = useCanvasStore((state) => state.bringElementToFront) ?? NOOP;
    const sendElementBackward = useCanvasStore((state) => state.sendElementBackward) ?? NOOP;
    const sendElementToBack = useCanvasStore((state) => state.sendElementToBack) ?? NOOP;
    const groupSelectedElements = useCanvasStore((state) => state.groupSelectedElements) ?? NOOP;
    const ungroupElement = useCanvasStore((state) => state.ungroupElement) ?? NOOP;
    const liftElementOutOfGroup = useCanvasStore((state) => state.liftElementOutOfGroup) ?? NOOP;
    const alignSelectedElements = useCanvasStore((state) => state.alignSelectedElements) ?? NOOP;
    const distributeSelectedElements = useCanvasStore((state) => state.distributeSelectedElements) ?? NOOP;
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay) ?? NOOP;
    const frames = useCanvasStore((state) => state.frames) ?? EMPTY_ARRAY;
    const selectedElementIds = useCanvasStore((state) => state.selectedElementIds) ?? EMPTY_ARRAY;
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const setScale = useCanvasStore((state) => state.setScale) ?? NOOP;
    const setPosition = useCanvasStore((state) => state.setPosition) ?? NOOP;
    const toggleGrid = useCanvasStore((state) => state.toggleGrid) ?? NOOP;
    const setMode = useCanvasStore((state) => state.setMode) ?? NOOP;
    const sendModeIntent = useCanvasStore((state) => state.sendModeIntent) ?? NOOP;
    const previewAutoLayoutSuggestion = useCanvasStore((state) => state.previewAutoLayoutSuggestion) ?? NOOP;
    const undoCanvas = useCanvasStore((state) => state.undoCanvas) ?? NOOP;
    const redoCanvas = useCanvasStore((state) => state.redoCanvas) ?? NOOP;
    const { canUndo, canRedo } = useHistoryStatus();

    useEffect(() => {
        if (!contextMenu) return undefined;

        const handlePointer = (event) => {
            if (!(event.target instanceof Element)) {
                closeContextMenu();
                return;
            }
            if (!event.target.closest('[data-canvas-context-menu]')) {
                closeContextMenu();
            }
        };

        const handleKey = (event) => {
            if (event.key === 'Escape') {
                closeContextMenu();
            }
        };

        window.addEventListener('pointerdown', handlePointer, true);
        window.addEventListener('contextmenu', handlePointer, true);
        window.addEventListener('keydown', handleKey);

        return () => {
            window.removeEventListener('pointerdown', handlePointer, true);
            window.removeEventListener('contextmenu', handlePointer, true);
            window.removeEventListener('keydown', handleKey);
        };
    }, [contextMenu, closeContextMenu]);

    const menuPosition = useMemo(() => {
        if (!contextMenu) return null;
        if (typeof window === 'undefined') {
            return { top: contextMenu.position.y, left: contextMenu.position.x };
        }
        const { innerWidth, innerHeight } = window;
        const estimatedHeight = 420;
        let left = contextMenu.position.x;
        let top = contextMenu.position.y;
        if (left + MENU_WIDTH > innerWidth - 12) {
            left = Math.max(12, innerWidth - MENU_WIDTH - 12);
        }
        if (top + estimatedHeight > innerHeight - 12) {
            top = Math.max(12, innerHeight - estimatedHeight - 12);
        }
        return { top, left };
    }, [contextMenu]);

    const [query, setQuery] = useState('');

    const activeType = contextMenu?.type ?? null;
    const frameId = contextMenu?.frameId ?? null;
    const elementId = contextMenu?.elementId ?? null;
    const timelineAssetId = contextMenu?.timelineAssetId ?? null;
    const timelineAssetLabel = contextMenu?.assetLabel ?? null;
    const timelineSelectedAssetIds = useCanvasStore((state) => state.timelineSelectedAssetIds ?? EMPTY_ARRAY);
    const canvasPoint = contextMenu?.canvasPoint ?? null;

    const frame = useMemo(() => {
        if (!frameId) return null;
        return frames.find((item) => item.id === frameId) ?? null;
    }, [frames, frameId]);

    const element = useMemo(() => {
        if (!frame || !elementId) return null;
        return frame.elements.find((item) => item.id === elementId) ?? null;
    }, [frame, elementId]);

    const isElementClipboard = clipboard?.type === 'element';
    const isFrameClipboard = clipboard?.type === 'frame';
    const selectionCount = selectedElementIds.length;
    const isGroupElement = element?.type === 'group';
    const parentId = element?.parentId ?? null;

    const createMenuItem = ({ key, label, icon, action, disabled = false, danger = false, keywords = [], description }) => ({
        key,
        label,
        icon,
        action,
        disabled: disabled || !action,
        danger,
        keywords,
        description,
    });

    const handleAction = (action) => {
        action();
        closeContextMenu();
    };

    const canCopyElement = activeType === 'element' && frameId && elementId;
    const canCopyFrame = activeType === 'frame' && frameId;
    const canDuplicateElement = canCopyElement;
    const canDuplicateFrame = canCopyFrame;
    const canPasteIntoFrame = Boolean(frameId) && isElementClipboard;
    const canPasteElementOnCanvas = isElementClipboard;
    const canPasteFrameOnCanvas = isFrameClipboard;
    const canBringForward = Boolean(frameId && elementId);
    const canGroup = selectionCount > 1 && selectedFrameId === frameId;
    const canUngroup = isGroupElement && Boolean(frameId && elementId);
    const canLift = Boolean(parentId);
    const canAlign = selectionCount >= 2 && selectedFrameId === frameId;
    const canDistribute = selectionCount >= 3 && selectedFrameId === frameId;

    const universalItems = [];

    universalItems.push(
        createMenuItem({
            key: 'undo',
            label: 'Undo',
            icon: '↩️',
            action: canUndo ? () => undoCanvas() : null,
            disabled: !canUndo,
            keywords: ['undo'],
        }),
        createMenuItem({
            key: 'redo',
            label: 'Redo',
            icon: '↪️',
            action: canRedo ? () => redoCanvas() : null,
            disabled: !canRedo,
            keywords: ['redo'],
        }),
        createMenuItem({
            key: 'copy',
            label: 'Copy',
            icon: '📋',
            action:
                canCopyElement
                    ? () => copyElement(frameId, elementId)
                    : canCopyFrame
                        ? () => copyFrame(frameId)
                        : null,
            keywords: ['copy', 'duplicate', 'clipboard'],
        }),
        createMenuItem({
            key: 'duplicate',
            label: 'Duplicate',
            icon: '➕',
            action:
                canDuplicateElement
                    ? () => duplicateElement(frameId, elementId)
                    : canDuplicateFrame
                        ? () => duplicateFrame(frameId)
                        : null,
            keywords: ['duplicate', 'clone'],
        }),
        createMenuItem({
            key: 'paste',
            label: 'Paste',
            icon: '📌',
            action:
                activeType === 'element' && frameId && isElementClipboard
                    ? () => pasteElement(frameId, canvasPoint)
                    : activeType === 'frame' && isFrameClipboard
                        ? () => pasteFrame(canvasPoint)
                        : activeType === 'canvas' && isFrameClipboard
                            ? () => pasteFrame(canvasPoint)
                            : activeType === 'canvas' && isElementClipboard
                                ? () => pasteElement(null, canvasPoint)
                                : frameId && isElementClipboard
                                    ? () => pasteElement(frameId, canvasPoint)
                                    : null,
            disabled: !(canPasteIntoFrame || canPasteElementOnCanvas || canPasteFrameOnCanvas),
            keywords: ['paste'],
        }),
        createMenuItem({
            key: 'delete',
            label: 'Delete',
            icon: '🗑️',
            action:
                activeType === 'timeline-asset' && timelineAssetId
                    ? () => {
                          const selection = timelineSelectedAssetIds.length > 1 ? timelineSelectedAssetIds : [timelineAssetId];
                          if (selection.length > 1) {
                              removeTimelineAssets(selection, {
                                  historyLabel: `Timeline: Remove ${selection.length} clips`,
                                  source: 'timeline',
                              });
                          } else {
                              removeTimelineAsset(timelineAssetId, {
                                  historyLabel: timelineAssetLabel ? `Timeline: Remove "${timelineAssetLabel}"` : undefined,
                                  source: 'timeline',
                              });
                          }
                      }
                    : activeType === 'element' && frameId && elementId
                        ? () => removeElement(frameId, elementId)
                        : activeType === 'frame' && frameId
                            ? () => removeFrame(frameId)
                            : null,
            danger: true,
            disabled:
                !(activeType === 'timeline-asset' && timelineAssetId) &&
                !(activeType === 'element' && frameId && elementId) &&
                !(activeType === 'frame' && frameId),
            keywords: ['delete', 'remove', 'clear'],
        }),
        createMenuItem({
            key: 'lock',
            label: 'Lock / Unlock Layer',
            icon: '🔒',
            disabled: true,
            keywords: ['lock', 'unlock'],
        }),
        createMenuItem({
            key: 'toggle-visibility',
            label: 'Hide / Show',
            icon: '👁️',
            disabled: true,
            keywords: ['hide', 'show', 'visibility'],
        }),
        createMenuItem({
            key: 'bring-forward',
            label: 'Bring Forward',
            icon: '⬆️',
            action: canBringForward ? () => bringElementForward(frameId, elementId) : null,
            disabled: !canBringForward,
            keywords: ['layer', 'forward'],
        }),
        createMenuItem({
            key: 'send-backward',
            label: 'Send Backward',
            icon: '⬇️',
            action: canBringForward ? () => sendElementBackward(frameId, elementId) : null,
            disabled: !canBringForward,
            keywords: ['layer', 'backward'],
        }),
        createMenuItem({
            key: 'bring-front',
            label: 'Bring to Front',
            icon: '⏫',
            action: canBringForward ? () => bringElementToFront(frameId, elementId) : null,
            disabled: !canBringForward,
            keywords: ['layer', 'front'],
        }),
        createMenuItem({
            key: 'send-back',
            label: 'Send to Back',
            icon: '⏬',
            action: canBringForward ? () => sendElementToBack(frameId, elementId) : null,
            disabled: !canBringForward,
            keywords: ['layer', 'back'],
        }),
        createMenuItem({
            key: 'group',
            label: 'Group Selection',
            icon: '🧩',
            action: canGroup ? () => groupSelectedElements() : null,
            disabled: !canGroup,
            keywords: ['group'],
        }),
        createMenuItem({
            key: 'ungroup',
            label: 'Ungroup',
            icon: '🪄',
            action: canUngroup ? () => ungroupElement(frameId, elementId) : null,
            disabled: !canUngroup,
            keywords: ['ungroup'],
        }),
        createMenuItem({
            key: 'lift-group',
            label: 'Lift From Group',
            icon: '🧺',
            action: canLift ? () => liftElementOutOfGroup(frameId, elementId) : null,
            disabled: !canLift,
            keywords: ['lift', 'group'],
        }),
        createMenuItem({
            key: 'align-center',
            label: 'Align Center',
            icon: '📏',
            action: canAlign ? () => alignSelectedElements('center') : null,
            disabled: !canAlign,
            keywords: ['align', 'center'],
        }),
        createMenuItem({
            key: 'align-middle',
            label: 'Align Middle',
            icon: '📐',
            action: canAlign ? () => alignSelectedElements('middle') : null,
            disabled: !canAlign,
            keywords: ['align', 'middle'],
        }),
        createMenuItem({
            key: 'distribute-horizontal',
            label: 'Distribute Horizontal',
            icon: '🧭',
            action: canDistribute ? () => distributeSelectedElements('horizontal') : null,
            disabled: !canDistribute,
            keywords: ['distribute', 'horizontal'],
        }),
        createMenuItem({
            key: 'distribute-vertical',
            label: 'Distribute Vertical',
            icon: '🧭',
            action: canDistribute ? () => distributeSelectedElements('vertical') : null,
            disabled: !canDistribute,
            keywords: ['distribute', 'vertical'],
        }),
        createMenuItem({
            key: 'quick-style',
            label: 'Quick Style / Apply Preset',
            icon: '🎨',
            disabled: true,
            keywords: ['style', 'preset'],
        }),
        createMenuItem({
            key: 'cut',
            label: 'Cut / Merge / Split',
            icon: '✂️',
            disabled: true,
            keywords: ['cut', 'merge', 'split'],
        }),
        createMenuItem({
            key: 'transform',
            label: 'Resize / Scale / Rotate / Flip',
            icon: '📐',
            disabled: true,
            keywords: ['transform', 'resize', 'rotate'],
        }),
        createMenuItem({
            key: 'save-asset',
            label: 'Save as Asset / Add to Library',
            icon: '📁',
            disabled: true,
            keywords: ['asset', 'library'],
        }),
        createMenuItem({
            key: 'ai-enhance',
            label: 'AI Enhance / Smart Suggestion',
            icon: '🪄',
            disabled: true,
            keywords: ['ai', 'enhance'],
        }),
        createMenuItem({
            key: 'export-selection',
            label: 'Export Selection',
            icon: '📸',
            disabled: true,
            keywords: ['export'],
        }),
        createMenuItem({
            key: 'duplicate-frame',
            label: 'Duplicate as Page / Frame',
            icon: '🪟',
            action: activeType === 'frame' && frameId ? () => duplicateFrame(frameId) : null,
            disabled: !(activeType === 'frame' && frameId),
            keywords: ['duplicate', 'frame'],
        }),
        createMenuItem({
            key: 'snapshot',
            label: 'Quick Save Snapshot',
            icon: '💾',
            disabled: true,
            keywords: ['snapshot', 'save'],
        }),
        createMenuItem({
            key: 'ai-describe',
            label: 'Describe Element (AI)',
            icon: '🧠',
            disabled: true,
            keywords: ['describe', 'ai'],
        }),
    );

    const graphicItems = [
        createMenuItem({
            key: 'graphic-edit-text',
            label: 'Edit Text / Font / Color',
            icon: '✏️',
            disabled: element?.type !== 'text',
            keywords: ['text', 'font', 'color'],
        }),
        createMenuItem({
            key: 'graphic-change-fill',
            label: 'Change Fill / Gradient / Border',
            icon: '🖍️',
            action: () => setActiveToolOverlay('gradient'),
            keywords: ['fill', 'gradient', 'border'],
        }),
        createMenuItem({
            key: 'graphic-vector',
            label: 'Vector Path / Edit Anchor Points',
            icon: '🖊️',
            disabled: true,
            keywords: ['vector', 'anchor'],
        }),
        createMenuItem({
            key: 'graphic-add-shape',
            label: 'Add Shape / Frame / Line / Arrow',
            icon: '🔲',
            disabled: true,
            keywords: ['shape', 'frame', 'line'],
        }),
        createMenuItem({
            key: 'graphic-apply-gradient',
            label: 'Apply Gradient / Filter / Texture',
            icon: '🌈',
            action: () => setActiveToolOverlay('effects'),
            keywords: ['gradient', 'filter', 'texture'],
        }),
        createMenuItem({
            key: 'graphic-ai-style',
            label: 'AI Style (Modern / Minimal / 3D / Vintage)',
            icon: '🪄',
            disabled: true,
            keywords: ['ai', 'style'],
        }),
        createMenuItem({
            key: 'graphic-smart-object',
            label: 'Convert to Smart Object',
            icon: '🧱',
            disabled: true,
            keywords: ['smart', 'object'],
        }),
        createMenuItem({
            key: 'graphic-align-grid',
            label: 'Align to Center / Grid',
            icon: '📏',
            disabled: !canAlign,
            action: canAlign ? () => alignSelectedElements('center') : null,
            keywords: ['align', 'center', 'grid'],
        }),
        createMenuItem({
            key: 'graphic-export-object',
            label: 'Export Object as Image',
            icon: '📸',
            disabled: true,
            keywords: ['export', 'image'],
        }),
        createMenuItem({
            key: 'graphic-replace-image',
            label: 'Replace Image / Swap Layer',
            icon: '🖼️',
            disabled: element?.type !== 'image',
            keywords: ['replace', 'image'],
        }),
        createMenuItem({
            key: 'graphic-ai-similar',
            label: 'AI Generate Similar Design',
            icon: '🧠',
            disabled: true,
            keywords: ['ai', 'similar'],
        }),
        createMenuItem({
            key: 'graphic-add-template',
            label: 'Add to Template Library',
            icon: '🗂️',
            disabled: true,
            keywords: ['template', 'library'],
        }),
        createMenuItem({
            key: 'graphic-apply-effects',
            label: 'Apply Drop Shadow / Glow / Blur',
            icon: '🔦',
            action: () => setActiveToolOverlay('effects'),
            keywords: ['shadow', 'glow', 'blur'],
        }),
        createMenuItem({
            key: 'graphic-balance',
            label: 'Auto Balance Colors',
            icon: '✨',
            disabled: true,
            keywords: ['balance', 'color'],
        }),
        createMenuItem({
            key: 'graphic-feather',
            label: 'Feather Edges',
            icon: '🪶',
            disabled: true,
            keywords: ['feather'],
        }),
    ];

    const uxItems = [
        createMenuItem({
            key: 'ux-component',
            label: 'Convert to Component',
            icon: '⚙️',
            disabled: true,
            keywords: ['component'],
        }),
        createMenuItem({
            key: 'ux-variant',
            label: 'Create Variant',
            icon: '🔁',
            disabled: true,
            keywords: ['variant'],
        }),
        createMenuItem({
            key: 'ux-interaction',
            label: 'Add Interaction (On Click / Hover)',
            icon: '💡',
            action: () => setActiveToolOverlay('link'),
            keywords: ['interaction', 'prototype'],
        }),
        createMenuItem({
            key: 'ux-theme',
            label: 'Apply Theme Style',
            icon: '🌈',
            disabled: true,
            keywords: ['theme'],
        }),
        createMenuItem({
            key: 'ux-responsiveness',
            label: 'Preview Responsiveness',
            icon: '📱',
            disabled: true,
            keywords: ['preview', 'responsive'],
        }),
        createMenuItem({
            key: 'ux-ai-layout',
            label: 'AI Suggest Layout',
            icon: '🧠',
            action: () =>
                previewAutoLayoutSuggestion({
                    frameId: frameId ?? selectedFrameId ?? null,
                    columns: 4,
                    rows: 3,
                }),
            keywords: ['ai', 'layout'],
        }),
        createMenuItem({
            key: 'ux-detach',
            label: 'Detach Instance',
            icon: '🧩',
            disabled: true,
            keywords: ['detach'],
        }),
        createMenuItem({
            key: 'ux-auto-layout',
            label: 'Auto Layout Settings',
            icon: '🪄',
            disabled: true,
            keywords: ['auto layout'],
        }),
        createMenuItem({
            key: 'ux-swap-style',
            label: 'Swap Style / Match Component',
            icon: '🎨',
            disabled: true,
            keywords: ['swap', 'style'],
        }),
        createMenuItem({
            key: 'ux-navigate',
            label: 'Navigate to Linked Frame',
            icon: '🧭',
            disabled: true,
            keywords: ['navigate'],
        }),
        createMenuItem({
            key: 'ux-wrap-frame',
            label: 'Wrap in Frame / Auto Group',
            icon: '🧰',
            disabled: true,
            keywords: ['wrap', 'frame'],
        }),
        createMenuItem({
            key: 'ux-glass',
            label: 'Apply Glass / Neumorphism / Shadow',
            icon: '🪶',
            disabled: true,
            keywords: ['glass', 'shadow'],
        }),
        createMenuItem({
            key: 'ux-prototype-link',
            label: 'Quick Prototype Link',
            icon: '🗃️',
            action: () => setActiveToolOverlay('link'),
            keywords: ['prototype', 'link'],
        }),
    ];

    const animationItems = [
        createMenuItem({
            key: 'anim-keyframe',
            label: 'Add Keyframe',
            icon: '🎬',
            action: () => setActiveToolOverlay('timeline'),
            keywords: ['keyframe', 'timeline'],
        }),
        createMenuItem({
            key: 'anim-animate',
            label: 'Animate Property',
            icon: '⏱️',
            disabled: true,
            keywords: ['animate'],
        }),
        createMenuItem({
            key: 'anim-pose',
            label: 'Add Pose / Expression',
            icon: '🧍‍♂️',
            disabled: true,
            keywords: ['pose', 'expression'],
        }),
        createMenuItem({
            key: 'anim-motion',
            label: 'Apply Motion Preset',
            icon: '💫',
            disabled: true,
            keywords: ['motion'],
        }),
        createMenuItem({
            key: 'anim-ai-motion',
            label: 'AI Generate Motion',
            icon: '🧠',
            disabled: true,
            keywords: ['ai', 'motion'],
        }),
        createMenuItem({
            key: 'anim-sound',
            label: 'Add Sound Effect',
            icon: '🎧',
            disabled: true,
            keywords: ['sound'],
        }),
        createMenuItem({
            key: 'anim-lipsync',
            label: 'Sync to Voice / Lip Sync',
            icon: '🔈',
            disabled: true,
            keywords: ['lip', 'sync'],
        }),
        createMenuItem({
            key: 'anim-lighting',
            label: 'Lighting Adjustment',
            icon: '🔦',
            disabled: true,
            keywords: ['lighting'],
        }),
        createMenuItem({
            key: 'anim-loop',
            label: 'Loop Animation',
            icon: '🔄',
            disabled: true,
            keywords: ['loop'],
        }),
        createMenuItem({
            key: 'anim-replace-bg',
            label: 'Replace Background / Scene',
            icon: '🎨',
            disabled: true,
            keywords: ['background'],
        }),
        createMenuItem({
            key: 'anim-timeline',
            label: 'Timeline Options',
            icon: '⚙️',
            action: () => setActiveToolOverlay('timeline'),
            keywords: ['timeline'],
        }),
        createMenuItem({
            key: 'anim-ease',
            label: 'Smooth Motion / Auto Ease',
            icon: '🪄',
            disabled: true,
            keywords: ['ease'],
        }),
    ];

    const podcastItems = [
        createMenuItem({
            key: 'podcast-play',
            label: 'Play / Pause / Trim',
            icon: '▶️',
            disabled: true,
            keywords: ['play', 'pause', 'trim'],
        }),
        createMenuItem({
            key: 'podcast-split',
            label: 'Split / Cut / Merge',
            icon: '✂️',
            disabled: true,
            keywords: ['split', 'cut', 'merge'],
        }),
        createMenuItem({
            key: 'podcast-volume',
            label: 'Adjust Volume / Fade',
            icon: '🔊',
            disabled: true,
            keywords: ['volume', 'fade'],
        }),
        createMenuItem({
            key: 'podcast-clean',
            label: 'AI Clean Audio / Remove Noise',
            icon: '🧠',
            disabled: true,
            keywords: ['ai', 'clean'],
        }),
        createMenuItem({
            key: 'podcast-change-voice',
            label: 'Change Voice / Tone / Accent',
            icon: '🗣️',
            disabled: true,
            keywords: ['voice'],
        }),
        createMenuItem({
            key: 'podcast-cohost',
            label: 'Add AI Co-Host Voice',
            icon: '🧍‍♀️',
            disabled: true,
            keywords: ['co-host'],
        }),
        createMenuItem({
            key: 'podcast-background',
            label: 'Add Background Music',
            icon: '🎵',
            disabled: true,
            keywords: ['music'],
        }),
        createMenuItem({
            key: 'podcast-transcript',
            label: 'Auto Transcript',
            icon: '🕵️',
            disabled: true,
            keywords: ['transcript'],
        }),
        createMenuItem({
            key: 'podcast-show-notes',
            label: 'Generate Show Notes',
            icon: '🗒️',
            disabled: true,
            keywords: ['notes'],
        }),
        createMenuItem({
            key: 'podcast-translate',
            label: 'Translate Audio / Subtitles',
            icon: '🌎',
            disabled: true,
            keywords: ['translate'],
        }),
        createMenuItem({
            key: 'podcast-mix',
            label: 'Mix & Export',
            icon: '📢',
            disabled: true,
            keywords: ['mix', 'export'],
        }),
        createMenuItem({
            key: 'podcast-script',
            label: 'View Script / Edit Text',
            icon: '🧾',
            disabled: true,
            keywords: ['script', 'text'],
        }),
        createMenuItem({
            key: 'podcast-sfx',
            label: 'Insert Sound Effect',
            icon: '🧩',
            disabled: true,
            keywords: ['sound effect'],
        }),
    ];

    const videoItems = [
        createMenuItem({
            key: 'video-split',
            label: 'Split / Trim / Ripple Delete',
            icon: '🎞️',
            disabled: true,
            keywords: ['split', 'trim'],
        }),
        createMenuItem({
            key: 'video-speed',
            label: 'Change Speed (Slow, Fast, Reverse)',
            icon: '⏩',
            disabled: true,
            keywords: ['speed'],
        }),
        createMenuItem({
            key: 'video-filter',
            label: 'Add Filter / LUT',
            icon: '🎨',
            disabled: true,
            keywords: ['filter', 'lut'],
        }),
        createMenuItem({
            key: 'video-detach-audio',
            label: 'Detach Audio',
            icon: '🔈',
            disabled: true,
            keywords: ['audio'],
        }),
        createMenuItem({
            key: 'video-ai-cut',
            label: 'AI Auto Cut / Scene Detect',
            icon: '🧠',
            disabled: true,
            keywords: ['ai', 'scene'],
        }),
        createMenuItem({
            key: 'video-chroma',
            label: 'Chroma Key / Remove Background',
            icon: '✂️',
            disabled: true,
            keywords: ['chroma'],
        }),
        createMenuItem({
            key: 'video-transition',
            label: 'Add Transition',
            icon: '🔮',
            disabled: true,
            keywords: ['transition'],
        }),
        createMenuItem({
            key: 'video-caption',
            label: 'Add Caption / Auto Subtitle',
            icon: '🖋️',
            disabled: true,
            keywords: ['caption', 'subtitle'],
        }),
        createMenuItem({
            key: 'video-overlay',
            label: 'Add Overlay / Logo / Watermark',
            icon: '🎥',
            disabled: true,
            keywords: ['overlay'],
        }),
        createMenuItem({
            key: 'video-grade',
            label: 'Color Grade',
            icon: '🔦',
            disabled: true,
            keywords: ['color', 'grade'],
        }),
        createMenuItem({
            key: 'video-tracking',
            label: 'Add Motion Tracking',
            icon: '🧍‍♂️',
            disabled: true,
            keywords: ['tracking'],
        }),
        createMenuItem({
            key: 'video-stabilize',
            label: 'Stabilize Video',
            icon: '🧱',
            disabled: true,
            keywords: ['stabilize'],
        }),
        createMenuItem({
            key: 'video-enhance',
            label: 'Enhance Quality (Upscale 4K)',
            icon: '💡',
            disabled: true,
            keywords: ['enhance', 'upscale'],
        }),
    ];

    const imageItems = [
        createMenuItem({
            key: 'image-crop',
            label: 'Crop / Resize / Rotate / Flip',
            icon: '🔍',
            disabled: true,
            keywords: ['crop', 'resize', 'rotate'],
        }),
        createMenuItem({
            key: 'image-ai-enhance',
            label: 'AI Enhance / Auto Retouch',
            icon: '🧠',
            disabled: true,
            keywords: ['ai', 'enhance'],
        }),
        createMenuItem({
            key: 'image-remove-bg',
            label: 'Remove / Replace Background',
            icon: '✂️',
            disabled: true,
            keywords: ['background'],
        }),
        createMenuItem({
            key: 'image-magic-eraser',
            label: 'Magic Eraser / Object Remover',
            icon: '🪄',
            disabled: true,
            keywords: ['eraser'],
        }),
        createMenuItem({
            key: 'image-filter',
            label: 'Apply Filter / Preset / LUT',
            icon: '🎨',
            disabled: true,
            keywords: ['filter'],
        }),
        createMenuItem({
            key: 'image-adjust',
            label: 'Adjust Colors / Tone / Brightness / Contrast',
            icon: '🌈',
            disabled: true,
            keywords: ['adjust'],
        }),
        createMenuItem({
            key: 'image-add-text',
            label: 'Add Text / Sticker / Frame',
            icon: '🧩',
            disabled: true,
            keywords: ['text', 'sticker'],
        }),
        createMenuItem({
            key: 'image-restore',
            label: 'AI Restore Old Photo',
            icon: '🧠',
            disabled: true,
            keywords: ['restore'],
        }),
        createMenuItem({
            key: 'image-beautify',
            label: 'Beautify Face / Skin Smooth',
            icon: '🧑‍🎨',
            disabled: true,
            keywords: ['beautify'],
        }),
        createMenuItem({
            key: 'image-mirror',
            label: 'Mirror / Warp / Perspective',
            icon: '🪞',
            disabled: true,
            keywords: ['mirror', 'warp'],
        }),
        createMenuItem({
            key: 'image-clone',
            label: 'Clone / Heal / Patch',
            icon: '🧰',
            disabled: true,
            keywords: ['clone'],
        }),
        createMenuItem({
            key: 'image-border',
            label: 'Add Border / Shadow / Glow',
            icon: '🧱',
            disabled: true,
            keywords: ['border', 'shadow'],
        }),
        createMenuItem({
            key: 'image-web-export',
            label: 'Quick Export Web Optimized',
            icon: '📷',
            disabled: true,
            keywords: ['export', 'web'],
        }),
    ];

    const aiStudioItems = [
        createMenuItem({
            key: 'ai-edit-prompt',
            label: 'Edit Prompt / Regenerate',
            icon: '✏️',
            disabled: true,
            keywords: ['prompt', 'regenerate'],
        }),
        createMenuItem({
            key: 'ai-refine',
            label: 'Refine Result',
            icon: '🧠',
            disabled: true,
            keywords: ['refine'],
        }),
        createMenuItem({
            key: 'ai-enhance',
            label: 'Enhance / Upscale / Improve Lighting',
            icon: '🖼️',
            disabled: true,
            keywords: ['enhance', 'upscale'],
        }),
        createMenuItem({
            key: 'ai-generate-voice',
            label: 'Generate Voice from Text',
            icon: '🎙️',
            disabled: true,
            keywords: ['voice'],
        }),
        createMenuItem({
            key: 'ai-translate',
            label: 'Translate / Summarize / Rewrite',
            icon: '🗣️',
            disabled: true,
            keywords: ['translate', 'summarize'],
        }),
        createMenuItem({
            key: 'ai-generate-character',
            label: 'Generate Character / Pose',
            icon: '🧍‍♂️',
            disabled: true,
            keywords: ['character'],
        }),
        createMenuItem({
            key: 'ai-product-mockup',
            label: 'Generate Product Mockup',
            icon: '🧥',
            disabled: true,
            keywords: ['mockup'],
        }),
        createMenuItem({
            key: 'ai-presentation',
            label: 'Create Presentation / Slideshow',
            icon: '📄',
            disabled: true,
            keywords: ['presentation'],
        }),
        createMenuItem({
            key: 'ai-script',
            label: 'Generate Script or Story',
            icon: '📜',
            disabled: true,
            keywords: ['script'],
        }),
        createMenuItem({
            key: 'ai-voiceover',
            label: 'Add Voiceover / Narration',
            icon: '🎧',
            disabled: true,
            keywords: ['voiceover'],
        }),
        createMenuItem({
            key: 'ai-mix',
            label: 'AI Mix: Combine Image + Text + Voice',
            icon: '🪄',
            disabled: true,
            keywords: ['mix'],
        }),
        createMenuItem({
            key: 'ai-send',
            label: 'Send to Canvas / Export to Mode',
            icon: '🧩',
            disabled: true,
            keywords: ['send', 'export'],
        }),
        createMenuItem({
            key: 'ai-history',
            label: 'History → Compare Generations',
            icon: '🧰',
            disabled: true,
            keywords: ['history', 'compare'],
        }),
        createMenuItem({
            key: 'ai-save',
            label: 'Save to Asset Library',
            icon: '📦',
            disabled: true,
            keywords: ['save', 'asset'],
        }),
        createMenuItem({
            key: 'ai-style',
            label: 'Customize AI Style',
            icon: '⚙️',
            disabled: true,
            keywords: ['style', 'ai'],
        }),
    ];

    const environmentItems = [
        createMenuItem({
            key: 'env-canvas-color',
            label: 'Change Canvas Color / Background',
            icon: '🌍',
            disabled: true,
            keywords: ['canvas', 'background'],
        }),
        createMenuItem({
            key: 'env-zoom-in',
            label: 'Zoom In',
            icon: '🔍',
            action: () => setScale((value) => value * 1.1),
            keywords: ['zoom in'],
        }),
        createMenuItem({
            key: 'env-zoom-out',
            label: 'Zoom Out',
            icon: '🔎',
            action: () => setScale((value) => value / 1.1),
            keywords: ['zoom out'],
        }),
        createMenuItem({
            key: 'env-fit',
            label: 'Fit to Screen',
            icon: '🎚️',
            action: () => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
            },
            keywords: ['fit', 'screen'],
        }),
        createMenuItem({
            key: 'env-toggle-grid',
            label: 'Toggle Grid / Snap / Rulers',
            icon: '🔄',
            action: () => toggleGrid(),
            keywords: ['grid', 'snap'],
        }),
        createMenuItem({
            key: 'env-timeline',
            label: 'Toggle Timeline / Layers Panel',
            icon: '🎞️',
            action: () => setActiveToolOverlay('layers'),
            keywords: ['timeline', 'layers'],
        }),
        createMenuItem({
            key: 'env-ai-assistant',
            label: 'Show / Hide AI Assistant',
            icon: '🧩',
            disabled: true,
            keywords: ['ai', 'assistant'],
        }),
        createMenuItem({
            key: 'env-presentation',
            label: 'Switch to Presentation Mode',
            icon: '🕹️',
            disabled: true,
            keywords: ['presentation'],
        }),
        createMenuItem({
            key: 'env-record',
            label: 'Record Screen / Export as Video',
            icon: '🎥',
            disabled: true,
            keywords: ['record'],
        }),
        createMenuItem({
            key: 'env-save-project',
            label: 'Save Project / Version History',
            icon: '💾',
            disabled: true,
            keywords: ['save'],
        }),
        createMenuItem({
            key: 'env-ask-ai',
            label: 'Ask AI for Help',
            icon: '🧠',
            disabled: true,
            keywords: ['help', 'ai'],
        }),
        createMenuItem({
            key: 'env-mode-graphics',
            label: 'Switch to Graphics Mode',
            icon: '🎨',
            action: () =>
                sendModeIntent('graphics', {
                    source: 'user',
                    badge: 'Mode Jump',
                    message: 'Loading vector tools & layout guides…',
                }),
            keywords: ['switch', 'graphics'],
        }),
        createMenuItem({
            key: 'env-mode-video',
            label: 'Switch to Video Mode',
            icon: '🎬',
            action: () =>
                sendModeIntent('video', {
                    source: 'ai',
                    message: 'Syncing timeline layers for motion & audio…',
                }),
            keywords: ['switch', 'video'],
        }),
        createMenuItem({
            key: 'env-mode-ai',
            label: 'Switch to AI Studio',
            icon: '🤖',
            action: () =>
                sendModeIntent('ai-studio', {
                    source: 'ai',
                    message: 'Opening AI workbench for prompts & generators…',
                }),
            keywords: ['switch', 'ai studio'],
        }),
        createMenuItem({
            key: 'env-mode-ux',
            label: 'Switch to UI/UX Mode',
            icon: '💻',
            action: () =>
                sendModeIntent('ux', {
                    source: 'user',
                    badge: 'Prototype',
                    message: 'Preparing frames, flows, and code preview…',
                }),
            keywords: ['switch', 'ui'],
        }),
    ];

    const sections = (() => {
        const builtSections = [];

        if (universalItems.length) {
            builtSections.push({
                key: 'universal',
                title: 'Universal Tools',
                items: universalItems,
            });
        }

        if (mode === 'graphics' || mode === 'design') {
            builtSections.push({
                key: 'graphics',
                title: 'Graphic Design Tools',
                items: graphicItems,
            });
        }
        if (mode === 'ux') {
            builtSections.push({
                key: 'ux',
                title: 'UI/UX Tools',
                items: uxItems,
            });
        }
        if (mode === 'cartoon') {
            builtSections.push({
                key: 'animation',
                title: 'Animation & Cartoon Tools',
                items: animationItems,
            });
        }
        if (mode === 'podcast') {
            builtSections.push({
                key: 'podcast',
                title: 'Podcast Tools',
                items: podcastItems,
            });
        }
        if (mode === 'video') {
            builtSections.push({
                key: 'video',
                title: 'Video Editing Tools',
                items: videoItems,
            });
            if (activeType === 'timeline-asset' && timelineAssetId) {
                builtSections.push({
                    key: 'timeline-asset',
                    title: 'Timeline Clip',
                    items: [
                        createMenuItem({
                            key: 'timeline-remove',
                            label: timelineAssetLabel ? `Remove "${timelineAssetLabel}"` : 'Remove Clip',
                            icon: '🗑️',
                            danger: true,
                            action: () =>
                                removeTimelineAsset(timelineAssetId, {
                                    historyLabel: timelineAssetLabel
                                        ? `Timeline: Remove "${timelineAssetLabel}"`
                                        : undefined,
                                    source: 'timeline',
                                }),
                            keywords: ['timeline', 'remove', 'clip'],
                        }),
                    ],
                });
            }
        }
        if (mode === 'ai-studio') {
            builtSections.push({
                key: 'ai-studio',
                title: 'AI Studio Tools',
                items: aiStudioItems,
            });
        }
        if (mode === 'image') {
            builtSections.push({
                key: 'image',
                title: 'Image Editing Tools',
                items: imageItems,
            });
        }

        builtSections.push({
            key: 'environment',
            title: 'Environment & Workflow',
            items: environmentItems,
        });

        return builtSections;
    })();

    const filteredSections = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sections;
        return sections
            .map((section) => {
                const items = section.items.filter((item) => {
                    const haystack = [
                        item.label,
                        ...(item.keywords ?? []),
                    ]
                        .join(' ')
                        .toLowerCase();
                    return haystack.includes(q);
                });
                return { ...section, items };
            })
            .filter((section) => section.items.length > 0);
    }, [sections, query]);

    const sectionsToRender =
        filteredSections.length > 0
            ? filteredSections
            : [
                  {
                      key: 'no-results',
                      title: 'No matches',
                      items: [],
                  },
              ];

    const shouldRender = Boolean(contextMenu && menuPosition);

    if (!shouldRender) {
        return null;
    }

    return (
        <div
            data-canvas-context-menu
            className='fixed z-50 min-w-[240px] rounded-xl border shadow-2xl backdrop-blur'
            style={{ top: menuPosition.top, left: menuPosition.left, background: 'var(--mode-panel-bg)', borderColor: 'var(--mode-border)', color: 'var(--mode-text)' }}
        >
            <div className='border-b p-2' style={{ borderColor: 'var(--mode-border)', color: 'var(--mode-text)' }}>
                <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--mode-text-muted)]'>
                        🔍
                    </span>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder='Type a command…'
                        className='w-full rounded-lg border py-2 pl-8 pr-3 text-sm focus:outline-none'
                        style={{
                            borderColor: 'var(--mode-border)',
                            background: 'var(--mode-sidebar-bg)',
                            color: 'var(--mode-text)',
                        }}
                    />
                </div>
            </div>
            <div className='max-h-[420px] overflow-y-auto p-2'>
                {sectionsToRender.map((section) => (
                    <div key={section.key} className='py-2'>
                        {section.items.length > 0 ? (
                            <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--mode-text-muted)]'>
                                {section.title}
                            </p>
                        ) : (
                            <p className='px-2 text-sm text-[color:var(--mode-text-muted)]'>{section.title}</p>
                        )}
                        {section.items.map((item) => {
                            const isDisabled = item.disabled;
                            return (
                                <button
                                    key={item.key}
                                    type='button'
                                    onClick={
                                        isDisabled
                                            ? undefined
                                            : () => handleAction(item.action)
                                    }
                                    className={clsx(
                                        'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                        isDisabled
                                            ? 'cursor-not-allowed text-[color:var(--mode-text-muted)] opacity-60'
                                            : item.danger
                                                ? 'text-[rgba(248,113,113,0.85)] hover:bg-[rgba(248,113,113,0.15)]'
                                                : 'text-[var(--mode-text)] hover:bg-[var(--mode-accent-soft)]',
                                    )}
                                >
                                    <div className='flex items-center gap-2'>
                                        {item.icon ? <span>{item.icon}</span> : null}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.description ? (
                                        <span className='text-[10px] uppercase tracking-[0.2em] text-[color:var(--mode-text-muted)] group-hover:text-[color:var(--mode-text)]'>
                                            {item.description}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
