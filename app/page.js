import clsx from 'clsx';

const modes = [
    {
        title: 'Graphic Design Mode',
        tag: 'Canva-like visual studio',
        description: 'Design posters, social posts, thumbnails, flyers, and banners with layered controls, brand kits, and rapid resizing.',
        accent: 'from-violet-500/80 via-fuchsia-500/70 to-amber-300/70',
        bg: 'bg-gradient-to-br from-[#0b0b12] via-[#0d0a16] to-[#0c0c10]',
        bullets: ['Smart resize & templates', 'Vector + raster layers', 'Brand-safe exports'],
    },
    {
        title: 'UI/UX Mode',
        tag: 'Interactive product design',
        description: 'Craft responsive web & mobile UI with grids, auto-layout, component props, and motion previews.',
        accent: 'from-sky-400/80 via-violet-400/80 to-fuchsia-400/80',
        bg: 'bg-gradient-to-br from-[#0a0f1e] via-[#0c0b1a] to-[#0b0f1a]',
        bullets: ['Component systems', 'Interactive states', 'Layout + motion tokens'],
    },
    {
        title: 'Podcast Mode',
        tag: 'Covers, audiograms, episode kits',
        description: 'Generate bold cover art, waveform audiograms, and episodic visuals tuned for every platform.',
        accent: 'from-amber-400/80 via-rose-400/80 to-violet-400/80',
        bg: 'bg-gradient-to-br from-[#1a0d0c] via-[#0f0b15] to-[#0c0b11]',
        bullets: ['Waveform & captions', 'Platform-specific crops', 'Template automation'],
    },
    {
        title: 'Video Mode',
        tag: 'Creator-grade editor',
        description: 'Timeline, layers, transitions, LUTs, and social-safe exports for creators, agencies, and filmmakers.',
        accent: 'from-cyan-400/80 via-violet-500/80 to-indigo-400/80',
        bg: 'bg-gradient-to-br from-[#071019] via-[#0b0c18] to-[#0b0f17]',
        bullets: ['Multi-track timeline', 'Motion presets', 'Auto captions & sizing'],
    },
    {
        title: 'AI Suite Mode',
        tag: 'Magic-first workspace',
        description: 'AI mockups, image generation, upscaling, magic edits, background removal/replacement, and batch automation.',
        accent: 'from-emerald-400/80 via-cyan-400/80 to-violet-400/80',
        bg: 'bg-gradient-to-br from-[#06140f] via-[#0a1018] to-[#0b0d13]',
        bullets: ['Gen & upscale', 'Magic erase/replace', 'Batch pipelines'],
    },
    {
        title: 'Cartoon / Animation Mode',
        tag: '2D/3D character lab',
        description: 'Build characters, rig facial animation, and deliver stylized 2D/3D scenes with camera moves.',
        accent: 'from-orange-400/80 via-pink-400/80 to-violet-500/80',
        bg: 'bg-gradient-to-br from-[#1a0f08] via-[#140b16] to-[#0f0b13]',
        bullets: ['Rigged characters', 'Lip sync & facial', '2D/3D scene playback'],
    },
    {
        title: 'Material UI Mode',
        tag: 'Token-driven Material toolkit',
        description: 'Generate Material components, color systems, elevation, and typography scales ready for dev handoff.',
        accent: 'from-lime-400/80 via-emerald-400/80 to-teal-400/80',
        bg: 'bg-gradient-to-br from-[#0c1208] via-[#0b1310] to-[#0a0f0e]',
        bullets: ['Palettes & tokens', 'Component variants', 'Code-ready specs'],
    },
    {
        title: 'Dev Mode',
        tag: 'Design-to-code pipeline',
        description: 'Turn designs into live web. Preview React/Next.js/Tailwind code, export snippets, and ship faster.',
        accent: 'from-blue-400/80 via-violet-500/80 to-sky-400/80',
        bg: 'bg-gradient-to-br from-[#07101f] via-[#0b0e1c] to-[#0a0f18]',
        bullets: ['Live preview', 'Export React/Next/TW', 'Component mapping'],
    },
    {
        title: 'Branding Kit Mode',
        tag: 'Identity in minutes',
        description: 'Logo maker, color & type system, business cards, signage, and marketing assets in a cohesive kit.',
        accent: 'from-fuchsia-400/80 via-violet-500/80 to-blue-400/80',
        bg: 'bg-gradient-to-br from-[#120a18] via-[#0f0b12] to-[#0b0c16]',
        bullets: ['Logos & lockups', 'Brand tokens', 'Launch assets'],
    },
    {
        title: 'Documents Mode',
        tag: 'Modern office suite',
        description: 'Docs, presentations, PDFs, and paper templates with real-time collaboration and brand-safe themes.',
        accent: 'from-cyan-400/80 via-emerald-400/80 to-amber-300/80',
        bg: 'bg-gradient-to-br from-[#0a0f12] via-[#0b100c] to-[#0c0b10]',
        bullets: ['Docs & decks', 'PDF-ready exports', 'Live collaboration'],
    },
    {
        title: 'Education Mode',
        tag: 'Classroom-ready templates',
        description: 'Workspaces for teachers and students: study guides, flashcards, lesson plans, and classroom hubs.',
        accent: 'from-indigo-400/80 via-violet-500/80 to-emerald-400/80',
        bg: 'bg-gradient-to-br from-[#0b0f1a] via-[#0b0c16] to-[#0a0f12]',
        bullets: ['Lesson & study kits', 'Classroom hubs', 'Collaborative boards'],
    },
];

const primaryAccent = 'from-violet-500 via-fuchsia-500 to-blue-400';

function ModeSection({ mode, index }) {
    return (
        <section className={clsx('relative min-h-screen snap-start', 'flex items-center justify-center px-6 py-16 md:px-12', mode.bg)} id={mode.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
            <div className='absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.04),transparent_25%)]' />
            <div className='relative grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]'>
                <div className='flex flex-col gap-6'>
                    <div className='flex items-center gap-3'>
                        <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80'>Mode {index + 1}</span>
                        <div className='h-px flex-1 bg-gradient-to-r from-white/30 via-white/10 to-transparent' />
                    </div>
                    <div className='space-y-4'>
                        <p className='text-sm font-semibold uppercase tracking-[0.2em] text-white/60'>{mode.tag}</p>
                        <h2 className='text-4xl font-semibold leading-tight text-white md:text-5xl'>{mode.title}</h2>
                        <p className='max-w-2xl text-lg leading-relaxed text-white/75'>{mode.description}</p>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                        {mode.bullets.map((item) => (
                            <span key={item} className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur'>
                                <span className='h-1.5 w-1.5 rounded-full bg-white/70' />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                <div className='relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur'>
                    <div className={clsx('h-full w-full rounded-[22px] p-8', 'bg-gradient-to-br', mode.accent)}>
                        <div className='flex h-full flex-col justify-between gap-6 text-white'>
                            <div className='flex items-center justify-between'>
                                <div className='text-sm font-semibold uppercase tracking-[0.24em]'>Dropple</div>
                                <div className='rounded-full bg-white/20 px-4 py-1 text-xs font-semibold'>Live preview</div>
                            </div>
                            <div className='space-y-4'>
                                <div className='rounded-2xl bg-white/15 p-4 backdrop-blur'>
                                    <p className='text-sm font-medium uppercase tracking-[0.18em] text-white/90'>{mode.title}</p>
                                    <p className='mt-2 text-lg font-semibold'>Design, animate, and ship faster with Dropple.</p>
                                </div>
                                <div className='grid grid-cols-2 gap-3 text-sm font-medium'>
                                    <div className='rounded-xl bg-white/15 p-3 backdrop-blur'>
                                        Snapshot
                                        <p className='text-xs text-white/80'>Creative surface</p>
                                    </div>
                                    <div className='rounded-xl bg-white/10 p-3 backdrop-blur'>
                                        Export
                                        <p className='text-xs text-white/80'>Web • Mobile</p>
                                    </div>
                                    <div className='rounded-xl bg-white/10 p-3 backdrop-blur'>
                                        Tokens
                                        <p className='text-xs text-white/80'>Brand-safe</p>
                                    </div>
                                    <div className='rounded-xl bg-white/15 p-3 backdrop-blur'>
                                        AI Assist
                                        <p className='text-xs text-white/80'>Built-in</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home() {
    return (
        <main className='h-screen overflow-y-auto bg-[#06060a] text-white snap-y snap-mandatory scroll-smooth'>
            <section className='relative isolate flex min-h-screen snap-start items-center overflow-hidden px-6 py-16 md:px-12'>
                <div className='absolute inset-0 bg-gradient-to-br from-violet-700/25 via-fuchsia-500/15 to-transparent blur-3xl' />
                <div className='relative mx-auto flex max-w-5xl flex-col gap-8 text-center'>
                    <div className='inline-flex items-center self-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur'>Dropple Creative OS</div>
                    <div className='space-y-6'>
                        <h1 className='text-5xl font-semibold leading-tight md:text-6xl'>
                            Build, design, animate, and ship—
                            <span className='bg-gradient-to-r from-violet-300 via-white to-fuchsia-300 bg-clip-text text-transparent'>without switching tools</span>
                        </h1>
                        <p className='text-lg leading-relaxed text-white/75 md:text-xl'>Eleven modes. One canvas. Dropple unifies design, video, code, AI, and docs so your team can ideate, prototype, and publish in a single creative system.</p>
                    </div>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        <a className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-900/40 transition hover:scale-[1.02] hover:shadow-violet-800/50' href='#graphic-design-mode'>
                            Explore the modes
                        </a>
                        <button className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10'>Start with a template</button>
                    </div>
                    <div className='mx-auto h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent' />
                </div>
            </section>

            <div className='snap-y snap-mandatory'>
                {modes.map((mode, idx) => (
                    <ModeSection key={mode.title} mode={mode} index={idx} />
                ))}
            </div>

            <section className='relative bg-[#06060a] px-6 py-16 md:px-12'>
                <div className='mx-auto flex max-w-5xl flex-col items-center gap-6 text-center'>
                    <div className={clsx('h-12 w-12 rounded-2xl bg-gradient-to-br', primaryAccent)} />
                    <h3 className='text-3xl font-semibold text-white md:text-4xl'>Ready to drop into Dropple?</h3>
                    <p className='max-w-2xl text-lg text-white/70'>Sign in with Stack Auth, create in any mode, and keep your brand, code, and content in sync.</p>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        <button className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-900/40 transition hover:scale-[1.02] hover:shadow-violet-800/50'>Get started</button>
                        <button className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10'>View docs</button>
                    </div>
                </div>
            </section>
        </main>
    );
}
