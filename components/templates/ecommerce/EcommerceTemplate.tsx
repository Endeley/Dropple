'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

export type EcommerceVariant =
  | 'product-card'
  | 'product-card-clean'
  | 'product-showcase'
  | 'product-showcase-lifestyle'
  | 'sale-banner'
  | 'sale-banner-fashion'
  | 'hero-banner'
  | 'email-receipt'
  | 'email-receipt-minimal'
  | 'order-confirmation'
  | 'shipping-update'
  | 'product-launch'
  | 'category-banner'
  | 'pricing-table'
  | 'pricing-table-gradient'
  | 'cart-abandonment'
  | 'product-review';

export interface EcommerceData {
  title: string;
  price: string;
  description?: string;
  bgColor: string;
  accentColor: string;
  image?: string;
}

export interface EcommerceTemplateProps {
  variant: EcommerceVariant;
  customData?: Partial<EcommerceData>;
}

const DEFAULTS: Record<EcommerceVariant, EcommerceData> = {
  'product-card': {
    title: 'Premium Product',
    price: '$99.00',
    description: 'High-quality craftsmanship',
    bgColor: '#ffffff',
    accentColor: '#1f2937',
  },
  'product-card-clean': {
    title: 'Wireless Headphones',
    price: '$129.99',
    description: 'Noise cancelling • Bluetooth 5.3',
    bgColor: '#ffffff',
    accentColor: '#16a34a',
  },
  'product-showcase': {
    title: 'Featured Collection',
    price: 'Starting at $149',
    description: 'Limited Edition',
    bgColor: '#0f172a',
    accentColor: '#ffffff',
  },
  'product-showcase-lifestyle': {
    title: 'Minimalist Backpack',
    price: '$189.00',
    description: 'Everyday carry • Weatherproof',
    bgColor: '#0f172a',
    accentColor: '#38bdf8',
  },
  'sale-banner': {
    title: 'MEGA SALE',
    price: 'UP TO 70% OFF',
    description: 'Limited Time Only',
    bgColor: '#dc2626',
    accentColor: '#ffffff',
  },
  'sale-banner-fashion': {
    title: '50% OFF New Arrivals',
    price: 'Summer Collection',
    description: 'Free shipping today only',
    bgColor: '#f43f5e',
    accentColor: '#ffffff',
  },
  'hero-banner': {
    title: 'New Arrivals',
    price: 'Shop Now',
    description: 'Discover the latest trends',
    bgColor: '#1e293b',
    accentColor: '#f59e0b',
  },
  'email-receipt': {
    title: 'Order Confirmation',
    price: 'Total: $299.00',
    description: 'Thank you for your purchase!',
    bgColor: '#ffffff',
    accentColor: '#059669',
  },
  'email-receipt-minimal': {
    title: 'Order Confirmation',
    price: 'Order #98652',
    description: 'Arriving in 3-5 business days',
    bgColor: '#f9fafb',
    accentColor: '#1e293b',
  },
  'order-confirmation': {
    title: 'Order Confirmed',
    price: 'Order #12345',
    description: 'Estimated delivery: Oct 10',
    bgColor: '#f0fdf4',
    accentColor: '#166534',
  },
  'shipping-update': {
    title: 'Package Shipped',
    price: 'Tracking #',
    description: 'Your order is on the way!',
    bgColor: '#eff6ff',
    accentColor: '#1e40af',
  },
  'product-launch': {
    title: 'COMING SOON',
    price: 'Get Notified',
    description: 'Be the first to know',
    bgColor: '#18181b',
    accentColor: '#fbbf24',
  },
  'category-banner': {
    title: 'Shop by Category',
    price: 'View All',
    description: 'Find what you need',
    bgColor: '#f8fafc',
    accentColor: '#0f172a',
  },
  'pricing-table': {
    title: 'Choose Your Plan',
    price: '$29/mo',
    description: 'Best value for professionals',
    bgColor: '#ffffff',
    accentColor: '#7c3aed',
  },
  'pricing-table-gradient': {
    title: 'Pro Plan – $29 / mo',
    price: '$29/mo',
    description: 'Cancel anytime • Unlimited projects',
    bgColor: '#ffffff',
    accentColor: '#3b82f6',
  },
  'cart-abandonment': {
    title: 'Still Thinking?',
    price: 'Complete Your Order',
    description: 'Items in your cart are waiting',
    bgColor: '#fef3c7',
    accentColor: '#92400e',
  },
  'product-review': {
    title: '⭐⭐⭐⭐⭐',
    price: '4.9/5 Rating',
    description: '1,234 verified reviews',
    bgColor: '#ffffff',
    accentColor: '#1f2937',
  },
};

export function EcommerceTemplate({ variant, customData }: EcommerceTemplateProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (['product-card', 'product-card-clean', 'product-showcase', 'product-showcase-lifestyle'].includes(variant)) {
    const textColor = data.accentColor === '#ffffff' ? data.bgColor : data.accentColor;

    return (
      <div className='h-[450px] w-[320px] overflow-hidden rounded-lg shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='flex h-3/5 items-center justify-center bg-slate-200'>
          <div className='h-32 w-32 rounded-full' style={{ backgroundColor: data.accentColor, opacity: 0.1 }} />
        </div>
        <div className='h-2/5 p-6'>
          <h3 className='mb-2 text-[18px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h3>
          <p className='mb-3 text-[14px] font-semibold' style={{ color: textColor }}>
            {data.price}
          </p>
          <p className='text-[12px] text-slate-500'>{data.description}</p>
          <button
            className='mt-4 w-full rounded-lg px-4 py-2 text-[13px] font-semibold'
            style={{ backgroundColor: data.accentColor, color: data.bgColor }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  if (['sale-banner', 'sale-banner-fashion', 'hero-banner'].includes(variant)) {
    return (
      <div
        className='flex h-[300px] w-[700px] items-center justify-center overflow-hidden rounded-lg p-12 shadow-xl'
        style={{ background: `linear-gradient(135deg, ${data.bgColor}, ${data.bgColor}dd)` }}
      >
        <div className='text-center'>
          <h1 className='mb-4 text-[56px] font-extrabold tracking-tight' style={{ color: data.accentColor }}>
            {data.title}
          </h1>
          <p className='mb-6 text-[24px] font-semibold' style={{ color: data.accentColor }}>
            {data.price}
          </p>
          <p className='text-[14px] font-medium' style={{ color: data.accentColor, opacity: 0.85 }}>
            {data.description}
          </p>
        </div>
      </div>
    );
  }

  if (['email-receipt', 'email-receipt-minimal', 'order-confirmation', 'shipping-update'].includes(variant)) {
    return (
      <div className='h-[400px] w-[500px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full' style={{ backgroundColor: data.accentColor }}>
            <span className='text-[24px]' style={{ color: data.bgColor }}>
              ✓
            </span>
          </div>
          <h2 className='mb-2 text-[24px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h2>
          <p className='mb-1 text-[14px] font-semibold' style={{ color: data.accentColor }}>
            {data.price}
          </p>
          <p className='text-[12px] text-slate-600'>{data.description}</p>
        </div>
        <div className='border-t pt-6' style={{ borderColor: data.accentColor, opacity: 0.2 }}>
          <div className='space-y-3 text-[13px] text-slate-600'>
            <div className='flex justify-between'>
              <span>Product Name</span>
              <span>$99.00</span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping</span>
              <span>$10.00</span>
            </div>
            <div className='flex justify-between border-t pt-3 text-[15px] font-bold' style={{ color: data.accentColor }}>
              <span>Total</span>
              <span>$109.00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'pricing-table' || variant === 'pricing-table-gradient') {
    return (
      <div
        className='h-[500px] w-[350px] overflow-hidden rounded-lg border-2 p-8 shadow-xl'
        style={{ backgroundColor: data.bgColor, borderColor: data.accentColor }}
      >
        <div className='mb-6 text-center'>
          <h3 className='mb-2 text-[20px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h3>
          <p className='mb-4 text-[36px] font-extrabold' style={{ color: data.accentColor }}>
            {data.price}
          </p>
          <p className='text-[13px] text-slate-600'>{data.description}</p>
        </div>
        <div className='mb-6 space-y-3'>
          {['Feature One', 'Feature Two', 'Feature Three', 'Feature Four'].map((feature) => (
            <div key={feature} className='flex items-center gap-2 text-[13px]'>
              <span style={{ color: data.accentColor }}>✓</span>
              <span className='text-slate-600'>{feature}</span>
            </div>
          ))}
        </div>
        <button
          className='w-full rounded-lg px-6 py-3 text-[14px] font-semibold text-white'
          style={{ backgroundColor: data.accentColor }}
        >
          Get Started
        </button>
      </div>
    );
  }

  if (variant === 'product-review') {
    return (
      <div className='h-[300px] w-[400px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='mb-6 text-center'>
          <p className='mb-3 text-[32px]'>{data.title}</p>
          <p className='mb-2 text-[20px] font-bold' style={{ color: data.accentColor }}>
            {data.price}
          </p>
          <p className='text-[13px] text-slate-500'>{data.description}</p>
        </div>
        <div className='space-y-3'>
          {['Excellent quality and fast shipping!', "Best purchase I've made this year."].map((quote, idx) => (
            <div key={idx} className='rounded-lg bg-slate-50 p-4'>
              <p className='text-[12px] italic text-slate-700'>&ldquo;{quote}&rdquo;</p>
              <p className='mt-1 text-[11px] text-slate-500'>- Customer</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className='flex h-[350px] w-[550px] items-center justify-center overflow-hidden rounded-lg p-12 text-center shadow-xl'
      style={{ backgroundColor: data.bgColor }}
    >
      <div>
        <h2 className='mb-4 text-[42px] font-extrabold' style={{ color: data.accentColor }}>
          {data.title}
        </h2>
        <p className='mb-6 text-[18px] font-semibold' style={{ color: data.accentColor, opacity: 0.8 }}>
          {data.description}
        </p>
        <button
          className='rounded-full px-8 py-3 text-[14px] font-semibold'
          style={{ backgroundColor: data.accentColor, color: data.bgColor }}
        >
          {data.price}
        </button>
      </div>
    </div>
  );
}
