"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "runtime/stores/react/shallow";
import { useTimelineStore } from "./useTimelineStore";
import { useComponentRegistry } from "./useComponentRegistry";
import { useSceneGraph } from "./useSceneGraph";
import { interpolateKeyframes } from "@/utils/timeline/interpolation";

const identity = {
  x: 0,
  y: 0,
  z: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  opacity: 1,
  perspective: null,
};

const combine = (parent, child) => ({
  x: parent.x + (child.x ?? 0) * parent.scaleX,
  y: parent.y + (child.y ?? 0) * parent.scaleY,
  z: parent.z + (child.z ?? 0) * parent.scaleZ,
  scaleX: parent.scaleX * (child.scaleX ?? 1),
  scaleY: parent.scaleY * (child.scaleY ?? 1),
  scaleZ: parent.scaleZ * (child.scaleZ ?? 1),
  rotateX: parent.rotateX + (child.rotateX ?? 0),
  rotateY: parent.rotateY + (child.rotateY ?? 0),
  rotateZ: parent.rotateZ + (child.rotateZ ?? 0),
  opacity: (parent.opacity ?? 1) * (child.opacity ?? 1),
  perspective: child.perspective ?? parent.perspective ?? null,
});

const computeValue = (track, time) => {
  if (!track?.keyframes?.length) return null;
  const keyframes = track.keyframes
    .map((k) => ({
      time: k.t ?? k.time ?? 0,
      value: k.value,
      easing: k.ease || k.easing || "linear",
    }))
    .sort((a, b) => a.time - b.time);
  return interpolateKeyframes(keyframes, time);
};

const stepSpring = (state, config, dt) => {
  const mass = config.mass ?? 1;
  const k = config.stiffness ?? 180;
  const damping = config.damping ?? 12;
  const target = config.to ?? 0;
  const x = state.x ?? 0;
  const v = state.v ?? 0;
  const force = -k * (x - target) - damping * v;
  const a = force / mass;
  const nextV = v + a * dt;
  const nextX = x + nextV * dt;
  return { x: nextX, v: nextV };
};

const stepInertia = (state, config, dt) => {
  const friction = config.friction ?? 0.95;
  const x = state.x ?? 0;
  const v = state.v ?? 0;
  const nextV = v * Math.pow(friction, dt * 60);
  const nextX = x + nextV * dt * 1000;
  return { x: nextX, v: nextV };
};

const stepGravity = (state, config, dt) => {
  const gravity = config.gravity ?? 900; // px/s^2
  const bounds = config.bounds || {};
  let x = state.x ?? 0;
  let v = state.v ?? 0;
  v += gravity * dt;
  x += v * dt;
  const bottom = bounds.bottom;
  if (typeof bottom === "number" && x > bottom) {
    x = bottom;
    v = -v * 0.5;
  }
  return { x, v };
};

const stepPhysics = (track, dt, physicsStateRef) => {
  const config = track.config || {};
  const key = track.id || `${track.targetId}-${track.property}`;
  const prev = physicsStateRef.current[key] || { x: 0, v: 0 };
  let next = prev;
  if (track.physicsType === "spring") {
    next = stepSpring(prev, config, dt);
  } else if (track.physicsType === "gravity") {
    next = stepGravity(prev, config, dt);
  } else {
    next = stepInertia(prev, config, dt);
  }
  physicsStateRef.current[key] = next;
  return next.x;
};

const applyPhysicsValue = (prop, value, transform, style) => {
  switch (prop) {
    case "x":
      transform.x = value ?? 0;
      break;
    case "y":
      transform.y = value ?? 0;
      break;
    case "z":
    case "translateZ":
      transform.z = value ?? 0;
      break;
    case "scale":
      transform.scaleX = value ?? 1;
      transform.scaleY = value ?? 1;
      break;
    case "scaleZ":
      transform.scaleZ = value ?? 1;
      break;
    case "rotateX":
      transform.rotateX = value ?? 0;
      break;
    case "rotateY":
      transform.rotateY = value ?? 0;
      break;
    case "rotateZ":
    case "rotation":
      transform.rotateZ = value ?? 0;
      break;
    case "opacity":
      transform.opacity = value ?? 1;
      break;
    default:
      style[prop] = value;
      break;
  }
};

const handleAudioTrack = async (track, timeMs, audioCtxRef, cacheRef, playingRef) => {
  const audioCtx = ensureAudioCtx(audioCtxRef);
  if (!audioCtx || typeof window === "undefined") return;
  const id = track.id || track.src;
  if (!id || !track.src) return;

  const startMs = track.offset ?? 0;
  const alreadyPlaying = playingRef.current[id];
  if (!alreadyPlaying && timeMs >= startMs) {
    const buffer = await loadAudioBuffer(track.src, cacheRef, audioCtx);
    if (!buffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.value = 1;
    source.connect(gain).connect(audioCtx.destination);
    const startOffset = Math.max(0, (timeMs - startMs) / 1000);
    try {
      source.start(audioCtx.currentTime, startOffset);
    } catch (err) {
      console.warn("Audio start failed", err);
    }
    playingRef.current[id] = { source, gain, startMs, duration: buffer.duration * 1000 };
  }

  const playEntry = playingRef.current[id];
  if (playEntry) {
    const vol = computeValue(track, timeMs - (playEntry.startMs || 0)) ?? track.volume ?? 1;
    playEntry.gain.gain.value = Math.max(0, Math.min(1, vol));

    if (
      playEntry.duration &&
      timeMs - (playEntry.startMs || 0) > playEntry.duration + 100
    ) {
      try {
        playEntry.source.stop();
      } catch (_) {}
      delete playingRef.current[id];
    }
  }
};

const ensureAudioCtx = (audioCtxRef) => {
  if (audioCtxRef.current) return audioCtxRef.current;
  const AudioContextClass =
    typeof window !== "undefined"
      ? window.AudioContext || window.webkitAudioContext
      : null;
  if (!AudioContextClass) return null;
  audioCtxRef.current = new AudioContextClass();
  return audioCtxRef.current;
};

const loadAudioBuffer = async (src, cacheRef, audioCtx) => {
  if (!audioCtx || !src) return null;
  if (cacheRef.current[src]) return cacheRef.current[src];
  try {
    const res = await fetch(src);
    const arr = await res.arrayBuffer();
    const buf = await audioCtx.decodeAudioData(arr);
    cacheRef.current[src] = buf;
    return buf;
  } catch (err) {
    console.warn("Audio decode failed", err);
    return null;
  }
};

const stopAllAudio = (playingRef) => {
  Object.values(playingRef.current || {}).forEach((entry) => {
    try {
      entry.source?.stop();
    } catch (_) {
      // ignore
    }
  });
  playingRef.current = {};
};

export function useTimelinePlayer() {
  const { playing, setTime, layers, duration, zoom, currentTime } = useTimelineStore(
    useShallow((state) => ({
      playing: state.playing,
      setTime: state.setTime,
      layers: state.layers,
      duration: state.duration,
      zoom: state.zoom,
      currentTime: state.currentTime,
    })),
  );
  const registry = useComponentRegistry((state) => state.registry);
  const sceneNodes = useSceneGraph((state) => state.nodes);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const physicsStateRef = useRef({});
  const audioCtxRef = useRef(null);
  const audioCacheRef = useRef({});
  const playingAudioRef = useRef({});

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAllAudio(playingAudioRef);
      return;
    }

    const tick = (now) => {
      const delta = lastTimeRef.current ? now - lastTimeRef.current : 16;
      const dt = delta / 1000;
      lastTimeRef.current = now;
      const nextTime = Math.min(duration, currentTime + delta);
      setTime(nextTime);

      const localTransforms = {};
      const localStyles = {};

      layers.forEach((track) => {
        const targetId = track.targetId;
        if (!targetId && track.property !== "audio" && track.type !== "audio") return;
        const transform = targetId
          ? (localTransforms[targetId] = localTransforms[targetId] || { ...identity })
          : null;
        const style = targetId ? (localStyles[targetId] = localStyles[targetId] || {}) : {};

        if (track.type === "audio" || track.property === "audio") {
          handleAudioTrack(track, nextTime, audioCtxRef, audioCacheRef, playingAudioRef);
          return;
        }

        if (track.property === "physics") {
          const val = stepPhysics(track, dt, physicsStateRef);
          const targetProp = track.config?.property || "x";
          applyPhysicsValue(targetProp, val, transform, style);
          return;
        }

        const value = computeValue(track, nextTime);

        switch (track.property) {
          case "position":
            transform.x = value?.x ?? 0;
            transform.y = value?.y ?? 0;
            break;
          case "translateZ":
            transform.z = value ?? 0;
            break;
          case "scale":
            transform.scaleX = value?.x ?? 1;
            transform.scaleY = value?.y ?? 1;
            break;
          case "scaleZ":
            transform.scaleZ = value ?? 1;
            break;
          case "rotation":
            transform.rotateZ = value ?? 0;
            break;
          case "rotateX":
            transform.rotateX = value ?? 0;
            break;
          case "rotateY":
            transform.rotateY = value ?? 0;
            break;
          case "rotateZ":
            transform.rotateZ = value ?? 0;
            break;
          case "opacity":
            transform.opacity = value ?? 1;
            break;
          case "color":
            style.backgroundColor = value;
            break;
          case "blur":
            style.filter = `blur(${value ?? 0}px)`;
            break;
          case "clipPath":
            style.clipPath = value ?? "none";
            break;
          case "perspective":
            style.perspective = value;
            break;
          default:
            style[track.property] = value;
            break;
        }
      });

      // Compute world transforms
      const worldTransforms = {};
      const computeWorld = (id) => {
        if (worldTransforms[id]) return worldTransforms[id];
        const node = sceneNodes[id];
        const parentId = node?.parentId;
        const parentWorld = parentId ? computeWorld(parentId) : { ...identity };
        const local = localTransforms[id] || { ...identity };
        const combined = combine(parentWorld, local);
        worldTransforms[id] = combined;
        return combined;
      };

      Object.keys(registry || {}).forEach((id) => computeWorld(id));

      // Apply to DOM
      Object.entries(registry || {}).forEach(([id, ref]) => {
        const el = ref?.current;
        if (!el) return;
        const world = worldTransforms[id] || identity;
        const styles = localStyles[id] || {};
        const perspective = styles.perspective ?? world.perspective;
        const transformParts = [
          perspective ? `perspective(${perspective}px)` : null,
          `translate3d(${world.x}px, ${world.y}px, ${world.z}px)`,
          `rotateX(${world.rotateX}deg)`,
          `rotateY(${world.rotateY}deg)`,
          `rotateZ(${world.rotateZ}deg)`,
          `scale3d(${world.scaleX}, ${world.scaleY}, ${world.scaleZ})`,
        ].filter(Boolean);
        const transformStr = transformParts.join(" ");
        el.style.transform = transformStr;
        el.style.opacity = world.opacity ?? 1;
        if (styles.backgroundColor) el.style.backgroundColor = styles.backgroundColor;
        if (styles.filter) el.style.filter = styles.filter;
        if (styles.clipPath) el.style.clipPath = styles.clipPath;
      });

      if (nextTime >= duration) {
        // stop at end for now; loop support can be added via store
        stopAllAudio(playingAudioRef);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = 0;
      physicsStateRef.current = {};
      stopAllAudio(playingAudioRef);
    };
  }, [playing, duration, setTime, layers, registry, zoom, currentTime, sceneNodes]);
}
