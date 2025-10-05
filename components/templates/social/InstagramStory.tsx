'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

export type InstagramStoryVariant = 'promo' | 'quote' | 'product';

export interface InstagramStoryProps {
  variant?: InstagramStoryVariant;
}

export function InstagramStory({ variant = 'promo' }: InstagramStoryProps) {
  if (variant === 'promo') {
    return (
      <div className='h-[355px] w-[200px] overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 shadow-xl'>
        <div className='flex h-full flex-col justify-between p-6'>
          <div className='flex items-center gap-2 text-[12px] font-semibold text-white'>
            <div className='h-8 w-8 rounded-full bg-white' />
            <span>@yourstore</span>
          </div>
          <div className='text-center text-white'>
            <div className='mb-2 text-[48px] font-extrabold leading-none'>50%</div>
            <div className='mb-4 text-[20px] font-bold'>OFF</div>
            <div className='mb-4 text-[12px]'>WEEKEND SALE</div>
            <div className='inline-block rounded-full bg-white px-4 py-2 text-[11px] font-bold text-purple-600'>SHOP NOW</div>
          </div>
          <div className='h-1' />
        </div>
      </div>
    );
  }

  if (variant === 'quote') {
    return (
      <div className='h-[355px] w-[200px] overflow-hidden rounded-2xl bg-white p-6 shadow-xl'>
        <div className='flex h-full flex-col justify-center text-center'>
          <div className='mb-4 text-[48px] text-slate-300'>&quot;</div>
          <p className='mb-4 text-[16px] font-medium leading-relaxed text-slate-800'>
            Success is not final, failure is not fatal
          </p>
          <div className='mx-auto mb-3 h-0.5 w-12 bg-slate-800' />
          <p className='text-[11px] text-slate-500'>Winston Churchill</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[355px] w-[200px] overflow-hidden rounded-2xl bg-slate-100 shadow-xl'>
      <div className='flex h-[60%] items-center justify-center bg-gradient-to-br from-amber-200 to-amber-400'>
        <ImageWithFallback
          src='https://images.unsplash.com/photo-1518757944516-6f13049afe50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzU5NTYxNTI2fDA&ixlib=rb-4.1.0&q=80&w=1080'
          alt='Product'
          className='h-full w-full object-cover'
        />
      </div>
      <div className='flex h-[40%] flex-col justify-center gap-2 p-5'>
        <h3 className='text-[16px] font-bold text-slate-900'>Morning Brew</h3>
        <p className='text-[11px] text-slate-600'>Start your day right with our premium coffee blend</p>
        <div className='text-[18px] font-bold text-slate-900'>$12.99</div>
      </div>
    </div>
  );
}
