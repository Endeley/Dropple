"use client";

import { useState } from "react";
import { inspectDesign } from "@/lib/designInspector";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";

export default function DesignCriticPanel() {
  const [issues, setIssues] = useState([]);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pages = useTemplateBuilderStore((s) => s.pages);
  const updateLayer = useTemplateBuilderStore((s) => s.updateLayer);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const designMap = inspectDesign(pages);
      const res = await fetch("/api/design-critic", {
        method: "POST",
        body: JSON.stringify({ designMap }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
      setIssues(data.issues || []);
      setScores(data.scores || null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyFix(issue) {
    if (!issue?.id || !issue.fix) return;
    updateLayer(issue.id, issue.fix);
  }

  function applyAll() {
    issues.forEach((issue) => applyFix(issue));
  }

  return (
    <div className="p-3 border rounded space-y-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">AI Design Critic</h3>
          <p className="text-xs text-gray-500">Analyze and auto-fix spacing, alignment, style.</p>
        </div>
        <button
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded disabled:bg-gray-300"
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {scores && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(scores).map(([k, v]) => (
            <div key={k} className="px-2 py-1 bg-slate-50 rounded border text-slate-700 flex justify-between">
              <span className="capitalize">{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">{issues.length} issues</span>
            <button
              className="px-3 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={applyAll}
            >
              Fix All
            </button>
          </div>
          {issues.map((issue) => (
            <div key={issue.id + issue.problem} className="p-2 rounded border bg-red-50">
              <p className="text-sm font-semibold text-red-700">
                {issue.problem}
              </p>
              <p className="text-xs text-slate-700">{issue.details}</p>
              <p className="text-xs text-slate-600 mt-1">{issue.suggestion}</p>
              {issue.fix ? (
                <button
                  className="mt-2 px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                  onClick={() => applyFix(issue)}
                >
                  Apply fix
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
