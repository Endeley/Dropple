'use client';

import { Upload, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';

export default function AssetUploader({ assets, onUploadAssets, onInsertAsset }) {
    const fileInputRef = useRef(null);

    const handleBrowse = () => fileInputRef.current?.click();
    const handleChange = (event) => {
        const files = event.target.files;
        if (files?.length) onUploadAssets?.(files);
        event.target.value = '';
    };

    return (
        <div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <ImageIcon className="h-4 w-4" /> Assets
            </div>
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <button
                    type="button"
                    onClick={handleBrowse}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                >
                    <Upload className="h-4 w-4" /> Upload
                </button>
                <span className="hidden text-[11px] lg:inline">Click an asset to insert or replace an image block.</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {assets.length ? (
                    assets.map((asset) => (
                        <button
                            type="button"
                            key={asset.id}
                            onClick={() => onInsertAsset?.(asset)}
                            className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-sm"
                        >
                            <img src={asset.src} alt={asset.name ?? 'Asset'} className="h-full w-full object-cover" draggable={false} />
                            <div className="absolute inset-x-1 bottom-1 rounded-md bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600 opacity-0 transition group-hover:opacity-100">
                                {asset.name ?? 'Asset'}
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="col-span-2 rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                        Upload images to start building your asset library.
                    </div>
                )}
            </div>
        </div>
    );
}
