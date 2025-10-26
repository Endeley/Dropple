'use client';

import { useMemo, useState } from 'react';
import { useCanvasStore } from '../../context/CanvasStore';

export default function CommentToolOverlay() {
    const [draft, setDraft] = useState('');
    const selectedFrameId = useCanvasStore((state) => state.selectedFrameId);
    const selectedElementId = useCanvasStore((state) => state.selectedElementId);
    const frames = useCanvasStore((state) => state.frames);
    const comments = useCanvasStore((state) => state.comments);
    const addComment = useCanvasStore((state) => state.addComment);
    const removeComment = useCanvasStore((state) => state.removeComment);
    const setActiveToolOverlay = useCanvasStore((state) => state.setActiveToolOverlay);

    const activeFrame = useMemo(
        () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
        [frames, selectedFrameId],
    );

    const targetComments = useMemo(() => {
        if (!selectedFrameId) return [];
        return comments
            .filter((comment) => comment.frameId === selectedFrameId && comment.elementId === (selectedElementId ?? null))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [comments, selectedFrameId, selectedElementId]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!draft.trim() || !selectedFrameId) return;
        addComment({ frameId: selectedFrameId, elementId: selectedElementId ?? null, text: draft.trim() });
        setDraft('');
    };

    const targetLabel = selectedElementId ? 'Selected element' : 'Frame';

    return (
        <div className='rounded-2xl border border-[rgba(148,163,184,0.25)] bg-[rgba(15,23,42,0.92)] p-4 text-sm text-[rgba(226,232,240,0.82)] shadow-2xl backdrop-blur-lg'>
            <header className='mb-3 flex items-center justify-between'>
                <div>
                    <p className='text-sm font-semibold text-white'>Comments</p>
                    <p className='text-xs text-[rgba(148,163,184,0.7)]'>
                        Leave notes for collaborators on the {targetLabel.toLowerCase()}.
                    </p>
                </div>
                <button
                    type='button'
                    onClick={() => setActiveToolOverlay(null)}
                    className='rounded-lg border border-[rgba(148,163,184,0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[rgba(226,232,240,0.7)] transition-colors hover:border-[rgba(226,232,240,0.7)] hover:text-white'
                >
                    Close
                </button>
            </header>

            {!activeFrame ? (
                <p className='text-xs text-[rgba(148,163,184,0.7)]'>Select a frame or element to attach comments.</p>
            ) : (
                <form onSubmit={handleSubmit} className='space-y-2'>
                    <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={`Comment on ${targetLabel.toLowerCase()}…`}
                        className='h-20 w-full resize-none rounded-xl border border-[rgba(148,163,184,0.25)] bg-[rgba(30,41,59,0.7)] px-3 py-2 text-sm text-[rgba(236,233,254,0.9)] placeholder:text-[rgba(148,163,184,0.6)] focus:border-[rgba(139,92,246,0.6)] focus:outline-none'
                    />
                    <div className='flex items-center justify-end'>
                        <button
                            type='submit'
                            disabled={!draft.trim()}
                            className={`rounded-lg border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                                draft.trim()
                                    ? 'border-[rgba(139,92,246,0.55)] text-white hover:border-[rgba(236,233,254,0.85)]'
                                    : 'cursor-not-allowed border-[rgba(148,163,184,0.25)] text-[rgba(148,163,184,0.5)]'
                            }`}
                        >
                            Add comment
                        </button>
                    </div>
                </form>
            )}

            <div className='mt-4 space-y-2'>
                {targetComments.map((comment) => (
                    <div key={comment.id} className='rounded-xl border border-[rgba(148,163,184,0.2)] bg-[rgba(30,41,59,0.65)] p-3'>
                        <p className='text-sm text-[rgba(236,233,254,0.92)]'>{comment.text}</p>
                        <div className='mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.55)]'>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                            <button
                                type='button'
                                onClick={() => removeComment(comment.id)}
                                className='text-[rgba(248,113,113,0.75)] hover:text-[rgba(252,165,165,0.95)]'
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                {targetComments.length === 0 && activeFrame ? (
                    <p className='text-[11px] uppercase tracking-[0.25em] text-[rgba(148,163,184,0.6)]'>
                        No comments on this {targetLabel.toLowerCase()} yet.
                    </p>
                ) : null}
            </div>
        </div>
    );
}
