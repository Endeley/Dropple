export default function UploadCard() {
    return (
        <section className='flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-indigo-200 bg-[var(--surface)] p-6 text-center text-sm text-slate-500 shadow-sm shadow-indigo-100/60 dark:border-indigo-500/40 dark:text-slate-300 dark:shadow-indigo-900/30'>
            <div className='grid h-16 w-16 place-items-center rounded-full bg-indigo-500/10 text-3xl text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300'>
                ☁️
            </div>
            <div className='text-base font-semibold text-slate-900 dark:text-white'>Upload</div>
            <p>Drag and drop files here</p>
            <button className='mt-2 rounded-full border border-indigo-200 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-500/10'>
                Browse
            </button>
        </section>
    );
}
