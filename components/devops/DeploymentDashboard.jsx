"use client";

export default function DeploymentDashboard({ build, tests, deploy, performance, logs }) {
  return (
    <div className="bg-white border rounded p-4 h-96 overflow-auto space-y-3">
      <p className="font-semibold text-lg">Deployment Dashboard</p>
      <Section title="Build" data={build} />
      <Section title="Tests" data={tests} />
      <Section title="Deploy" data={deploy} />
      <Section title="Performance" data={performance} />
      <Section title="Logs" data={logs} />
    </div>
  );
}

function Section({ title, data }) {
  if (!data) return null;
  return (
    <div className="border rounded p-2">
      <p className="font-semibold text-sm mb-1">{title}</p>
      <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-2 rounded border">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
