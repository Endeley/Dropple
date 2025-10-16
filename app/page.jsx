import Link from 'next/link';
import { Sparkles, ArrowUpRight } from 'lucide-react';

import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import FeaturesGrid from '../components/FeaturesGrid.jsx';
import ProCard from '../components/ProCard.jsx';
import LogosStrip from '../components/LogosStrip.jsx';
import AudienceSegments from '../components/AudienceSegments.jsx';
import Footer from '../components/Footer.jsx';

export default function HomePage() {
    return (
        <div className='min-h-screen w-full py-12 text-slate-900 transition-colors sm:py-16 lg:py-20 dark:text-slate-100'>
            <div className='mx-auto flex w-full max-w-8xl flex-col gap-12 px-6 lg:gap-16 lg:px-8'>
                <Header />
                <main
                    className='grid gap-10 rounded-[40px] border border-white/60 bg-white/95 p-8 shadow-xl shadow-slate-200/40 transition lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:p-12 dark:border-slate-800/60 dark:bg-slate-900/75 dark:shadow-slate-950/50 animate-fade-up'
                    style={{ animationDelay: '0.05s' }}>
                    <section className='flex flex-col gap-8 lg:pr-6'>
                        <Hero />
                        <FeaturesGrid />
                    </section>
                    <section className='flex flex-col gap-8'>
                        <ProCard />
                        <Link
                            href='/editor'
                            className='group relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-indigo-500/10 px-6 py-7 transition hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-200/40 dark:border-indigo-500/40 dark:from-indigo-500/20 dark:via-indigo-500/10 dark:to-indigo-500/20 dark:hover:border-indigo-400 dark:hover:shadow-indigo-500/30'
                        >
                            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_55%)] opacity-70 blur-xl transition group-hover:opacity-90 group-hover:blur-2xl dark:opacity-50' />
                            <div className='relative flex items-start justify-between gap-4'>
                                <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'>
                                    <Sparkles className='h-5 w-5' />
                                </span>
                                <ArrowUpRight className='h-5 w-5 text-indigo-400 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-indigo-500 dark:text-indigo-300 dark:group-hover:text-indigo-200' />
                            </div>
                            <div className='relative mt-4 space-y-2 text-slate-800 dark:text-slate-100'>
                                <h3 className='text-xl font-semibold leading-tight tracking-tight'>Design UI in a few clicks</h3>
                                <p className='text-sm text-slate-500 transition group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300'>
                                    Jump straight into the editor to remix templates, drag in components, and publish faster.
                                </p>
                            </div>
                            <div className='relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition group-hover:gap-3 group-hover:text-indigo-700 dark:text-indigo-300 dark:group-hover:text-indigo-200'>
                                Open editor
                                <ArrowUpRight className='h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                            </div>
                        </Link>
                        <LogosStrip />
                        <AudienceSegments />
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
}
