"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { motionPresets, getMotionPreset } from "@/lib/motionPresets";
import { motionThemes } from "@/lib/motionThemes";

const STATES = ["initial", "animate", "hover", "tap", "inView"];
const FIELDS = ["opacity", "x", "y", "scale", "rotate", "rotateX", "rotateY", "rotateZ"];
const TRANSITION_FIELDS = ["duration", "delay", "ease", "repeat", "repeatType"];
const TRIGGERS = ["onLoad", "onHover", "onClick", "onView", "onScroll"];
const SCROLL_FIELDS = ["y", "opacity", "scale"];

export default function MotionPanel({ layer }) {
  const updateLayer = useTemplateBuilderStore((s) => s.updateLayer);
  const applyPreset = useTemplateBuilderStore((s) => s.applyMotionPresetToLayer);
  const applyTheme = useTemplateBuilderStore((s) => s.applyMotionTheme);
  const [presetId, setPresetId] = useState("");
  const [themeId, setThemeId] = useState("");

  const animations = layer.animations || [];
  const selectedAnimId = layer.motionAnimationId || animations[0]?.id;
  const anim =
    animations.find((a) => a.id === selectedAnimId) ||
    animations[0] || {
      id: "anim_" + crypto.randomUUID(),
      states: {},
      triggers: ["onHover", "onClick", "onLoad"],
      tracks: [],
    };
  const applyAnimationUpdate = (updater) => {
    const updated = updater(anim);
    const hasExisting = animations.some((a) => a.id === updated.id);
    const nextAnimations = hasExisting
      ? animations.map((a) => (a.id === updated.id ? updated : a))
      : [updated, ...animations];
    updateLayer(layer.id, { animations: nextAnimations });
  };
  const states = anim.variants || anim.states || {};
  const triggers = anim.triggers || [];
  const scroll = anim.scroll || {};
  const currentState = layer.motionState || "animate";
  const playTimelineOnLoad = anim.playTimelineOnLoad || false;
  const triggerMap = layer.motionTriggerMap || {};
  const timelineLoop = anim.timelineLoop || false;
  const timelineLoopCount = anim.timelineLoopCount ?? 0;

  const handleChange = (stateKey, field, value) => {
    const isTransitionField = TRANSITION_FIELDS.includes(field);
    const numeric = isTransitionField || field !== "ease";
    const nextVal = value === "" ? undefined : numeric ? Number(value) : value;
    const existing = states[stateKey] || {};
    const nextState = { ...existing };
    if (isTransitionField) {
      nextState.transition = { ...(existing.transition || {}) };
      nextState.transition[field] = nextVal;
    } else {
      nextState[field] = nextVal;
    }
    const nextStates = { ...states, [stateKey]: nextState };
    applyAnimationUpdate((a) => ({ ...a, variants: nextStates }));
  };

  const toggleTrigger = (trigger) => {
    const has = triggers.includes(trigger);
    const nextTriggers = has ? triggers.filter((t) => t !== trigger) : [...triggers, trigger];
    applyAnimationUpdate((a) => ({ ...a, triggers: nextTriggers }));
  };

  const updateScroll = (prop, idx, value) => {
    const numeric = prop !== "clamp";
    const nextVal = value === "" ? undefined : numeric ? Number(value) : value;
    const nextScroll = { ...scroll };
    if (!nextScroll.outputRange) nextScroll.outputRange = {};
    if (!Array.isArray(nextScroll.outputRange[prop])) nextScroll.outputRange[prop] = [0, 0];
    const arr = [...nextScroll.outputRange[prop]];
    arr[idx] = nextVal;
    nextScroll.outputRange[prop] = arr;
    if (!nextScroll.inputRange) nextScroll.inputRange = [0, 1];
    applyAnimationUpdate((a) => ({ ...a, scroll: nextScroll }));
  };

  const updateScrollInput = (idx, value) => {
    const nextVal = value === "" ? undefined : Number(value);
    const nextScroll = { ...scroll, inputRange: [...(scroll.inputRange || [0, 1])] };
    nextScroll.inputRange[idx] = nextVal;
    applyAnimationUpdate((a) => ({ ...a, scroll: nextScroll }));
  };

  const toggleTimelinePlay = () => {
    applyAnimationUpdate((a) => ({ ...a, playTimelineOnLoad: !playTimelineOnLoad }));
  };

  const setTriggerTarget = (trigger, target) => {
    const nextMap = { ...triggerMap, [trigger]: target };
    updateLayer(layer.id, { motionTriggerMap: nextMap });
  };

  const selectAnimation = (id) => {
    updateLayer(layer.id, { motionAnimationId: id });
  };

  const setCurrentState = (stateKey) => {
    updateLayer(layer.id, { motionState: stateKey });
  };

  const toggleTimelineLoop = () => {
    applyAnimationUpdate((a) => ({
      ...a,
      timelineLoop: !timelineLoop,
    }));
  };

  const updateLoopCount = (value) => {
    applyAnimationUpdate((a) => ({
      ...a,
      timelineLoopCount: value === "" ? undefined : Number(value),
    }));
  };

  const updateKeyframeField = (trackIndex, keyframeIndex, field, value) => {
    applyAnimationUpdate((a) => {
      const tracks = [...(a.tracks || [])];
      if (!tracks[trackIndex]) return a;
      const keyframes = [...(tracks[trackIndex].keyframes || [])];
      if (!keyframes[keyframeIndex]) return a;
      const nextVal =
        value === ""
          ? undefined
          : field === "time" || field === "duration"
            ? Number(value)
            : value;
      keyframes[keyframeIndex] = { ...keyframes[keyframeIndex], [field]: nextVal };
      if (field === "time") {
        keyframes.sort((m, n) => (m.time || 0) - (n.time || 0));
      }
      tracks[trackIndex] = { ...tracks[trackIndex], keyframes };
      return { ...a, tracks };
    });
  };

  const formatValue = (val) => {
    if (val === undefined || val === null) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return val;
  };

  const handleValueChange = (trackIdx, kfIdx, raw) => {
    if (raw === "") {
      updateKeyframeField(trackIdx, kfIdx, "value", undefined);
      return;
    }
    let parsed = raw;
    if (!Number.isNaN(Number(raw)) && raw.trim() !== "") {
      parsed = Number(raw);
    } else {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }
    }
    updateKeyframeField(trackIdx, kfIdx, "value", parsed);
  };

  const allStateKeys = Array.from(new Set([...Object.keys(states), ...STATES, "hovered", "pressed"]));

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="text-sm font-semibold text-neutral-800 mb-2">Motion</div>
      <div className="flex items-center gap-2 mb-3">
        <select
          className="text-xs border border-neutral-200 rounded px-2 py-1 flex-1"
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
        >
          <option value="">Choose preset...</option>
          {motionPresets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} • {p.category}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
          disabled={!presetId}
          onClick={() => {
            const preset = getMotionPreset(presetId);
            if (preset) applyPreset(layer.id, preset);
          }}
        >
          Apply
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <select
          className="text-xs border border-neutral-200 rounded px-2 py-1 flex-1"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
        >
          <option value="">Motion theme...</option>
          {motionThemes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="text-xs bg-slate-800 text-white px-2 py-1 rounded disabled:opacity-50"
          disabled={!themeId}
          onClick={() => themeId && applyTheme(themeId, "selection")}
        >
          Theme → Selection
        </button>
      </div>
      {animations.length > 1 ? (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-neutral-500">Animation</span>
          <select
            className="text-xs border border-neutral-200 rounded px-2 py-1"
            value={selectedAnimId || ""}
            onChange={(e) => selectAnimation(e.target.value)}
          >
            {animations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name || a.id}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-neutral-500">Current state</span>
        <select
          className="text-xs border border-neutral-200 rounded px-2 py-1"
          value={currentState}
          onChange={(e) => setCurrentState(e.target.value)}
        >
          {allStateKeys.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" checked={playTimelineOnLoad} onChange={toggleTimelinePlay} />
          Play timeline on load (uses tracks)
        </label>
      </div>
      <div className="space-y-1 mb-3">
        <div className="text-xs text-neutral-600 font-semibold">Trigger targets</div>
        {TRIGGERS.map((tr) => (
          <div key={tr} className="flex items-center gap-2 text-xs">
            <span className="w-14 text-neutral-500">{tr.replace("on", "")}</span>
            <select
              className="border border-neutral-200 rounded px-2 py-1 flex-1"
              value={triggerMap[tr] || ""}
              onChange={(e) => setTriggerTarget(tr, e.target.value)}
            >
              <option value="">(default)</option>
              {allStateKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {TRIGGERS.map((tr) => (
          <button
            key={tr}
            onClick={() => toggleTrigger(tr)}
            className={`px-2 py-1 rounded text-xs border ${
              triggers.includes(tr) ? "bg-violet-100 border-violet-300 text-violet-700" : "bg-white border-neutral-200 text-neutral-600"
            }`}
            type="button"
          >
            {tr.replace("on", "")}
          </button>
        ))}
      </div>
      {anim.tracks?.length ? (
        <div className="border border-neutral-200 rounded-md p-2 mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-neutral-600">Timeline</div>
            <label className="flex items-center gap-2 text-xs text-neutral-600">
              <input type="checkbox" checked={timelineLoop} onChange={toggleTimelineLoop} />
              Loop
            </label>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-20 text-neutral-500">Loop count</span>
            <input
              type="number"
              className="border border-neutral-200 rounded px-2 py-1 text-xs w-full"
              value={timelineLoopCount ?? ""}
              onChange={(e) => updateLoopCount(e.target.value)}
              placeholder="0 = infinite"
            />
          </div>
          <div className="space-y-2">
            {anim.tracks.map((track, trackIdx) => (
              <div key={`${track.property}_${trackIdx}`} className="border border-neutral-100 rounded p-2">
                <div className="text-xs font-semibold text-neutral-600 mb-1">{track.property || "track"}</div>
                <div className="space-y-1">
                  {(track.keyframes || []).map((kf, kfIdx) => (
                    <div key={kfIdx} className="grid grid-cols-3 gap-2 text-xs items-center">
                      <label className="text-neutral-500">t (ms)</label>
                      <input
                        type="number"
                        className="border border-neutral-200 rounded px-2 py-1"
                        value={kf.time ?? ""}
                        onChange={(e) => updateKeyframeField(trackIdx, kfIdx, "time", e.target.value)}
                      />
                      <div />
                      <label className="text-neutral-500">Ease</label>
                      <input
                        type="text"
                        className="border border-neutral-200 rounded px-2 py-1 col-span-2"
                        value={kf.easing || kf.ease || ""}
                        onChange={(e) => updateKeyframeField(trackIdx, kfIdx, "easing", e.target.value)}
                        placeholder="easeInOut"
                      />
                      <label className="text-neutral-500">Duration (ms)</label>
                      <input
                        type="number"
                        className="border border-neutral-200 rounded px-2 py-1 col-span-2"
                        value={kf.duration ?? ""}
                        onChange={(e) => updateKeyframeField(trackIdx, kfIdx, "duration", e.target.value)}
                        placeholder="auto"
                      />
                      <label className="text-neutral-500">Value</label>
                      <textarea
                        className="border border-neutral-200 rounded px-2 py-1 col-span-2 text-xs"
                        rows={2}
                        value={formatValue(kf.value)}
                        onChange={(e) => handleValueChange(trackIdx, kfIdx, e.target.value)}
                        placeholder='number or JSON (e.g. {"x":0,"y":0})'
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="space-y-3">
        {STATES.map((stateKey) => (
          <div key={stateKey} className="border border-neutral-200 rounded-md p-2">
            <div className="text-xs font-semibold text-neutral-600 mb-1 capitalize">{stateKey}</div>
            <div className="grid grid-cols-2 gap-2">
              {FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-1 text-xs">
                  <span className="w-14 text-neutral-500">{field}</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border border-neutral-200 rounded px-2 py-1 text-xs"
                    value={
                      states[stateKey]?.[field] === undefined || states[stateKey]?.[field] === null
                        ? ""
                        : states[stateKey]?.[field]
                    }
                    onChange={(e) => handleChange(stateKey, field, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {TRANSITION_FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-1 text-xs">
                  <span className="w-16 text-neutral-500">{field}</span>
                  <input
                    type={field === "ease" || field === "repeatType" ? "text" : "number"}
                    step="0.1"
                    className="w-full border border-neutral-200 rounded px-2 py-1 text-xs"
                    value={
                      states[stateKey]?.transition?.[field] === undefined ||
                      states[stateKey]?.transition?.[field] === null
                        ? ""
                        : states[stateKey]?.transition?.[field]
                    }
                    onChange={(e) => handleChange(stateKey, field, e.target.value)}
                    placeholder={field === "repeatType" ? "loop|mirror|reverse" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="border border-neutral-200 rounded-md p-2">
          <div className="text-xs font-semibold text-neutral-600 mb-2">Scroll</div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="text-neutral-500 w-12">Input</span>
            <input
              type="number"
              step="1"
              className="w-full border border-neutral-200 rounded px-2 py-1"
              value={scroll.inputRange?.[0] ?? ""}
              onChange={(e) => updateScrollInput(0, e.target.value)}
            />
            <input
              type="number"
              step="1"
              className="w-full border border-neutral-200 rounded px-2 py-1"
              value={scroll.inputRange?.[1] ?? ""}
              onChange={(e) => updateScrollInput(1, e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {SCROLL_FIELDS.map((field) => (
              <div key={field} className="flex items-center gap-2 text-xs">
                <span className="w-12 text-neutral-500">{field}</span>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border border-neutral-200 rounded px-2 py-1"
                  value={scroll.outputRange?.[field]?.[0] ?? ""}
                  onChange={(e) => updateScroll(field, 0, e.target.value)}
                />
                <input
                  type="number"
                  step="0.1"
                  className="w-full border border-neutral-200 rounded px-2 py-1"
                  value={scroll.outputRange?.[field]?.[1] ?? ""}
                  onChange={(e) => updateScroll(field, 1, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
