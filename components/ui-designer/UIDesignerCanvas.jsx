'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';
import { useEditorStore } from '@/lib/stores/editorStore';

const GRID_SIZE = 40;
const MIN_SCALE = 0.2;
const MAX_SCALE = 6;
const ZOOM_FACTOR = 1.08;

export default function UIDesignerCanvas({ screen, showGrid, zoom, onZoomChange, onLayerChange, onLayerRemove }) {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const containerRef = useRef(null);
    const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
    const [stageScale, setStageScale] = useState(zoom ?? 1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [spacePressed, setSpacePressed] = useState(false);

    const updateLayer = useEditorStore((state) => state.updateLayer);
    const setSelectedIds = useEditorStore((state) => state.setSelectedIds);
    const selectedIds = useEditorStore((state) => state.selectedIds);

    const layers = screen?.layers ?? [];

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry?.contentRect) {
                setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                setSpacePressed(true);
            }
        };
        const handleKeyUp = (event) => {
            if (event.code === 'Space') {
                setSpacePressed(false);
                setIsPanning(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const transformer = transformerRef.current;
        const stage = stageRef.current;
        if (!transformer || !stage) return;
        if (selectedIds.length === 1) {
            const node = stage.findOne(`#${selectedIds[0]}`);
            if (node) {
                transformer.nodes([node]);
                transformer.getLayer()?.batchDraw();
                return;
            }
        }
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
    }, [selectedIds, layers]);

    const handleWheel = useCallback(
        (event) => {
            event.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;

            const oldScale = stageScale;
            const pointer = stage.getPointerPosition();
            if (!pointer) return;

            const mousePointTo = {
                x: (pointer.x - stagePosition.x) / oldScale,
                y: (pointer.y - stagePosition.y) / oldScale,
            };

            const direction = event.evt.deltaY > 0 ? -1 : 1;
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, direction > 0 ? oldScale * ZOOM_FACTOR : oldScale / ZOOM_FACTOR));

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };

            setStageScale(newScale);
            setStagePosition(newPos);
            onZoomChange?.(newScale);
        },
        [stageScale, stagePosition, onZoomChange]
    );

    const handleStagePointerDown = useCallback(
        (event) => {
            const stage = stageRef.current;
            if (!stage) return;
            const isStage = event.target === stage;
            if (spacePressed && isStage) {
                setIsPanning(true);
                stage.startDrag();
                return;
            }
            if (isStage) {
                setSelectedIds([]);
            }
        },
        [spacePressed, setSelectedIds]
    );

    const handleStagePointerUp = useCallback(() => {
        const stage = stageRef.current;
        if (stage && isPanning) {
            stage.stopDrag();
            setStagePosition({ x: stage.x(), y: stage.y() });
        }
        setIsPanning(false);
    }, [isPanning]);
    useEffect(() => {
        if (typeof zoom !== 'number') return;
        if (Math.abs(zoom - stageScale) < 0.001) return;
        setStageScale(zoom);
    }, [zoom, stageScale]);

    const handleShapeDragEnd = useCallback(
        (layer) => (event) => {
            const node = event.target;
            const x = Math.round(node.x());
            const y = Math.round(node.y());
            updateLayer(layer.id, { x, y });
            onLayerChange?.({ ...layer, x, y, frame: { ...(layer.frame ?? {}), x, y } });
        },
        [updateLayer, onLayerChange]
    );

    const handleShapeTransformEnd = useCallback(
        (layer) => (event) => {
            const node = event.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const width = Math.round((node.width() ?? 0) * scaleX);
            const height = Math.round((node.height() ?? 0) * scaleY);
            const x = Math.round(node.x());
            const y = Math.round(node.y());
            node.scaleX(1);
            node.scaleY(1);
            updateLayer(layer.id, {
                x,
                y,
                width,
                height,
            });
            onLayerChange?.({
                ...layer,
                x,
                y,
                width,
                height,
                frame: { ...(layer.frame ?? {}), x, y, width, height },
            });
        },
        [updateLayer, onLayerChange]
    );

    const backgroundStyle = useMemo(() => {
        if (!showGrid) return {};
        const size = GRID_SIZE * stageScale;
        return {
            backgroundSize: `${size}px ${size}px`,
            backgroundImage:
                'linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
        };
    }, [showGrid, stageScale]);

    if (!screen) {
        return <div ref={containerRef} className="relative flex min-h-full items-start justify-center p-10" />;
    }

    return (
        <div ref={containerRef} className="relative flex min-h-full items-start justify-center p-10" style={backgroundStyle}>
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePosition.x}
                y={stagePosition.y}
                draggable={isPanning}
                onWheel={handleWheel}
                onMouseDown={handleStagePointerDown}
                onTouchStart={handleStagePointerDown}
                onMouseUp={handleStagePointerUp}
                onTouchEnd={handleStagePointerUp}
            >
                <Layer>
                    {layers.map((layer) => {
                        if (layer.visible === false) return null;
                        const isSelected = selectedIds.includes(layer.id);
                        const commonProps = {
                            id: layer.id,
                            key: layer.id,
                            x: layer.x ?? layer.frame?.x ?? 0,
                            y: layer.y ?? layer.frame?.y ?? 0,
                            width: layer.width ?? layer.frame?.width ?? 120,
                            height: layer.height ?? layer.frame?.height ?? 120,
                            draggable: true,
                            onClick: () => setSelectedIds([layer.id]),
                            onTap: () => setSelectedIds([layer.id]),
                            onDragEnd: handleShapeDragEnd(layer),
                            onTransformEnd: handleShapeTransformEnd(layer),
                        };

                        if (layer.type === 'text') {
                            return (
                                <Text
                                    {...commonProps}
                                    text={layer.text ?? 'Text'}
                                    fontSize={layer.fontSize ?? 24}
                                    fill={layer.color ?? '#0f172a'}
                                    align="left"
                                />
                            );
                        }

                        return (
                            <Rect
                                {...commonProps}
                                fill={layer.fill ?? '#93c5fd'}
                                cornerRadius={layer.cornerRadius ?? 16}
                                shadowForStrokeEnabled={false}
                                strokeScaleEnabled={false}
                                listening
                            />
                        );
                    })}
                    <Transformer
                        ref={transformerRef}
                        rotateEnabled
                        enabledAnchors={[ 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center' ]}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 20 || newBox.height < 20) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>
        </div>
    );
}
