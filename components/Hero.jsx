export default function Hero() {
    return (
        <div className='space-y-6 animate-fade-up' id='get-started' style={{ animationDelay: '0.15s' }}>
            <div className='inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1 text-sm font-medium text-indigo-600 dark:border-indigo-400/50 dark:bg-indigo-500/10 dark:text-indigo-300'>
                <span className='h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-300' />
                Supercharge your workflow
            </div>
            <h1 className='text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white'>
                Design faster with Dropple
            </h1>
            <p className='max-w-xl text-base text-slate-600 sm:text-lg dark:text-slate-300'>
                Build stunning visuals in minutes using our templates, AI-assisted tools, and brand kits. Collaborate with your team and publish everywhere.
            </p>
            <div className='flex flex-wrap items-center gap-3 text-sm animate-fade-up' style={{ animationDelay: '0.35s' }}>
                <a
                    href='#get-started'
                    className='rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/30 transition hover:bg-indigo-600 dark:shadow-indigo-900/40'>
                    Get Started
                </a>
                <a
                    href='#features'
                    className='rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300'>
                    View Templates
                </a>
            </div>
        </div>
    );
}
