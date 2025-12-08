import clsx from 'clsx';
import { ModeSection } from '../components/modes/ModeSection';
import { modes, primaryAccent } from './modes';
import { UserButton } from '@stackframe/stack';
export default function Home() {
    return (
        <main className='h-screen overflow-y-auto bg-[#06060a] text-white snap-y snap-mandatory scroll-smooth'>
            <div className='mt-8 px-10 relative'>
                <UserButton showUserInfo={true} className='absolute top-4 right-4 mt-10' />
            </div>

            <section className='relative isolate flex min-h-screen snap-start items-center overflow-hidden px-6 py-16 md:px-12'>
                <div className='absolute inset-0 bg-linear-to-br from-violet-700/25 via-fuchsia-500/15 to-transparent blur-3xl' />

                <div className='relative mx-auto flex max-w-5xl flex-col gap-8 text-center'>
                    <div className='inline-flex items-center self-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur'>Dropple Creative OS</div>
                    <div className='space-y-6'>
                        <h1 className='text-5xl font-semibold leading-tight md:text-6xl'>
                            Build, design, animate, and ship—
                            <span className='bg-linear-to-r from-violet-300 via-white to-fuchsia-300 bg-clip-text text-transparent'>without switching tools</span>
                        </h1>
                        <p className='text-lg leading-relaxed text-white/75 md:text-xl'>Eleven modes. One canvas. Dropple unifies design, video, code, AI, and docs so your team can ideate, prototype, and publish in a single creative system.</p>
                    </div>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        <a className='inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-blue-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-900/40 transition hover:scale-[1.02] hover:shadow-violet-800/50' href='#graphic-design-mode'>
                            Explore the modes
                        </a>
                        <button className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10'>Start with a template</button>
                    </div>
                    <div className='mx-auto h-px w-24 bg-linear-to-r from-transparent via-white/40 to-transparent' />
                </div>
            </section>

            <div className='snap-y snap-mandatory'>
                {modes.map((mode, idx) => (
                    <ModeSection key={mode.title} mode={mode} index={idx} />
                ))}
            </div>

            <section className='relative bg-[#06060a] px-6 py-16 md:px-12'>
                <div className='mx-auto flex max-w-5xl flex-col items-center gap-6 text-center'>
                    <div className={clsx('h-12 w-12 rounded-2xl bg-linear-to-br', primaryAccent)} />
                    <h3 className='text-3xl font-semibold text-white md:text-4xl'>Ready to drop into Dropple?</h3>
                    <p className='max-w-2xl text-lg text-white/70'>Sign in with Stack Auth, create in any mode, and keep your brand, code, and content in sync.</p>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        <button className='inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-blue-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-900/40 transition hover:scale-[1.02] hover:shadow-violet-800/50'>Get started</button>
                        <button className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10'>View docs</button>
                    </div>
                </div>
            </section>
        </main>
    );
}
