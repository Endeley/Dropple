'use client';

export type FoodVariant = 'restaurant-ad' | 'menu-minimal' | 'story-gradient' | 'delivery-promo' | 'recipe-card';

type FoodTemplateProps = {
    variant: FoodVariant;
    customData?: Record<string, unknown>;
};

export function FoodTemplate({ variant }: FoodTemplateProps) {
    if (variant === 'restaurant-ad') {
        return (
            <div className='flex h-[340px] w-[340px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-900 p-8 text-center text-white shadow-2xl'>
                <div className='h-24 w-24 rounded-full bg-amber-400/40 backdrop-blur-sm' />
                <h1 className='mt-6 text-2xl font-extrabold text-amber-300'>Chef’s Special Tonight</h1>
                <p className='mt-2 text-sm text-white/70'>Reserve your table now</p>
            </div>
        );
    }

    if (variant === 'menu-minimal') {
        return (
            <div className='flex h-[420px] w-[320px] flex-col items-center gap-6 overflow-hidden rounded-2xl bg-slate-900 p-10 text-white shadow-2xl'>
                <h2 className='text-2xl font-semibold uppercase tracking-wide'>Today’s Menu</h2>
                <div className='w-full space-y-3 text-left text-lg font-medium text-slate-200'>
                    <p>• Truffle Pasta — $18</p>
                    <p>• Grilled Salmon — $23</p>
                    <p>• Caesar Salad — $12</p>
                </div>
            </div>
        );
    }

    if (variant === 'story-gradient') {
        return (
            <div className='flex h-[500px] w-[280px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 p-8 text-center text-white shadow-2xl'>
                <span className='text-xs font-semibold uppercase tracking-[0.3em] text-white/70'>Weekend Brunch</span>
                <h2 className='mt-6 text-3xl font-black'>Deals</h2>
                <p className='mt-4 text-sm font-semibold'>Buy 1 Get 1 Free • 10–2</p>
            </div>
        );
    }

    if (variant === 'delivery-promo') {
        return (
            <div className='flex h-[260px] w-[480px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-8 text-center text-rose-600 shadow-2xl'>
                <h2 className='text-3xl font-black'>Free Delivery</h2>
                <p className='mt-2 text-sm font-semibold text-rose-500'>Orders over $25 • Today Only</p>
            </div>
        );
    }

    return (
        <div className='flex h-[420px] w-[320px] flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-xl'>
            <div className='h-40 bg-amber-200' />
            <div className='flex flex-1 flex-col gap-3 p-6 text-slate-800'>
                <h2 className='text-xl font-extrabold text-slate-900'>Creamy Garlic Pasta</h2>
                <p className='text-sm text-slate-600'>Ingredients:</p>
                <ul className='space-y-1 text-sm text-slate-500'>
                    <li>• Pasta</li>
                    <li>• Garlic</li>
                    <li>• Cream</li>
                    <li>• Parmesan</li>
                </ul>
            </div>
        </div>
    );
}
