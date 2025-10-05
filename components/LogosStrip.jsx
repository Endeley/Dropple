import { logos } from '../lib/constants/home.constants';

export default function LogosStrip() {
    return (
        <div
            className='rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-slate-200/60 transition dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/50 animate-fade-right'
            style={{ animationDelay: '0.5s' }}>
            <h3 className='text-base font-semibold text-slate-900 dark:text-white'>Trusted by modern teams</h3>
            <div className='mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-base font-medium text-slate-400 dark:text-slate-500'>
                {logos.map((logo) => (
                    <span key={logo} className='tracking-wide text-slate-400/80 dark:text-slate-500/80'>
                        {logo}
                    </span>
                ))}
            </div>
        </div>
    );
}
