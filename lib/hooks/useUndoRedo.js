import { useState } from 'react';

export function useUndoRedo() {
    const [history, setHistory] = useState([]);
    const [index, setIndex] = useState(-1);

    const push = (state) => {
        const trimmed = history.slice(0, index + 1);
        const next = [...trimmed, state];
        setHistory(next);
        setIndex(next.length - 1);
    };

    const undo = () => {
        if (index <= 0) return undefined;
        const nextIndex = index - 1;
        setIndex(nextIndex);
        return history[nextIndex];
    };

    const redo = () => {
        if (index >= history.length - 1) return undefined;
        const nextIndex = index + 1;
        setIndex(nextIndex);
        return history[nextIndex];
    };

    return { push, undo, redo };
}
