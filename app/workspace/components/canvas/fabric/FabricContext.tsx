'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Canvas } from 'fabric';

type FabricContextValue = {
    canvas: Canvas | null;
    setCanvas: (canvas: Canvas | null) => void;
    isReady: boolean;
};

const FabricContext = createContext<FabricContextValue>({
    canvas: null,
    setCanvas: () => {},
    isReady: false,
});

export function FabricProvider({ children }: { children: React.ReactNode }) {
    const canvasRef = useRef<Canvas | null>(null);
    const [, setTick] = useState(0);

    const value = useMemo<FabricContextValue>(
        () => ({
            canvas: canvasRef.current,
            setCanvas: (instance) => {
                canvasRef.current = instance;
                setTick((prev) => prev + 1);
            },
            isReady: Boolean(canvasRef.current),
        }),
        [],
    );

    useEffect(() => {
        return () => {
            if (canvasRef.current) {
                canvasRef.current.dispose();
                canvasRef.current = null;
            }
        };
    }, []);

    return <FabricContext.Provider value={value}>{children}</FabricContext.Provider>;
}

export function useFabricInstance() {
    return useContext(FabricContext);
}
