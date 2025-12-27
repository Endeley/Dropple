"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/runtime/stores/useTemplateBuilderStore";
import { useContextHints } from "./hooks/useContextHints";

export default function AssistantPanel() {
  const { currentTemplate, pages, components } = useTemplateBuilderStore();
  const applyTheme = useTemplateBuilderStore((s) => s.applyMotionTheme);
  const refineMotionSelection = useTemplateBuilderStore((s) => s.refineMotionSelection);
  const adjustAutoLayoutSpacing = useTemplateBuilderStore((s) => s.adjustAutoLayoutSpacing);
  const setDefaultPageTransition = useTemplateBuilderStore((s) => s.setDefaultPageTransition);
  const createPageWithTransition = useTemplateBuilderStore((s) => s.createPageWithTransition);
  const fixAllMotionAndLayout = useTemplateBuilderStore((s) => s.fixAllMotionAndLayout);
  const loadTemplateFromObject = useTemplateBuilderStore((s) => s.loadTemplateFromObject);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [ruleSuggestions, setRuleSuggestions] = useState([]);
  const [styleSuggestions, setStyleSuggestions] = useState([]);
  const [autopilotGoal, setAutopilotGoal] = useState("SaaS homepage");
  const [autopilotStyle, setAutopilotStyle] = useState("modern minimal");
  const [autopilotMotion, setAutopilotMotion] = useState("smooth");
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const contextHints = useContextHints();

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/project-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: currentTemplate, pages, components }),
      });
      const data = await res.json();
      setAnalysis(data);
      setSuggestions(data?.suggestions || []);

      const rs = await fetch("/api/assistant/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: currentTemplate, mode: "rules" }),
      }).then((r) => r.json());
      setRuleSuggestions(rs?.suggestions || []);

      const style = await fetch("/api/assistant/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: (analysis?.theme || currentTemplate?.theme || {}) }),
      }).then((r) => r.json());
      setStyleSuggestions(style?.suggestions || []);
    } catch (err) {
      console.error("Assistant analysis failed", err);
      setSuggestions(["Could not analyze project. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw]">
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && !analysis) runAnalysis();
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg shadow-md bg-slate-900 text-white text-sm"
      >
        <span>AI Assistant</span>
        <span className="text-[11px] opacity-80">{loading ? "Analyzing..." : open ? "Hide" : "Show"}</span>
      </button>

      {open ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-lg p-0 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-700">
            {["overview", "suggestions", "actions", "autopilot"].map((t) => (
              <button
                key={t}
                className={`px-3 py-2 flex-1 ${tab === t ? "bg-slate-100" : ""}`}
                onClick={() => {
                  setTab(t);
                  if (!analysis && t !== "autopilot") runAnalysis();
                }}
              >
                {t === "overview" && "Overview"}
                {t === "suggestions" && "Suggestions"}
                {t === "actions" && "Actions"}
                {t === "autopilot" && "Autopilot"}
              </button>
            ))}
          </div>
          <div className="p-3 overflow-auto space-y-2 flex-1">
            {tab === "overview" ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">Project Snapshot</div>
                  <button
                    onClick={runAnalysis}
                    className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                    disabled={loading}
                  >
                    {loading ? "Running" : "Refresh"}
                  </button>
                </div>
                {analysis?.stats ? (
                  <div className="text-xs text-slate-600 grid grid-cols-2 gap-2">
                    <div>Pages: {analysis.stats.pageCount}</div>
                    <div>Layers: {analysis.stats.layerCount}</div>
                    <div>Components: {analysis.stats.componentCount}</div>
                    <div>Animations: {analysis.stats.hasAnimations ? "Yes" : "No"}</div>
                  </div>
                ) : null}
                {analysis?.analysis ? (
                  <div className="text-xs text-slate-600">
                    <div>Avg duration: {(analysis.analysis.avgDuration || 0).toFixed(2)}s</div>
                    <div>Avg distance: {(analysis.analysis.avgDistance || 0).toFixed(1)}px</div>
                  </div>
                ) : null}
              </>
            ) : null}

            {tab === "suggestions" ? (
              <>
                <div className="text-xs font-semibold text-slate-700 mb-1">AI Suggestions</div>
                {suggestions?.length ? (
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    {suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-500">No suggestions yet.</div>
                )}

                <div className="text-xs font-semibold text-slate-700 mb-1 pt-2 border-t border-slate-100">Rules (Layout/Motion)</div>
                {ruleSuggestions?.length ? (
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    {ruleSuggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-500">No rule-based suggestions.</div>
                )}

                <div className="text-xs font-semibold text-slate-700 mb-1 pt-2 border-t border-slate-100">Style Advisor</div>
                {styleSuggestions?.length ? (
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    {styleSuggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-500">No style suggestions.</div>
                )}

                <div className="text-xs font-semibold text-slate-700 mb-1 pt-2 border-t border-slate-100">Context Hints</div>
                {contextHints?.length ? (
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                    {contextHints.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-500">No context hints right now.</div>
                )}
              </>
            ) : null}

            {tab === "actions" ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => applyTheme("smoothModern", "selection")}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Theme: Smooth Modern
                  </button>
                  <button
                    onClick={() => refineMotionSelection()}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Refine Motion
                  </button>
                  <button
                    onClick={() => adjustAutoLayoutSpacing(6)}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Increase Spacing
                  </button>
                  <button
                    onClick={() => setDefaultPageTransition("slide", "right", 0.6, "easeOut")}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Set Page Transition
                  </button>
                  <button
                    onClick={() => createPageWithTransition("New Page")}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Add Page + Transition
                  </button>
                  <button
                    onClick={() => fixAllMotionAndLayout()}
                    className="px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 col-span-2"
                  >
                    Fix All (Motion + Layout)
                  </button>
                </div>
              </div>
            ) : null}

            {tab === "autopilot" ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">Autonomous Build</div>
                <input
                  className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                  value={autopilotGoal}
                  onChange={(e) => setAutopilotGoal(e.target.value)}
                  placeholder="Goal e.g. SaaS homepage"
                />
                <input
                  className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                  value={autopilotStyle}
                  onChange={(e) => setAutopilotStyle(e.target.value)}
                  placeholder="Style e.g. modern minimal"
                />
                <input
                  className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                  value={autopilotMotion}
                  onChange={(e) => setAutopilotMotion(e.target.value)}
                  placeholder="Motion e.g. smooth"
                />
                <button
                  onClick={async () => {
                    setAutopilotLoading(true);
                    try {
                      const res = await fetch("/api/assistant/autopilot", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          goal: autopilotGoal,
                          style: autopilotStyle,
                          motion: autopilotMotion,
                        }),
                      });
                      const data = await res.json();
                      if (data?.template) {
                        loadTemplateFromObject(data.template);
                      }
                    } catch (err) {
                      console.error("Autopilot failed", err);
                    } finally {
                      setAutopilotLoading(false);
                    }
                  }}
                  className="w-full px-3 py-2 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-50"
                  disabled={autopilotLoading}
                >
                  {autopilotLoading ? "Building..." : "Build Section/Page"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
