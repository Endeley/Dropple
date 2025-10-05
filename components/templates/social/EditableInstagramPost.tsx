'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

export type EditableInstagramVariant = 'fitness' | 'food' | 'business' | 'minimal';

export interface EditableInstagramData {
  title: string;
  subtitle: string;
  buttonText: string;
  bgColor: string;
  accentColor: string;
  image?: string;
}

export interface EditableInstagramPostProps {
  variant: EditableInstagramVariant;
  customData?: Partial<EditableInstagramData>;
}

const DEFAULTS: Record<EditableInstagramVariant, EditableInstagramData> = {
  fitness: {
    title: 'TRANSFORM\nYOUR BODY',
    subtitle: 'Join our 30-day challenge',
    buttonText: 'START NOW',
    bgColor: '#9333ea',
    accentColor: '#ec4899',
    image:
      'https://images.unsplash.com/photo-1618688862225-ac941a9da58f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dHxlbnwxfHx8fDE3NTk0OTQ2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  food: {
    title: 'Fresh Daily Specials',
    subtitle: 'Delicious homemade meals prepared with love',
    buttonText: '4.9/5',
    bgColor: '#fffbeb',
    accentColor: '#78350f',
    image:
      'https://images.unsplash.com/photo-1532980400857-e8d9d275d858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU5NDY4Nzg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  business: {
    title: 'Grow Your\nBusiness',
    subtitle: "Strategic solutions for modern entrepreneurs. Let's build something amazing together.",
    buttonText: 'Learn More',
    bgColor: '#0f172a',
    accentColor: '#3b82f6',
  },
  minimal: {
    title: 'Simple & Clean',
    subtitle: 'Minimalist design for maximum impact',
    buttonText: 'EXPLORE',
    bgColor: '#ffffff',
    accentColor: '#fb923c',
  },
};

export function EditableInstagramPost({ variant, customData = {} }: EditableInstagramPostProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (variant === 'fitness') {
    return (
      <div
        className='h-[350px] w-[350px] overflow-hidden rounded-lg shadow-xl'
        style={{ background: `linear-gradient(135deg, ${data.bgColor}, ${data.accentColor})` }}
      >
        <div className='relative h-full'>
          {data.image ? (
            <ImageWithFallback src={data.image} alt='Fitness' className='h-full w-full object-cover opacity-60' />
          ) : null}
          <div className='absolute inset-0 flex flex-col justify-end p-8'>
            <h2 className='mb-2 whitespace-pre-line text-[28px] font-bold leading-tight text-white'>{data.title}</h2>
            <p className='text-[14px] text-white/90'>{data.subtitle}</p>
            <div
              className='mt-4 inline-block rounded-full bg-white px-6 py-2 text-[14px] font-semibold'
              style={{ color: data.bgColor }}
            >
              {data.buttonText}
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
          {data.image ? <ImageWithFallback src={data.image} alt='Food' className='h-full w-full object-cover' /> : null}
        </div>
        <div className='p-6' style={{ backgroundColor: data.bgColor }}>
          <h2 className='mb-2 text-[24px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h2>
          <p className='mb-3 text-[14px]' style={{ color: data.accentColor }}>
            {data.subtitle}
          </p>
          <div className='flex items-center gap-2 text-[12px] font-medium' style={{ color: data.accentColor }}>
            <span>📍 Downtown Location</span>
            <span>•</span>
            <span>⭐ {data.buttonText}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'business') {
    return (
      <div className='flex h-[350px] w-[350px] flex-col justify-between overflow-hidden rounded-lg bg-[var(--bg,#0f172a)] p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div>
          <div className='mb-6 h-12 w-12 rounded-lg' style={{ backgroundColor: data.accentColor }} />
          <h2 className='mb-3 whitespace-pre-line text-[32px] font-bold leading-tight text-white'>{data.title}</h2>
          <p className='text-[14px] text-slate-300' style={{ lineHeight: 1.6 }}>
            {data.subtitle}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex h-1 flex-1 rounded-full' style={{ backgroundColor: data.accentColor }} />
          <span className='text-[12px] font-medium text-slate-400'>{data.buttonText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-[350px] w-[350px] items-center justify-center overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
      <div className='text-center'>
        <div
          className='mx-auto mb-6 h-16 w-16 rounded-full'
          style={{ background: `linear-gradient(90deg, #fb7185, ${data.accentColor})` }}
        />
        <h2 className='mb-3 text-[28px] font-bold text-slate-900'>{data.title}</h2>
        <p className='mb-6 text-[14px] text-slate-600'>{data.subtitle}</p>
        <div className='inline-block rounded-full border-2 border-slate-900 px-6 py-2 text-[14px] font-semibold text-slate-900'>
          {data.buttonText}
        </div>
      </div>
    </div>
  );
}
