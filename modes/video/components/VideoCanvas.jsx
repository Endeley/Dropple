"use client";

import CanvasHost from "@/components/canvas/CanvasHost";
import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/zustand/useTimelineStore";

export default function VideoCanvas() {
  const videoRef = useRef(null);
  const playing = useTimelineStore((s) => s.playing);
  const currentTime = useTimelineStore((s) => s.currentTime);
  const setTime = useTimelineStore((s) => s.setTime);

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

  return (
    <CanvasHost>
      <div className="flex items-center justify-center w-full h-full">
        <div
          className="relative bg-black shadow-2xl rounded-lg overflow-hidden"
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
