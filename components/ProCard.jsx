import Link from 'next/link';

export default function ProCard() {
    return (
        <div
            className='rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50 p-6 shadow-md shadow-indigo-100/70 transition dark:border-indigo-500/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 dark:shadow-indigo-950/60 animate-fade-right'
            style={{ animationDelay: '0.35s' }}>
            <span className='inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'>
                Pro
            </span>
            <h2 className='mt-4 text-2xl font-semibold text-slate-900 dark:text-white'>Upgrade to Dropple Pro</h2>
            <p className='mt-2 text-sm text-slate-600 dark:text-slate-300'>
                Unlock premium templates, advanced AI credits, and priority support for your entire team.
            </p>
            <Link
                href='/dashboard?view=pricing&plan=pro'
                className='mt-6 inline-flex w-fit items-center justify-center rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/30 transition hover:bg-indigo-600 dark:shadow-indigo-900/40'>
                Upgrade
            </Link>
        </div>
    );
}
