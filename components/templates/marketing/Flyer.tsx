'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

export type FlyerVariant =
  | 'event'
  | 'sale'
  | 'service'
  | 'restaurant'
  | 'bold-sale'
  | 'event-promo'
  | 'product-launch'
  | 'social-tech'
  | 'brochure-corporate';

export interface FlyerProps {
  variant?: FlyerVariant;
}

export function Flyer({ variant = 'event' }: FlyerProps) {
  if (variant === 'event') {
    return (
      <div className='h-[450px] w-[350px] overflow-hidden rounded-lg bg-white shadow-xl'>
        <div className='flex h-[45%] flex-col justify-center bg-gradient-to-br from-orange-400 to-pink-500 p-8'>
          <h1 className='mb-2 text-[36px] font-extrabold leading-tight text-white'>
            SUMMER
            <br />
            MUSIC FEST
          </h1>
          <p className='text-[14px] font-medium text-white/90'>3 Days of Live Music</p>
        </div>
        <div className='p-8'>
          <div className='mb-6 space-y-3 text-[13px]'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-lg'>📅</div>
              <div>
                <div className='font-semibold text-slate-900'>August 15-17, 2025</div>
                <div className='text-[11px] text-slate-600'>Friday to Sunday</div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-lg'>📍</div>
              <div>
                <div className='font-semibold text-slate-900'>Central Park Arena</div>
                <div className='text-[11px] text-slate-600'>Downtown District</div>
              </div>
            </div>
          </div>
          <div className='rounded-lg bg-slate-900 py-3 text-center text-[14px] font-bold text-white'>GET TICKETS NOW</div>
          <p className='mt-3 text-center text-[11px] text-slate-500'>Early bird pricing until July 31st</p>
        </div>
      </div>
    );
  }

  if (variant === 'sale') {
    return (
      <div className='flex h-[450px] w-[350px] flex-col justify-between overflow-hidden rounded-lg bg-yellow-400 p-8 shadow-xl'>
        <div>
          <div className='mb-6 inline-block rounded-full bg-slate-900 px-4 py-1 text-[11px] font-bold text-yellow-400'>
            LIMITED TIME OFFER
          </div>
          <h1 className='mb-3 text-[56px] font-black text-slate-900'>70%</h1>
          <h2 className='mb-4 text-[32px] font-extrabold text-slate-900'>OFF</h2>
          <p className='mb-6 text-[16px] font-medium text-slate-800'>All Winter Collection</p>
          <div className='mb-8 space-y-2 text-[13px] text-slate-800'>
            <div className='flex items-center gap-2'>✓ Free shipping on orders over $50</div>
            <div className='flex items-center gap-2'>✓ Extended returns until Jan 31</div>
            <div className='flex items-center gap-2'>✓ Gift wrapping available</div>
          </div>
        </div>
        <div>
          <div className='mb-3 rounded-lg bg-slate-900 py-4 text-center text-[14px] font-bold text-yellow-400'>SHOP NOW</div>
          <p className='text-center text-[11px] font-semibold text-slate-800'>Valid until October 31, 2025</p>
        </div>
      </div>
    );
  }

  if (variant === 'service') {
    return (
      <div className='h-[450px] w-[350px] overflow-hidden rounded-lg bg-white shadow-xl'>
        <div className='relative h-[40%]'>
          <ImageWithFallback
            src='https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU5NTIxNDg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
            alt='Office'
            className='h-full w-full object-cover'
          />
          <div className='absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white'>NEW</div>
        </div>
        <div className='p-8'>
          <h2 className='mb-3 text-[28px] font-bold text-slate-900'>Professional Consulting</h2>
          <p className='mb-6 text-[13px] leading-relaxed text-slate-600'>
            Expert business solutions tailored to your needs. We help companies grow and succeed in today&apos;s competitive market.
          </p>
          <div className='mb-6 space-y-3 text-[12px] font-medium text-slate-700'>
            <div className='flex items-center gap-2'>
              <div className='flex h-5 w-5 items-center justify-center rounded bg-blue-100'>✓</div>
              Strategic Planning
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex h-5 w-5 items-center justify-center rounded bg-blue-100'>✓</div>
              Financial Analysis
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex h-5 w-5 items-center justify-center rounded bg-blue-100'>✓</div>
              Market Research
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex-1 rounded-lg border-2 border-blue-600 py-2 text-center text-[12px] font-bold text-blue-600'>LEARN MORE</div>
            <div className='flex-1 rounded-lg bg-blue-600 py-2 text-center text-[12px] font-bold text-white'>CONTACT US</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'bold-sale') {
    return (
      <div className='flex h-[540px] w-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-2xl ring-4 ring-rose-100'>
        <div className='relative flex-1 bg-gradient-to-b from-rose-500 via-orange-400 to-yellow-300 p-8 text-center text-white'>
          <div className='absolute left-6 top-6 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest'>Limited time</div>
          <h1 className='mt-12 text-[64px] font-black drop-shadow'>Mega Sale</h1>
          <p className='mt-3 text-[18px] font-semibold text-white/90'>Up to 70% Off All Items</p>
        </div>
        <div className='space-y-4 p-8 text-center'>
          <div className='flex items-center justify-center gap-3 text-[14px] font-semibold text-rose-500'>
            <span className='rounded-full bg-rose-100 px-3 py-1 text-[12px] text-rose-600'>Free Shipping</span>
            <span className='rounded-full bg-rose-100 px-3 py-1 text-[12px] text-rose-600'>30-Day Returns</span>
          </div>
          <button className='w-full rounded-full bg-rose-500 py-3 text-[15px] font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600'>Shop Now</button>
          <p className='text-[12px] font-medium text-slate-500'>Sale ends Sunday • In-store & online</p>
        </div>
      </div>
    );
  }

  if (variant === 'event-promo') {
    return (
      <div className='flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 p-8 text-white shadow-2xl'>
        <div className='mb-8 space-y-2 text-center'>
          <span className='inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest'>Live Concert</span>
          <h1 className='text-[44px] font-black leading-tight'>Summer Jam 2025</h1>
          <p className='text-[14px] font-medium text-white/80'>Tickets Available Now!</p>
        </div>
        <div className='space-y-4 text-[13px] font-medium text-white/90'>
          <div className='rounded-xl bg-white/10 px-4 py-3'>August 18 • Downtown Arena</div>
          <div className='rounded-xl bg-white/10 px-4 py-3'>Featuring DJ Pulse • Neon Lights • Food Trucks</div>
        </div>
        <div className='mt-auto flex flex-col items-center gap-3 pt-8'>
          <button className='w-full rounded-full bg-white py-3 text-[14px] font-bold text-rose-600 shadow-lg shadow-rose-300'>Get Tickets</button>
          <p className='text-[11px] text-white/70'>Early bird pricing until July 31</p>
        </div>
      </div>
    );
  }

  if (variant === 'product-launch') {
    return (
      <div className='flex h-[320px] w-[520px] overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-2xl'>
        <div className='flex flex-1 flex-col justify-between'>
          <div>
            <span className='inline-flex rounded-full bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-300'>New Release</span>
            <h2 className='mt-5 text-[32px] font-bold text-sky-200'>Introducing Titan X Phone</h2>
            <p className='mt-3 text-[13px] text-slate-300'>Ultra-fast performance, edge-to-edge display, and the best camera we&apos;ve ever shipped.</p>
          </div>
          <div className='flex items-center gap-3 pt-6'>
            <button className='rounded-full bg-sky-500 px-5 py-2 text-[12px] font-semibold text-slate-900 shadow-lg shadow-sky-900/40 hover:bg-sky-400'>Pre-order</button>
            <span className='text-[12px] text-slate-400'>Ships October 1</span>
          </div>
        </div>
        <div className='flex h-full w-[180px] items-center justify-center rounded-xl bg-sky-500/10'>
          <div className='h-32 w-32 rounded-2xl border border-sky-500/40 bg-gradient-to-b from-sky-400/30 to-sky-500/20' />
        </div>
      </div>
    );
  }

  if (variant === 'social-tech') {
    return (
      <div className='flex h-[420px] w-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-xl'>
        <div className='space-y-3 text-center'>
          <span className='inline-flex items-center justify-center gap-2 rounded-full bg-blue-600/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-300'>
            <span className='h-2 w-2 rounded-full bg-blue-400' /> Startup Tech
          </span>
          <h1 className='text-[32px] font-bold text-blue-200'>Join the Future of Tech</h1>
          <p className='text-[13px] text-slate-300'>Collaborate with world-class engineers building the next generation of AI products.</p>
        </div>
        <div className='space-y-3 text-[12px] text-blue-200/80'>
          <div className='rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3'>Remote-first • Competitive benefits</div>
          <div className='rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3'>Series B funded • YC alumni</div>
        </div>
        <button className='mt-6 w-full rounded-full bg-blue-500 py-3 text-[13px] font-semibold text-slate-950 shadow-lg shadow-blue-500/30'>Apply Today</button>
      </div>
    );
  }

  if (variant === 'brochure-corporate') {
    return (
      <div className='flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl'>
        <div className='bg-sky-500 p-8 text-white'>
          <p className='text-[12px] font-semibold uppercase tracking-widest'>Solutions</p>
          <h1 className='mt-3 text-[30px] font-bold leading-tight'>Services &amp; Expertise</h1>
          <p className='mt-2 text-[12px] text-white/80'>Tailored strategy for modern enterprises</p>
        </div>
        <div className='space-y-4 p-8 text-[13px] text-slate-600'>
          <div className='rounded-xl border border-slate-200 p-4 shadow-sm'>
            <h3 className='text-[15px] font-semibold text-sky-600'>Consulting</h3>
            <p className='mt-1 text-[12px] text-slate-500'>Market analysis, GTM strategy, operational scaling.</p>
          </div>
          <div className='rounded-xl border border-slate-200 p-4 shadow-sm'>
            <h3 className='text-[15px] font-semibold text-sky-600'>Product Design</h3>
            <p className='mt-1 text-[12px] text-slate-500'>Experience-led design systems delivered end-to-end.</p>
          </div>
          <div className='rounded-xl border border-slate-200 p-4 shadow-sm'>
            <h3 className='text-[15px] font-semibold text-sky-600'>Engineering</h3>
            <p className='mt-1 text-[12px] text-slate-500'>Cloud-native stacks, automation, DevOps maturity.</p>
          </div>
        </div>
        <div className='bg-slate-50 px-8 py-5 text-center text-[12px] font-semibold text-sky-600'>View portfolio →</div>
      </div>
    );
  }

  return (
    <div className='h-[450px] w-[350px] overflow-hidden rounded-lg bg-white shadow-xl'>
      <div className='relative h-[45%] bg-gradient-to-br from-amber-400 to-orange-600 p-8 text-white'>
        <h1 className='mb-2 text-[36px] font-extrabold leading-tight'>FINE DINING</h1>
        <p className='text-[14px] font-medium'>Experience gourmet tastes</p>
      </div>
      <div className='p-8'>
        <p className='mb-4 text-[13px] text-slate-600'>Seasonal menu curated by award-winning chefs.</p>
        <div className='space-y-2 text-[12px] text-slate-700'>
          <div>• Chef&apos;s tasting menu</div>
          <div>• Exclusive wine pairing</div>
          <div>• Live music every weekend</div>
        </div>
        <div className='mt-6 rounded-lg bg-slate-900 py-3 text-center text-[14px] font-bold text-white'>RESERVE NOW</div>
      </div>
    </div>
  );
}
