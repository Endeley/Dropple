import { audienceSegments } from '../lib/constants/home.constants';

export default function AudienceSegments() {
    return (
        <div
            id='pricing'
            className='rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-md shadow-slate-200/50 transition dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:shadow-slate-950/50 animate-fade-right'
            style={{ animationDelay: '0.65s' }}>
            <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Simple pricing for everyone</h3>
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>Choose the plan that fits your needs. Cancel anytime.</p>
            <a
                href='#pricing-plans'
                className='mt-5 inline-flex w-fit items-center justify-center rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-400/30 transition hover:bg-indigo-600 dark:shadow-indigo-900/40'>
                See Pricing
            </a>
            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
                {audienceSegments.map((segment, index) => (
                    <article
                        key={segment.title}
                        className='flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/80 px-5 py-4 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-950/40 dark:hover:border-indigo-400 dark:hover:shadow-indigo-900/30 animate-fade-up cursor-pointer'
                        style={{ animationDelay: `${0.85 + index * 0.08}s` }}>
                        <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>{segment.title}</h4>
                        <p className='text-xs text-slate-600 dark:text-slate-300'>{segment.blurb}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
