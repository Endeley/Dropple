"use client";

export default function ScenarioSimulationPanel({ results }) {
  if (!results || !results.scenarios) return null;

  return (
    <div className="bg-white rounded-lg p-4 border h-96 overflow-auto">
      <p className="text-lg font-semibold">AI Scenario Simulation</p>

      {results.scenarios.map((s, i) => (
        <div key={i} className="mt-4 p-3 border rounded">
          <p className="font-bold">{s.persona}</p>
          <p className="text-xs text-gray-500">UX Score: {s.uxScore}/10</p>
          <p className="text-sm mt-2">Confusion Points:</p>
          <ul className="list-disc ml-4">
            {(s.confusionPoints || []).map((c, j) => (
              <li key={j}>{c}</li>
            ))}
          </ul>
          <p className="text-sm mt-2">Recommendations:</p>
          <ul className="list-disc ml-4">
            {(s.recommendations || []).map((r, j) => (
              <li key={j}>{r}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
