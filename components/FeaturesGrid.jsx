import { features } from '../lib/constants/home.constants';

export default function FeaturesGrid() {
    return (
        <section id='features' className='grid gap-4 sm:grid-cols-2'>
            {features.map((feature, index) => (
                <article
                    key={feature.title}
                    className='flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 px-5 py-6 shadow-sm shadow-slate-200/40 transition hover:-translate-y-1 hover:border-indigo-100 hover:bg-white dark:border-slate-800/70 dark:bg-slate-900/60 dark:shadow-slate-950/30 dark:hover:border-indigo-400 dark:hover:bg-slate-900 animate-fade-up cursor-pointer'
                    style={{ animationDelay: `${0.45 + index * 0.08}s` }}>
                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-xs font-semibold uppercase text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'>
                        {feature.badge}
                    </span>
                    <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>{feature.title}</h3>
                    <p className='text-sm text-slate-600 dark:text-slate-300'>{feature.description}</p>
                </article>
            ))}
        </section>
    );
}
