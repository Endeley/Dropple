import { recentProjects } from '../../lib/constants/dashboard.constants';

export default function PreviewCard() {
    const previewProject = recentProjects[0];

    return (
        <section className='flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/40'>
            <h3 className='text-base font-semibold text-slate-900 dark:text-white'>Preview</h3>
            <img src={previewProject.image} alt={previewProject.title} className='h-40 w-full rounded-2xl object-cover' />
            <div>
                <div className='text-sm font-semibold text-slate-800 dark:text-slate-100'>{previewProject.title}</div>
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>Last edited 2 hours ago</p>
            </div>
        </section>
    );
}
