// UI Exporter for React with Tailwind CSS
export function exportToReactTailwind(root, tokens) {
    const width = root.width || 1440;
    return `
import React from 'react';

export default function Screen() {
  return (
    <div className="mx-auto max-w-[${width}px] px-6 py-8 space-y-8 bg-[${tokens.color.surface}]">
      ${root.children.map(nodeToJSX).join('\n      ')}
    </div>
  );
}

function ButtonPrimary({ children }) {
  return <button className="rounded-lg bg-[${tokens.color.primary}] px-4 py-2 text-white hover:opacity-95 transition">{children}</button>;
}
`.trim();
}

function nodeToJSX(node) {
    if (node.type === 'navbar') {
        return `<nav className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="h-6 w-20 rounded bg-indigo-100"></div>
        <div className="flex gap-3">
          <div className="h-3 w-14 rounded bg-slate-200"></div>
          <div className="h-3 w-14 rounded bg-slate-200"></div>
          <div className="h-3 w-14 rounded bg-slate-200"></div>
        </div>
        <div className="h-8 w-24 rounded bg-indigo-600"></div>
      </nav>`;
    }

    if (node.type === 'hero') {
        return `<section className="mb-6 grid gap-6 rounded-2xl bg-white p-6 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Build UI faster with Dropple</h1>
          <p className="mt-2 text-slate-600">From wireframe to code, in minutes.</p>
          <div className="mt-4 flex gap-2">
            <ButtonPrimary>Get started</ButtonPrimary>
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700">Learn more</button>
          </div>
        </div>
        <div className="h-48 rounded-xl bg-indigo-50"></div>
      </section>`;
    }

    if (node.type === 'cards3') {
        return `<section className="mb-6 grid gap-4 rounded-2xl bg-white p-4 md:grid-cols-3">
        {Array.from({length:3}).map((_,i)=>(
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="h-24 w-full rounded-lg bg-indigo-50"></div>
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-200"></div>
            <div className="mt-1 h-3 w-1/2 rounded bg-slate-200"></div>
          </div>
        ))}
      </section>`;
    }

    if (node.children?.length) {
        return node.children.map(nodeToJSX).join('\n');
    }

    return `<>/* Unsupported node: ${node.type} */</>`;
}
