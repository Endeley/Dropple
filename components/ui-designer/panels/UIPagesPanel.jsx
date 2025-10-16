'use client';

import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import PageCard from './parts/PageCard';

function humanize(name) {
    if (typeof name === 'string' && name.trim().length) return name;
    return 'Untitled';
}

export default function UIPagesPanel({
    screens = [],
    activeScreenId,
    onSelectScreen,
    onAddScreen,
    onDuplicateScreen,
    onDeleteScreen,
    onRenameScreen,
    templates = [],
    devices = [],
}) {
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const menuRef = useRef(null);
    const handleRename = useCallback(
        (screen) => {
            const next = window.prompt('Rename page', humanize(screen.name));
            if (next && next.trim().length) {
                onRenameScreen?.(screen.id, next.trim());
            }
        },
        [onRenameScreen]
    );

    const availableTemplates = useMemo(() => {
        if (Array.isArray(templates) && templates.length) {
            return templates.filter((template) => template?.addVisible !== false);
        }
        return [];
    }, [templates]);

    const deviceOptions = useMemo(() => {
        if (Array.isArray(devices) && devices.length) {
            return devices;
        }
        return [
            { id: 'desktop', label: 'Desktop', width: 1440, height: 900 },
            { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
            { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
        ];
    }, [devices]);

    const [selectedDeviceId, setSelectedDeviceId] = useState(deviceOptions[0]?.id ?? 'desktop');
    const [customWidth, setCustomWidth] = useState(deviceOptions[0]?.width ?? 1280);
    const [customHeight, setCustomHeight] = useState(deviceOptions[0]?.height ?? 900);

    useEffect(() => {
        if (!deviceOptions.length) return;
        if (!deviceOptions.some((preset) => preset.id === selectedDeviceId) && selectedDeviceId !== 'custom') {
            setSelectedDeviceId(deviceOptions[0].id);
            setCustomWidth(deviceOptions[0].width ?? 1280);
            setCustomHeight(deviceOptions[0].height ?? 900);
        }
    }, [deviceOptions, selectedDeviceId]);

    const resolveSelectedDevice = useCallback(() => {
        if (selectedDeviceId === 'custom') {
            const width = Math.max(240, Number(customWidth) || 1280);
            const height = Math.max(320, Number(customHeight) || 900);
            return {
                id: 'custom',
                label: `Custom ${width}×${height}`,
                width,
                height,
            };
        }
        const preset = deviceOptions.find((option) => option.id === selectedDeviceId);
        if (preset) {
            return preset;
        }
        return {
            id: 'custom',
            label: `Custom ${customWidth}×${customHeight}`,
            width: Math.max(240, Number(customWidth) || 1280),
            height: Math.max(320, Number(customHeight) || 900),
        };
    }, [selectedDeviceId, deviceOptions, customWidth, customHeight]);

    const handleTemplateSelect = useCallback(
        (template) => {
            if (!onAddScreen) return;
            const device = resolveSelectedDevice();
            const { id: templateId, ...rest } = template ?? {};
            onAddScreen({
                ...rest,
                templateId: templateId ?? template?.slug ?? template?.kind,
                id: undefined,
                device,
            });
            setShowTemplateMenu(false);
        },
        [onAddScreen, resolveSelectedDevice]
    );

    useEffect(() => {
        if (!showTemplateMenu) return;
        const handleClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowTemplateMenu(false);
            }
        };
        document.addEventListener('pointerdown', handleClick);
        return () => document.removeEventListener('pointerdown', handleClick);
    }, [showTemplateMenu]);

    return (
        <section className="mb-4 rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                <span>Pages</span>
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setShowTemplateMenu((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                    {showTemplateMenu ? (
                        <div className="absolute right-0 z-10 mt-2 w-60 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
                            <div className="mb-3">
                                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Device
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {deviceOptions.map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setSelectedDeviceId(preset.id)}
                                            className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition ${
                                                selectedDeviceId === preset.id
                                                    ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                                    : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                            }`}
                                        >
                                            {preset.label ?? humanize(preset.id)}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDeviceId('custom')}
                                        className={`rounded-full border px-2 py-1 text-[11px] font-semibold transition ${
                                            selectedDeviceId === 'custom'
                                                ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                                                : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                    >
                                        Custom
                                    </button>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
                                        Width
                                        <input
                                            type="number"
                                            value={customWidth}
                                            min={240}
                                            onChange={(event) => {
                                                setSelectedDeviceId('custom');
                                                setCustomWidth(Number(event.target.value) || 0);
                                            }}
                                            className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500">
                                        Height
                                        <input
                                            type="number"
                                            value={customHeight}
                                            min={320}
                                            onChange={(event) => {
                                                setSelectedDeviceId('custom');
                                                setCustomHeight(Number(event.target.value) || 0);
                                            }}
                                            className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                        />
                                    </label>
                                </div>
                            </div>
                            {availableTemplates.map((template) => (
                                <button
                                    key={template.id ?? template.kind}
                                    type="button"
                                    onClick={() => handleTemplateSelect(template)}
                                    className="mb-1 w-full rounded-md px-2 py-1 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 last:mb-0"
                                >
                                    <div className="font-semibold">{template.label ?? template.title ?? 'New Page'}</div>
                                    {template.description ? (
                                        <div className="text-[10px] text-slate-400">{template.description}</div>
                                    ) : null}
                                </button>
                            ))}
                            {availableTemplates.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => handleTemplateSelect({ kind: 'blank', label: 'Blank Page' })}
                                    className="w-full rounded-md px-2 py-1 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                    Blank Page
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="space-y-2">
                {screens.map((screen) => (
                    <PageCard
                        key={screen.id}
                        screen={screen}
                        isActive={screen.id === activeScreenId}
                        onSelect={onSelectScreen}
                        onRename={handleRename}
                        onDuplicate={onDuplicateScreen}
                        onDelete={onDeleteScreen}
                    />
                ))}
                {!screens.length ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                        No pages yet. Create one to get started.
                    </div>
                ) : null}
            </div>
        </section>
    );
}
