"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
    Image as ImageIcon,
    Sparkles,
    Eraser,
    PenTool,
    Copyright,
    Wand2,
    Palette,
    Layers3,
    Upload,
    CreditCard,
    Shapes,
    Bot,
    Brush,
} from "lucide-react";
import BrandMark from "@/components/BrandMark.jsx";

const TOOL_CARDS = [
    {
        id: "image-generator",
        title: "Image Generator",
        description: "Generate images from text prompts.",
        icon: ImageIcon,
        href: "/editor?ai=image-generator",
    },
    {
        id: "background-remover",
        title: "Background Remover",
        description: "Remove backgrounds from images.",
        icon: Eraser,
        href: "/editor?ai=background-remover",
    },
    {
        id: "object-remover",
        title: "Object Remover",
        description: "Remove objects from images.",
        icon: PenTool,
        href: "/editor?ai=object-remover",
    },
    {
        id: "text-to-logo",
        title: "Text to Logo",
        description: "Turn text prompts into logo designs.",
        icon: Copyright,
        href: "/editor?ai=text-to-logo",
    },
    {
        id: "magic-resize",
        title: "Magic Resize",
        description: "Quickly resize images to new dimensions.",
        icon: Palette,
        href: "/editor?ai=magic-resize",
    },
    {
        id: "batch-generator",
        title: "Batch Generator",
        description: "Create multiple images from prompts.",
        icon: Layers3,
        href: "/editor?ai=batch-generator",
    },
];

const SIDE_ACTIONS = [
    {
        id: "credits",
        title: "1,200 credits",
        action: { label: "Buy Credits", href: "/dashboard?view=credits" },
    },
    {
        id: "upload",
        title: "Upload assets",
        icon: Upload,
        href: "/dashboard/assets",
    },
];

const SIDE_TOOLS = [
    {
        id: "mockup-generator",
        title: "Mockup Generator",
        description: "Generate mockups",
        icon: Bot,
        href: "/editor?ai=mockup",
    },
    {
        id: "smart-upscaler",
        title: "Smart Upscaler",
        description: "Sharpen + upscale up to 4K",
        icon: Brush,
        href: "/editor?ai=upscale",
    },
];

export default function AiStudioPage() {
    const gridCards = useMemo(() => TOOL_CARDS, []);

    return (
        <div className="min-h-screen w-full bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
                <header className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/50 md:flex-row md:items-center md:justify-between">
                    <BrandMark
                        size={40}
                        labelClassName="text-2xl font-semibold tracking-tight"
                        className="text-slate-900 dark:text-slate-100"
                    />
                    <div className="flex flex-1 items-center gap-4 md:justify-end">
                        <div className="relative w-full max-w-md">
                            <input
                                type="search"
                                placeholder="Search AI tools"
                                className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-400/40"
                            />
                            <Sparkles className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                        </div>
                        <Link
                            href="/dashboard?view=pricing&plan=pro"
                            className="rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/40 transition hover:bg-indigo-600 dark:shadow-indigo-900/40"
                        >
                            Upgrade to Pro
                        </Link>
                    </div>
                </header>

                <main className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/40">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">AI Studio</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Generate, edit, resize, and enhance creative assets with Dropple’s AI tools.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {gridCards.map((card, index) => {
                                const Icon = card.icon ?? Sparkles;
                                return (
                                    <Link
                                        key={card.id}
                                        href={card.href}
                                        className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-indigo-500/60 dark:hover:bg-slate-900"
                                        style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                                    >
                                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
                                            Open tool
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    <aside className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/40">
                        {SIDE_ACTIONS.map((item) =>
                            item.action ? (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                >
                                    <div className="space-y-1">
                                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                                        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Credits</span>
                                    </div>
                                    <Link
                                        href={item.action.href}
                                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-indigo-500/40 dark:bg-slate-900 dark:text-indigo-300 dark:hover:border-indigo-400"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        {item.action.label}
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    {item.icon ? <item.icon className="h-5 w-5 text-indigo-500 dark:text-indigo-300" /> : null}
                                    {item.title}
                                </Link>
                            )
                        )}

                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-5 dark:border-slate-700 dark:bg-slate-900/60">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    <Upload className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                                    <span>Upload assets</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {SIDE_TOOLS.map((tool) => (
                                    <Link
                                        key={tool.id}
                                        href={tool.href}
                                        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                    >
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300">
                                            {tool.icon ? <tool.icon className="h-5 w-5" /> : <Shapes className="h-5 w-5" />}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tool.title}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/editor?ai"
                            className="mt-auto inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/40 transition hover:bg-indigo-600 dark:shadow-indigo-900/40"
                        >
                            Get Started
                        </Link>
                    </aside>
                </main>
            </div>
        </div>
    );
}
