import { templateItems } from '../../lib/constants/dashboard.constants';

export default function TemplateScroller() {
    return (
        <section className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
                <h2 className='text-base font-semibold text-slate-900 dark:text-white'>Templates</h2>
                <a href='#' className='text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-300'>
                    View all
                </a>
            </div>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6'>
                {templateItems.map((item) => (
                    <div key={item.id} className='flex h-28 flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-xs shadow-sm shadow-slate-200/40 dark:shadow-slate-950/40'>
                        <div className='h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 opacity-80 dark:from-slate-700 dark:to-slate-800' />
                        <div className='space-y-1 text-slate-500 dark:text-slate-400'>
                            <div className='h-2 w-full rounded-full bg-slate-300/80 dark:bg-slate-600/80' />
                            <div className='h-2 w-2/3 rounded-full bg-slate-200/70 dark:bg-slate-700/70' />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
