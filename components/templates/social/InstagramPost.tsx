'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

export type InstagramPostVariant = 'fitness' | 'food' | 'business' | 'minimal';

export interface InstagramPostProps {
  variant?: InstagramPostVariant;
}

export function InstagramPost({ variant = 'fitness' }: InstagramPostProps) {
  if (variant === 'fitness') {
    return (
      <div className='h-[350px] w-[350px] overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl'>
        <div className='relative h-full'>
          <ImageWithFallback
            src='https://images.unsplash.com/photo-1618688862225-ac941a9da58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dHxlbnwxfHx8fDE3NTk0OTQ2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
            alt='Fitness'
            className='h-full w-full object-cover opacity-60'
          />
          <div className='absolute inset-0 flex flex-col justify-end p-8'>
            <h2 className='mb-2 text-[28px] font-bold leading-tight text-white'>TRANSFORM<br />YOUR BODY</h2>
            <p className='text-[14px] text-white/90'>Join our 30-day challenge</p>
            <div className='mt-4 inline-block rounded-full bg-white px-6 py-2 text-[14px] font-semibold text-purple-600'>
              START NOW
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'food') {
    return (
      <div className='h-[350px] w-[350px] overflow-hidden rounded-lg bg-white shadow-xl'>
        <div className='relative h-[60%]'>
          <ImageWithFallback
            src='https://images.unsplash.com/photo-1532980400857-e8d9d275d858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU5NDY4Nzg1fDA&ixlib=rb-4.1.0&q=80&w=1080'
            alt='Food'
            className='h-full w-full object-cover'
          />
        </div>
        <div className='bg-amber-50 p-6'>
          <h2 className='mb-2 text-[24px] font-bold text-amber-900'>Fresh Daily Specials</h2>
          <p className='mb-3 text-[14px] text-amber-800'>Delicious homemade meals prepared with love</p>
          <div className='flex items-center gap-2 text-[12px] font-medium text-amber-700'>
            <span>📍 Downtown Location</span>
            <span>•</span>
            <span>⭐ 4.9/5</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'business') {
    return (
      <div className='flex h-[350px] w-[350px] flex-col justify-between overflow-hidden rounded-lg bg-slate-900 p-8 shadow-xl'>
        <div>
          <div className='mb-6 h-12 w-12 rounded-lg bg-blue-500' />
          <h2 className='mb-3 text-[32px] font-bold leading-tight text-white'>Grow Your<br />Business</h2>
          <p className='text-[14px] text-slate-300'>Strategic solutions for modern entrepreneurs. Let&apos;s build something amazing together.</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex h-1 flex-1 rounded-full bg-blue-500' />
          <span className='text-[12px] font-medium text-slate-400'>Learn More</span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-[350px] w-[350px] items-center justify-center overflow-hidden rounded-lg bg-white p-8 shadow-xl'>
      <div className='text-center'>
        <div className='mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-r from-rose-400 to-orange-400' />
        <h2 className='mb-3 text-[28px] font-bold text-slate-900'>Simple &amp; Clean</h2>
        <p className='mb-6 text-[14px] text-slate-600'>Minimalist design for maximum impact</p>
        <div className='inline-block rounded-full border-2 border-slate-900 px-6 py-2 text-[14px] font-semibold text-slate-900'>
          EXPLORE
        </div>
      </div>
    </div>
  );
}
