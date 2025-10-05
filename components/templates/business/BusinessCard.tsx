'use client';

import { Mail, Phone, Globe } from 'lucide-react';

export type BusinessCardVariant = 'modern' | 'classic' | 'creative';

export interface BusinessCardData {
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  company?: string;
  accentColor?: string;
}

export interface BusinessCardProps {
  variant?: BusinessCardVariant;
  customData?: Partial<BusinessCardData>;
}

const DEFAULTS: Record<BusinessCardVariant, BusinessCardData> = {
  modern: {
    name: 'Sarah Mitchell',
    title: 'Senior Product Designer',
    phone: '+1 (555) 123-4567',
    email: 'sarah.mitchell@company.com',
    website: 'www.company.com',
    accentColor: '#3b82f6',
  },
  classic: {
    name: 'James Anderson',
    title: 'Financial Advisor',
    phone: '+1 (555) 987-6543',
    email: 'james@anderson-associates.com',
    website: 'anderson-associates.com',
    company: 'Anderson & Associates',
    accentColor: '#f59e0b',
  },
  creative: {
    name: 'Alex Rivera',
    title: 'Creative Director',
    phone: '+1 (555) 246-8135',
    email: 'alex.rivera@creative.studio',
    website: 'creative.studio',
    accentColor: '#db2777',
  },
};

export function BusinessCard({ variant = 'modern', customData }: BusinessCardProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (variant === 'modern') {
    return (
      <div className='flex h-[200px] w-[350px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 shadow-xl'>
        <div>
          <div className='mb-4 h-10 w-10 rounded-lg' style={{ backgroundColor: data.accentColor }} />
          <h3 className='mb-1 text-[20px] font-bold text-white'>{data.name}</h3>
          <p className='text-[12px] font-medium text-slate-300'>{data.title}</p>
        </div>
        <div className='space-y-1 text-[10px] font-normal text-slate-300'>
          <div className='flex items-center gap-2'>
            <Phone className='h-3 w-3' />
            <span>{data.phone}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Mail className='h-3 w-3' />
            <span>{data.email}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Globe className='h-3 w-3' />
            <span>{data.website}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'classic') {
    return (
      <div className='h-[200px] w-[350px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl'>
        <div className='flex h-full'>
          <div
            className='h-full w-2'
            style={{ background: `linear-gradient(180deg, ${data.accentColor}, ${data.accentColor}aa)` }}
          />
          <div className='flex flex-1 flex-col justify-between p-6'>
            <div>
              <h3 className='mb-1 text-[20px] font-bold text-slate-900'>{data.name}</h3>
              <p className='mb-4 text-[12px] font-medium text-slate-600'>{data.title}</p>
              {data.company ? (
                <div className='text-[16px] font-bold text-amber-700'>{data.company}</div>
              ) : null}
            </div>
            <div className='space-y-1 text-[10px] text-slate-600'>
              <div>📞 {data.phone}</div>
              <div>✉️ {data.email}</div>
              <div>🌐 {data.website}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative flex h-[200px] w-[350px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-6 shadow-xl'>
      <div className='absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/10' />
      <div className='absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-white/10' />
      <div className='relative z-10'>
        <h3 className='mb-1 text-[22px] font-extrabold text-white'>{data.name}</h3>
        <p className='text-[12px] font-medium text-white/90'>{data.title}</p>
      </div>
      <div className='relative z-10 rounded-lg bg-white/20 p-3 backdrop-blur-sm'>
        <p className='text-[10px] font-medium text-white'>{data.email}</p>
        <p className='text-[10px] font-medium text-white'>{data.phone}</p>
        <p className='text-[10px] font-medium text-white'>{data.website}</p>
      </div>
    </div>
  );
}
