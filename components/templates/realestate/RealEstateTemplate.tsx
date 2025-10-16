'use client';

export type RealEstateVariant =
    | 'listing-modern'
    | 'open-house'
    | 'agent-card'
    | 'property-carousel'
    | 'agent-banner';

type RealEstateTemplateProps = {
    variant: RealEstateVariant;
    customData?: Record<string, unknown>;
};

export function RealEstateTemplate({ variant }: RealEstateTemplateProps) {
    if (variant === 'listing-modern') {
        return (
            <div className='flex h-[360px] w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
                <div className='h-1/2 bg-slate-200' />
                <div className='flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-800'>
                    <p className='text-sm font-semibold uppercase tracking-widest text-slate-500'>3 Bed • 2 Bath • 1,850 sqft</p>
                    <p className='text-3xl font-extrabold text-emerald-500'>$549,000</p>
                    <p className='text-sm text-slate-500'>Maple Street, Austin TX</p>
                </div>
            </div>
        );
    }

    if (variant === 'open-house') {
        return (
            <div className='flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl'>
                <div className='h-1/2 bg-slate-300' />
                <div className='bg-blue-600 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white'>Open House • Sat 2–5 PM</div>
                <div className='flex flex-1 flex-col items-center justify-center gap-2 px-6 py-6 text-center text-slate-800'>
                    <p className='text-lg font-bold'>1249 Cedar Ave</p>
                    <p className='text-sm text-slate-500'>Seattle, WA</p>
                </div>
            </div>
        );
    }

    if (variant === 'agent-card') {
        return (
            <div className='flex h-[220px] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
                <div className='flex w-2/5 flex-col items-center justify-center gap-4 bg-sky-500 text-white'>
                    <div className='h-16 w-16 rounded-full bg-white/30' />
                    <p className='text-xs font-semibold uppercase tracking-wide'>For Sale</p>
                </div>
                <div className='flex flex-1 flex-col justify-center gap-1 px-6'>
                    <p className='text-lg font-bold text-slate-900'>Alex Morgan</p>
                    <p className='text-sm text-slate-500'>Licensed Realtor®</p>
                    <p className='text-xs text-slate-400'>alex@estate.com • (555) 123-4567</p>
                </div>
            </div>
        );
    }

    if (variant === 'property-carousel') {
        return (
            <div className='relative flex h-[220px] w-[400px] flex-col overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-2xl'>
                <div className='absolute inset-0 bg-slate-800/60' />
                <div className='relative flex-1 text-center'>
                    <p className='text-lg font-semibold text-sky-300'>Luxury Downtown Condo</p>
                    <p className='mt-2 text-2xl font-bold'>$1,250,000</p>
                </div>
                <div className='relative flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-white/60'>
                    <span>Prev</span>
                    <div className='flex gap-1'>
                        {[0, 1, 2].map((dot) => (
                            <span key={dot} className='h-2 w-2 rounded-full bg-white/40' />
                        ))}
                    </div>
                    <span>Next</span>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-[160px] w-[420px] items-center justify-center overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-xl'>
            <p className='text-lg font-semibold uppercase tracking-[0.4em] text-white/80'>Your Trusted Real Estate Partner</p>
        </div>
    );
}
