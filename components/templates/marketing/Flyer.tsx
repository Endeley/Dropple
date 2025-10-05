'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

export type FlyerVariant = 'event' | 'sale' | 'service' | 'restaurant';

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
