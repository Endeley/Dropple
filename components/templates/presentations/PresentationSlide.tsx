'use client';

import { BarChart3, TrendingUp, Users } from 'lucide-react';

export type PresentationVariant =
  | 'title'
  | 'content'
  | 'data'
  | 'team'
  | 'timeline'
  | 'comparison'
  | 'process'
  | 'portfolio'
  | 'testimonial'
  | 'pricing'
  | 'thankyou'
  | 'contact';

export interface PresentationSlideProps {
  variant?: PresentationVariant;
  customData?: Record<string, any>;
}

export function PresentationSlide({ variant = 'title', customData = {} }: PresentationSlideProps) {
  const data = {
    title: customData.title as string | undefined,
    subtitle: customData.subtitle as string | undefined,
    bgColor: customData.bgColor as string | undefined,
    accentColor: customData.accentColor as string | undefined,
  };

  if (variant === 'title') {
    return (
      <div
        className='h-[281px] w-[500px] overflow-hidden rounded-lg shadow-xl'
        style={{ background: data.bgColor ?? 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
      >
        <div className='flex h-full flex-col items-center justify-center p-12 text-center text-white'>
          <div className='mb-6 h-1 w-16 bg-white/50' />
          <h1 className='mb-4 text-[36px] font-extrabold leading-tight'>
            {data.title ?? 'Q4 Marketing Strategy'}
          </h1>
          <p className='mb-8 text-[16px] font-normal text-white/80'>
            {data.subtitle ?? 'Growth Plan & Key Objectives'}
          </p>
          <p className='text-[12px] font-medium text-white/60'>Presented by Marketing Team • October 2025</p>
        </div>
      </div>
    );
  }

  if (variant === 'content') {
    return (
      <div className='h-[281px] w-[500px] overflow-hidden rounded-lg bg-white p-10 shadow-xl'>
        <h2 className='mb-6 text-[24px] font-bold text-slate-900'>Key Initiatives</h2>
        <div className='space-y-4'>
          {[
            {
              icon: <Users className='h-4 w-4 text-blue-600' />,
              title: 'Audience Expansion',
              copy: 'Target 25% growth in new customer acquisition',
            },
            {
              icon: <TrendingUp className='h-4 w-4 text-purple-600' />,
              title: 'Revenue Growth',
              copy: 'Increase average order value by 15%',
            },
            {
              icon: <BarChart3 className='h-4 w-4 text-green-600' />,
              title: 'Brand Awareness',
              copy: 'Launch integrated social media campaigns',
            },
          ].map(({ icon, title, copy }) => (
            <div key={title} className='flex items-start gap-3'>
              <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100'>{icon}</div>
              <div>
                <h3 className='text-[14px] font-semibold text-slate-900'>{title}</h3>
                <p className='text-[12px] text-slate-600'>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'data') {
    return (
      <div className='h-[281px] w-[500px] overflow-hidden rounded-lg bg-slate-50 p-10 shadow-xl'>
        <h2 className='mb-6 text-[24px] font-bold text-slate-900'>Performance Metrics</h2>
        <div className='grid grid-cols-3 gap-4'>
          {[
            { value: '156%', label: 'ROI Growth', color: '#2563eb' },
            { value: '32K', label: 'New Leads', color: '#7c3aed' },
            { value: '4.8', label: 'Satisfaction', color: '#16a34a' },
          ].map(({ value, label, color }) => (
            <div key={label} className='rounded-lg bg-white p-4'>
              <div className='mb-1 text-[28px] font-bold' style={{ color }}>
                {value}
              </div>
              <div className='text-[11px] font-medium text-slate-600'>{label}</div>
            </div>
          ))}
        </div>
        <div className='mt-6 flex items-center gap-2'>
          <div className='h-2 flex-1 rounded-full bg-blue-200'>
            <div className='h-full w-3/4 rounded-full bg-blue-600' />
          </div>
          <span className='text-[11px] font-medium text-slate-600'>75% Complete</span>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[281px] w-[500px] overflow-hidden rounded-lg bg-slate-100 p-12 shadow-xl'>
      <div className='flex h-full flex-col justify-center text-center text-slate-700'>
        <p>Additional layouts (team, timeline, pricing, etc.) can be generated as needed.</p>
      </div>
    </div>
  );
}
