"use client";

import CanvasHost from "@/components/canvas/CanvasHost";
import { useEffect, useMemo, useRef } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function PodcastCanvas() {
  const audioRef = useRef(null);
  const tracks = useTimelineStore((s) => s.tracks);
  const playing = useTimelineStore((s) => s.playing);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const setTime = useTimelineStore((s) => s.setTime);
  const duration = useTimelineStore((s) => s.duration);
  const selectedIds = useSelectionStore((s) => s.selectedIds);

  const firstAudioClip = tracks
    ?.find((t) => t.type === "audio" && t.clips?.length)
    ?.clips?.[0];

  const bars = useMemo(() => {
    if (!firstAudioClip?.waveform?.length) return null;
    return firstAudioClip.waveform;
  }, [firstAudioClip?.waveform]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !firstAudioClip?.src) return;
    if (el.src !== firstAudioClip.src) {
      el.src = firstAudioClip.src;
      el.load();
    }
  }, [firstAudioClip?.src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const handler = () => setTime(el.currentTime * 1000);
    el.addEventListener("timeupdate", handler);
    return () => el.removeEventListener("timeupdate", handler);
  }, [setTime]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const targetSeconds = currentTime / 1000;
    if (Math.abs(el.currentTime - targetSeconds) > 0.02) {
      el.currentTime = targetSeconds;
    }
  }, [currentTime]);

  const handleScrub = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const ratio = Math.min(1, Math.max(0, x / box.width));
    setTime(ratio * duration);
  };

  return (
    <CanvasHost>
      <div
        className="w-full h-full flex items-center justify-center p-6"
        onMouseDown={handleScrub}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleScrub(e);
        }}
      >
        <div
          className={`w-full h-40 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 border border-neutral-700 select-none overflow-hidden relative ${
            selectedIds?.length ? "ring-2 ring-blue-400/60" : ""
          }`}
        >
          {bars ? (
            <div className="absolute inset-0 flex items-end gap-[2px] px-2">
              {bars.map((v, i) => (
                <div
                  key={i}
                  className="bg-blue-400/70 flex-1"
                  style={{
                    height: `${Math.min(1, Math.max(0, v)) * 100}%`,
                    minWidth: `${Math.max(1, 100 / Math.max(bars.length, 1))}%`,
                  }}
                />
              ))}
            </div>
          ) : (
            "Waveform Preview Area"
          )}
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </CanvasHost>
  );
}
