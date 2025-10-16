'use client';

export type BusinessDocumentVariant =
  | 'proposal'
  | 'proposal-project'
  | 'proposal-gradient'
  | 'letterhead'
  | 'letterhead-gray'
  | 'report'
  | 'agenda'
  | 'plan'
  | 'contract'
  | 'nda'
  | 'quote'
  | 'receipt'
  | 'press-release'
  | 'case-study'
  | 'email-signature-blue';

export interface BusinessDocumentData {
  title: string;
  subtitle?: string;
  date?: string;
  company?: string;
  bgColor: string;
  accentColor: string;
}

export interface BusinessTemplateProps {
  variant: BusinessDocumentVariant;
  customData?: Partial<BusinessDocumentData>;
}

const DEFAULTS: Record<BusinessDocumentVariant, BusinessDocumentData> = {
  proposal: {
    title: 'Business Proposal',
    subtitle: 'Project Name',
    date: 'October 2025',
    company: 'Your Company',
    bgColor: '#0f172a',
    accentColor: '#3b82f6',
  },
  'proposal-project': {
    title: 'Project Proposal',
    subtitle: 'Innovative Solutions',
    date: 'Q4 2025',
    company: 'Tech Corp',
    bgColor: '#7c3aed',
    accentColor: '#c4b5fd',
  },
  'proposal-gradient': {
    title: 'Project Proposal',
    subtitle: 'Prepared for Pelican Logistics',
    date: 'October 2025',
    company: 'Dropple Design Studio',
    bgColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    accentColor: '#e0e7ff',
  },
  letterhead: {
    title: 'Company Name',
    subtitle: '123 Business St, City, State 12345',
    date: 'October 4, 2025',
    company: '',
    bgColor: '#ffffff',
    accentColor: '#1f2937',
  },
  'letterhead-gray': {
    title: 'Pelican Group of Companies',
    subtitle: '123 Harbor Ave, Suite 500, San Francisco, CA',
    date: 'October 4, 2025',
    company: '',
    bgColor: '#f8fafc',
    accentColor: '#1e293b',
  },
  report: {
    title: 'Annual Report',
    subtitle: '2025 Performance Review',
    date: 'Year End Summary',
    company: 'Enterprise Inc',
    bgColor: '#1e293b',
    accentColor: '#f59e0b',
  },
  agenda: {
    title: 'Meeting Agenda',
    subtitle: 'Quarterly Review',
    date: 'October 15, 2025',
    company: '',
    bgColor: '#ffffff',
    accentColor: '#2563eb',
  },
  plan: {
    title: 'Business Plan',
    subtitle: 'Strategic Roadmap 2025-2030',
    date: 'Executive Summary',
    company: 'StartUp Co',
    bgColor: '#0369a1',
    accentColor: '#e0f2fe',
  },
  contract: {
    title: 'Service Agreement',
    subtitle: 'Terms & Conditions',
    date: 'Effective Date: Oct 2025',
    company: 'Legal Corp',
    bgColor: '#ffffff',
    accentColor: '#1f2937',
  },
  nda: {
    title: 'Non-Disclosure Agreement',
    subtitle: 'Confidential Information',
    date: 'Valid from Oct 2025',
    company: '',
    bgColor: '#fef3c7',
    accentColor: '#92400e',
  },
  quote: {
    title: 'Price Quotation',
    subtitle: 'Professional Services',
    date: 'Valid until: Nov 2025',
    company: 'Services Inc',
    bgColor: '#f0fdf4',
    accentColor: '#166534',
  },
  receipt: {
    title: 'Payment Receipt',
    subtitle: 'Transaction Confirmation',
    date: 'Oct 4, 2025',
    company: 'Business Name',
    bgColor: '#ffffff',
    accentColor: '#059669',
  },
  'press-release': {
    title: 'Press Release',
    subtitle: 'FOR IMMEDIATE RELEASE',
    date: 'October 4, 2025',
    company: 'Media Relations',
    bgColor: '#1e3a8a',
    accentColor: '#ffffff',
  },
  'case-study': {
    title: 'Case Study',
    subtitle: 'Client Success Story',
    date: '2025 Results',
    company: 'Consulting Group',
    bgColor: '#0c4a6e',
    accentColor: '#7dd3fc',
  },
  'email-signature-blue': {
    title: 'John Smith',
    subtitle: 'Operations Manager',
    date: '',
    company: 'Pelican Logistics Ltd.',
    bgColor: '#ffffff',
    accentColor: '#1d4ed8',
  },
};

export function BusinessTemplate({ variant, customData }: BusinessTemplateProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (variant === 'email-signature-blue') {
    return (
      <div className='flex h-[160px] w-[380px] items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-md'>
        <div className='h-24 w-24 rounded-lg bg-slate-200/70' />
        <div className='flex flex-1 flex-col justify-between'>
          <div>
            <h2 className='text-[18px] font-semibold text-slate-900'>{data.title}</h2>
            {data.subtitle ? <p className='text-[12px] text-slate-500'>{data.subtitle}</p> : null}
          </div>
          <div className='h-px w-full bg-slate-200' />
          <div className='text-[12px] font-semibold' style={{ color: data.accentColor }}>
            {data.company}
          </div>
        </div>
      </div>
    );
  }

  if (['letterhead', 'contract', 'nda', 'agenda', 'letterhead-gray'].includes(variant)) {
    return (
      <div className='h-[650px] w-[500px] overflow-hidden rounded-lg bg-white p-12 shadow-xl'>
        <div className='mb-6 border-b-2 pb-4' style={{ borderColor: data.accentColor }}>
          <h1 className='mb-2 text-[28px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h1>
          {data.subtitle ? <p className='text-[12px] text-slate-600'>{data.subtitle}</p> : null}
        </div>
        <p className='mb-6 text-[11px] text-slate-500'>{data.date}</p>
        <div className='space-y-4 text-[12px] leading-relaxed text-slate-700'>
          <p>Dear Recipient,</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
        <div className='mt-12 space-y-2'>
          <p className='text-[11px]'>Best regards,</p>
          <p className='text-[12px] font-semibold'>{data.company || 'Your Name'}</p>
        </div>
      </div>
    );
  }

  if (['receipt', 'quote'].includes(variant)) {
    return (
      <div className='h-[600px] w-[450px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='mb-6 border-b-2 pb-4' style={{ borderColor: data.accentColor }}>
          <h1 className='mb-1 text-[24px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h1>
          <p className='text-[12px] text-slate-600'>{data.subtitle}</p>
        </div>
        <div className='mb-6 text-[11px] text-slate-600'>
          <p>{data.company}</p>
          <p>{data.date}</p>
        </div>
        <div className='mb-6 space-y-3 text-[12px] text-slate-700'>
          <div className='flex justify-between'>
            <span>Item Description</span>
            <span>$0.00</span>
          </div>
          <div className='flex justify-between'>
            <span>Service Fee</span>
            <span>$0.00</span>
          </div>
        </div>
        <div className='border-t-2 pt-4' style={{ borderColor: data.accentColor }}>
          <div className='flex justify-between text-[16px] font-bold' style={{ color: data.accentColor }}>
            <span>Total</span>
            <span>$0.00</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative h-[650px] w-[500px] overflow-hidden rounded-lg shadow-xl' style={{ background: data.bgColor }}>
      <div className='absolute inset-0 flex flex-col p-12'>
        <div className='flex flex-1 items-center'>
          <div>
            <h1 className='mb-4 text-[42px] font-extrabold leading-tight' style={{ color: data.accentColor }}>
              {data.title}
            </h1>
            <h2 className='mb-3 text-[20px] font-semibold text-white/90'>{data.subtitle}</h2>
            <p className='text-[12px] font-medium text-white/70'>{data.date}</p>
          </div>
        </div>
        <div className='border-t pt-4 text-[14px] font-semibold' style={{ borderColor: data.accentColor, color: data.accentColor }}>
          {data.company}
        </div>
      </div>
    </div>
  );
}
