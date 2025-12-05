"use client";

export default function EvolutionDashboard({ memories = [] }) {
  if (!memories.length) {
    return (
      <div className="bg-white border rounded p-4 text-sm text-gray-500">
        No evolution data yet.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 space-y-3">
      <p className="font-semibold text-lg">AI Evolution Dashboard</p>
      {memories.map((m) => (
        <div key={m.agentName} className="border rounded p-3">
          <p className="font-semibold">{m.agentName}</p>
          <p className="text-xs text-gray-500">
            Runs: {m.runs} • Successes: {m.successes} • Failures: {m.failures}
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Skill Weights: {JSON.stringify(m.skillWeights || {})}
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Behavior Deltas: {JSON.stringify(m.behaviorDeltas || {})}
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Corrections: {Array.isArray(m.corrections) ? m.corrections.join(", ") : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
