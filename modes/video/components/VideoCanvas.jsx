"use client";

import CanvasHost from "@/components/canvas/CanvasHost";
import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";
import { useSelectionStore } from "@/zustand/selectionStore";

export default function VideoCanvas() {
  const videoRef = useRef(null);
  const playing = useTimelineStore((s) => s.playing);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const setTime = useTimelineStore((s) => s.setTime);
  const tracks = useTimelineStore((s) => s.tracks);
  const duration = useTimelineStore((s) => s.duration);
  const selectedIds = useSelectionStore((s) => s.selectedIds);

  const activeVideoClip =
    tracks
      ?.find((t) => t.type === "video" && t.clips?.length)
      ?.clips?.slice()
      .sort((a, b) => (a.start || 0) - (b.start || 0))[0] || null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handler = () => setTime(el.currentTime * 1000);
    el.addEventListener("timeupdate", handler);
    return () => el.removeEventListener("timeupdate", handler);
  }, [setTime]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const targetSeconds = currentTime / 1000;
    if (Math.abs(el.currentTime - targetSeconds) > 0.03) {
      el.currentTime = targetSeconds;
    }
  }, [currentTime]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeVideoClip?.src) return;
    if (el.src !== activeVideoClip.src) {
      el.src = activeVideoClip.src;
      el.load();
    }
  }, [activeVideoClip?.src]);

  const handleScrub = (e) => {
    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left;
    const ratio = Math.min(1, Math.max(0, x / container.width));
    setTime(ratio * duration);
  };

  return (
    <CanvasHost>
      <div
        className="flex items-center justify-center w-full h-full"
        onMouseDown={handleScrub}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleScrub(e);
        }}
      >
        <div
          className={`relative bg-black shadow-2xl rounded-lg overflow-hidden ${
            selectedIds?.length ? "ring-2 ring-blue-400/60" : ""
          }`}
          style={{ width: "70%", aspectRatio: "16 / 9" }}
        >
          <video
            id="dropple-video-preview"
            className="absolute inset-0 w-full h-full object-cover"
            ref={videoRef}
            controls={false}
          />
        </div>
      </div>
    </CanvasHost>
  );
}
