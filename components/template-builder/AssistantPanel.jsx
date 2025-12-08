"use client";

import { useState } from "react";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { useContextHints } from "./hooks/useContextHints";

export default function AssistantPanel() {
  const { currentTemplate, pages, components } = useTemplateBuilderStore();
  const applyTheme = useTemplateBuilderStore((s) => s.applyMotionTheme);
  const refineMotionSelection = useTemplateBuilderStore((s) => s.refineMotionSelection);
  const adjustAutoLayoutSpacing = useTemplateBuilderStore((s) => s.adjustAutoLayoutSpacing);
  const setDefaultPageTransition = useTemplateBuilderStore((s) => s.setDefaultPageTransition);
  const createPageWithTransition = useTemplateBuilderStore((s) => s.createPageWithTransition);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [ruleSuggestions, setRuleSuggestions] = useState([]);
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
        <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-lg p-3 space-y-2 max-h-96 overflow-auto">
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
          <div className="pt-1 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-1">Suggestions</div>
            {suggestions?.length ? (
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">No suggestions yet.</div>
            )}
          </div>
          <div className="pt-1 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-1">Rules (Layout/Motion Hygiene)</div>
            {ruleSuggestions?.length ? (
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                {ruleSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">No rule-based suggestions.</div>
            )}
          </div>
          <div className="pt-1 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-1">Context Hints</div>
            {contextHints?.length ? (
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                {contextHints.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">No context hints right now.</div>
            )}
          </div>
          <div className="pt-1 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-1">Quick Actions</div>
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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
