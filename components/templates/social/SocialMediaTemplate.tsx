'use client';

export type SocialMediaVariant =
  | `instagram-${'fitness' | 'food' | 'business' | 'minimal' | 'fashion' | 'tech' | 'travel' | 'quotes'}`
  | `story-${'promo' | 'quote' | 'product' | 'poll' | 'countdown'}`
  | `linkedin-${'banner' | 'post'}`
  | `facebook-${'cover' | 'post'}`
  | `twitter-${'header' | 'post'}`
  | 'youtube-thumbnail'
  | 'pinterest-pin'
  | 'tiktok-cover';

export interface SocialMediaTemplateProps {
  variant: SocialMediaVariant;
  customData?: Record<string, any>;
}

export function SocialMediaTemplate({ variant, customData = {} }: SocialMediaTemplateProps) {
  if (variant.startsWith('instagram-')) {
    const type = variant.replace('instagram-', '');

    const defaults: Record<string, any> = {
      fitness: {
        title: 'TRANSFORM\nYOUR BODY',
        subtitle: 'Join our 30-day challenge',
        cta: 'START NOW',
        bgColor: '#9333ea',
        accentColor: '#ec4899',
      },
      food: {
        title: 'Fresh Daily Specials',
        subtitle: 'Delicious homemade meals',
        cta: '⭐ 4.9/5',
        bgColor: '#fffbeb',
        accentColor: '#78350f',
      },
      business: {
        title: 'Grow Your\nBusiness',
        subtitle: 'Strategic solutions for entrepreneurs',
        cta: 'Learn More',
        bgColor: '#0f172a',
        accentColor: '#3b82f6',
      },
      minimal: {
        title: 'Simple & Clean',
        subtitle: 'Minimalist design',
        cta: 'EXPLORE',
        bgColor: '#ffffff',
        accentColor: '#fb923c',
      },
      fashion: {
        title: 'NEW\nCOLLECTION',
        subtitle: 'Fall/Winter 2025',
        cta: 'SHOP NOW',
        bgColor: '#fce7f3',
        accentColor: '#be123c',
      },
      tech: {
        title: 'Future Is Here',
        subtitle: 'Next-gen technology solutions',
        cta: 'Discover',
        bgColor: '#0f172a',
        accentColor: '#06b6d4',
      },
      travel: {
        title: 'EXPLORE\nTHE WORLD',
        subtitle: 'Book your adventure today',
        cta: 'Start Journey',
        bgColor: '#0369a1',
        accentColor: '#fbbf24',
      },
      quotes: {
        title: '"Dream Big"',
        subtitle: '— Start Small',
        cta: '',
        bgColor: '#f5f5f4',
        accentColor: '#292524',
      },
    };

    const data = { ...defaults[type], ...customData };

    return (
      <div className='flex h-[350px] w-[350px] flex-col justify-end overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <h2 className='mb-3 whitespace-pre-line text-[32px] font-bold leading-tight' style={{ color: data.accentColor }}>
          {data.title}
        </h2>
        <p className='mb-4 text-[14px]' style={{ color: data.accentColor, opacity: 0.8 }}>
          {data.subtitle}
        </p>
        {data.cta ? (
          <div className='inline-block rounded-full px-6 py-2 text-[14px] font-semibold' style={{ backgroundColor: data.accentColor, color: data.bgColor }}>
            {data.cta}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant.startsWith('story-')) {
    const type = variant.replace('story-', '');

    const defaults: Record<string, any> = {
      promo: { title: '50% OFF', subtitle: 'Limited Time Only', cta: 'Swipe Up', bgColor: '#dc2626', textColor: '#ffffff' },
      quote: { title: '"Success is not final"', subtitle: '— Winston Churchill', cta: '', bgColor: '#1e293b', textColor: '#ffffff' },
      product: { title: 'NEW ARRIVAL', subtitle: 'Premium Collection', cta: 'Shop Now', bgColor: '#ffffff', textColor: '#1f2937' },
      poll: { title: 'What do you prefer?', subtitle: 'Vote now!', cta: 'Option A vs Option B', bgColor: '#7c3aed', textColor: '#ffffff' },
      countdown: { title: 'LAUNCHING SOON', subtitle: '3 Days Left', cta: 'Get Notified', bgColor: '#0f172a', textColor: '#ffffff' },
    };

    const data = { ...defaults[type], ...customData };

    return (
      <div className='flex h-[300px] w-[170px] flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <h2 className='mb-2 text-[20px] font-bold text-white' style={{ color: data.textColor }}>
          {data.title}
        </h2>
        <p className='mb-3 text-[12px]' style={{ color: data.textColor, opacity: 0.9 }}>
          {data.subtitle}
        </p>
        {data.cta ? (
          <div className='inline-block rounded-full border-2 px-4 py-2 text-[11px] font-semibold' style={{ color: data.textColor, borderColor: data.textColor }}>
            {data.cta}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant.startsWith('linkedin-')) {
    const type = variant.replace('linkedin-', '');

    if (type === 'banner') {
      const data = {
        title: customData.title ?? 'Product Manager',
        subtitle: customData.subtitle ?? 'Building great products',
        bgColor: customData.bgColor ?? '#0a66c2',
      };
      return (
        <div className='flex h-[150px] w-[500px] items-center overflow-hidden rounded-lg p-6 shadow-xl' style={{ background: `linear-gradient(135deg, ${data.bgColor}, #003d7a)` }}>
          <div>
            <h2 className='mb-2 text-[28px] font-bold text-white'>{data.title}</h2>
            <p className='text-[14px] text-white/90'>{data.subtitle}</p>
          </div>
        </div>
      );
    }

    const data = {
      title: customData.title ?? 'Professional Insight',
      subtitle: customData.subtitle ?? 'Share your expertise with your network',
    };
    return (
      <div className='h-[350px] w-[350px] overflow-hidden rounded-lg bg-white p-6 shadow-xl'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700' />
          <div>
            <p className='text-[14px] font-semibold'>Your Name</p>
            <p className='text-[12px] text-slate-500'>Professional Title</p>
          </div>
        </div>
        <h3 className='mb-3 text-[18px] font-semibold'>{data.title}</h3>
        <p className='text-[14px] text-slate-600'>{data.subtitle}</p>
      </div>
    );
  }

  if (variant.startsWith('facebook-')) {
    const type = variant.replace('facebook-', '');

    if (type === 'cover') {
      const data = {
        title: customData.title ?? 'Welcome to Our Community',
        bgColor: customData.bgColor ?? '#1877f2',
      };
      return (
        <div className='flex h-[200px] w-[500px] items-center justify-center overflow-hidden rounded-lg shadow-xl' style={{ background: `linear-gradient(135deg, ${data.bgColor}, #0c5adb)` }}>
          <h2 className='text-[36px] font-bold text-white'>{data.title}</h2>
        </div>
      );
    }

    const data = {
      title: customData.title ?? 'Exciting News!',
      subtitle: customData.subtitle ?? "Share what's on your mind",
    };
    return (
      <div className='h-[300px] w-[400px] overflow-hidden rounded-lg bg-white p-6 shadow-xl'>
        <h3 className='mb-3 text-[20px] font-semibold'>{data.title}</h3>
        <p className='mb-4 text-[14px] text-slate-600'>{data.subtitle}</p>
        <div className='flex gap-2 text-[12px] text-slate-500'>
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>↗️ Share</span>
        </div>
      </div>
    );
  }

  if (variant.startsWith('twitter-')) {
    const type = variant.replace('twitter-', '');

    if (type === 'header') {
      const data = {
        title: customData.title ?? 'Creative Mind',
        bgColor: customData.bgColor ?? '#1da1f2',
      };
      return (
        <div className='flex h-[160px] w-[500px] items-center justify-center overflow-hidden rounded-lg shadow-xl' style={{ background: `linear-gradient(135deg, ${data.bgColor}, #0c85d0)` }}>
          <h2 className='text-[32px] font-bold text-white'>{data.title}</h2>
        </div>
      );
    }

    const data = {
      title: customData.title ?? 'Just shipped our new feature! 🚀',
      subtitle: customData.subtitle ?? 'Check it out and let us know what you think.',
    };
    return (
      <div className='h-[250px] w-[350px] overflow-hidden rounded-lg bg-white p-6 shadow-xl'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600' />
          <div>
            <p className='text-[14px] font-semibold'>Username</p>
            <p className='text-[12px] text-slate-500'>@handle</p>
          </div>
        </div>
        <p className='mb-2 text-[15px] text-slate-900'>{data.title}</p>
        <p className='text-[14px] text-slate-600'>{data.subtitle}</p>
      </div>
    );
  }

  if (variant === 'youtube-thumbnail') {
    const data = {
      title: customData.title ?? 'AMAZING TUTORIAL',
      subtitle: customData.subtitle ?? 'Step by step guide',
      bgColor: customData.bgColor ?? '#ff0000',
    };
    return (
      <div className='relative flex h-[270px] w-[480px] items-center justify-center overflow-hidden rounded-lg shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='px-8 text-center'>
          <h2 className='mb-3 text-[36px] font-extrabold text-white' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            {data.title}
          </h2>
          <p className='text-[18px] font-semibold text-white' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {data.subtitle}
          </p>
        </div>
        <div className='absolute bottom-4 right-4 rounded bg-black/80 px-2 py-1 text-[12px] text-white'>10:24</div>
      </div>
    );
  }

  if (variant === 'pinterest-pin') {
    const data = {
      title: customData.title ?? 'DIY Home Decor Ideas',
      subtitle: customData.subtitle ?? 'Transform your space',
      bgColor: customData.bgColor ?? '#e60023',
    };
    return (
      <div className='h-[354px] w-[236px] overflow-hidden rounded-2xl shadow-xl'>
        <div className='flex h-2/3 items-center justify-center px-4 text-center' style={{ backgroundColor: data.bgColor }}>
          <h3 className='text-[20px] font-bold text-white'>{data.title}</h3>
        </div>
        <div className='h-1/3 bg-white p-4'>
          <p className='text-[12px] text-slate-700'>{data.subtitle}</p>
        </div>
      </div>
    );
  }

  if (variant === 'tiktok-cover') {
    const data = {
      title: customData.title ?? 'VIRAL TREND',
      subtitle: customData.subtitle ?? 'Try this!',
      bgColor: customData.bgColor ?? '#000000',
    };
    return (
      <div className='relative h-[480px] w-[270px] overflow-hidden rounded-2xl shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='absolute bottom-0 left-0 right-0 p-6'>
          <h2 className='mb-2 text-[24px] font-bold text-white'>{data.title}</h2>
          <p className='text-[14px] text-white/90'>{data.subtitle}</p>
        </div>
      </div>
    );
  }

  return <div>Template variant not found.</div>;
}
