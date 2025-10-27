export type CanvasHistorySnapshot = {
    id: string;
    label?: string;
    timestamp: number;
    payload: {
        frames: any;
        selection: {
            frameId: string | null;
            elementIds: string[];
        };
    };
};

export type CanvasHistoryEntry = {
    id: string;
    snapshot: CanvasHistorySnapshot;
    source: 'user' | 'system';
};

export type CanvasHistoryState = {
    past: CanvasHistoryEntry[];
    present: CanvasHistoryEntry | null;
    future: CanvasHistoryEntry[];
};
