import { recentProjects } from '../../lib/constants/dashboard.constants';

export default function RecentProjectsGrid() {
    return (
        <section className='flex flex-col gap-4'>
            <h2 className='text-base font-semibold text-slate-900 dark:text-white'>Recent Projects</h2>
            <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'>
                {recentProjects.map((project, index) => (
                    <article
                        key={`${project.title}-${index}`}
                        className='flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md dark:shadow-slate-950/40'>
                        <img src={project.image} alt={project.title} loading='lazy' className='h-36 w-full rounded-xl object-cover' />
                        <div className='text-sm font-medium text-slate-800 dark:text-slate-100'>{project.title}</div>
                    </article>
                ))}
            </div>
        </section>
    );
}
