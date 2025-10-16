'use client';

export type EnterpriseVariant =
  | 'dashboard'
  | 'analytics'
  | 'analytics-overview'
  | 'executive-summary'
  | 'quarterly-report'
  | 'annual-report'
  | 'kpi-dashboard'
  | 'kpi-panel'
  | 'project-timeline'
  | 'org-chart'
  | 'swot'
  | 'roadmap'
  | 'roadmap-vision'
  | 'strategy'
  | 'architecture-layout';

export interface EnterpriseData {
  title: string;
  metric1: string;
  metric2: string;
  metric3: string;
  bgColor: string;
  accentColor: string;
}

export interface EnterpriseTemplateProps {
  variant: EnterpriseVariant;
  customData?: Partial<EnterpriseData>;
}

const DEFAULTS: Record<EnterpriseVariant, EnterpriseData> = {
  dashboard: {
    title: 'Analytics Dashboard',
    metric1: '45.2K',
    metric2: '+12.5%',
    metric3: '89%',
    bgColor: '#0f172a',
    accentColor: '#3b82f6',
  },
  analytics: {
    title: 'Analytics Report',
    metric1: 'Revenue',
    metric2: 'Growth',
    metric3: 'Users',
    bgColor: '#1e293b',
    accentColor: '#06b6d4',
  },
  'analytics-overview': {
    title: 'Monthly Performance Dashboard',
    metric1: '742K',
    metric2: '+24.8%',
    metric3: '98%',
    bgColor: '#0f172a',
    accentColor: '#38bdf8',
  },
  'executive-summary': {
    title: 'Executive Summary',
    metric1: 'Q4 2025',
    metric2: 'Performance',
    metric3: 'Overview',
    bgColor: '#18181b',
    accentColor: '#a855f7',
  },
  'quarterly-report': {
    title: 'Q4 Report 2025',
    metric1: '$2.4M',
    metric2: '+18%',
    metric3: '156K',
    bgColor: '#0c4a6e',
    accentColor: '#7dd3fc',
  },
  'annual-report': {
    title: '2025 Annual Business Report',
    metric1: '$7.8M',
    metric2: '+32%',
    metric3: '245K',
    bgColor: '#ffffff',
    accentColor: '#0ea5e9',
  },
  'kpi-dashboard': {
    title: 'KPI Metrics',
    metric1: 'Performance',
    metric2: 'Efficiency',
    metric3: 'Quality',
    bgColor: '#14532d',
    accentColor: '#86efac',
  },
  'kpi-panel': {
    title: 'Q4 Key Performance Indicators',
    metric1: 'Conversion 4.8%',
    metric2: 'Revenue +12%',
    metric3: 'Churn 1.8%',
    bgColor: '#111827',
    accentColor: '#22d3ee',
  },
  'project-timeline': {
    title: 'Project Timeline',
    metric1: 'Q1',
    metric2: 'Q2',
    metric3: 'Q3',
    bgColor: '#ffffff',
    accentColor: '#2563eb',
  },
  'org-chart': {
    title: 'Organization Chart',
    metric1: 'Leadership',
    metric2: 'Teams',
    metric3: 'Structure',
    bgColor: '#f8fafc',
    accentColor: '#0f172a',
  },
  swot: {
    title: 'SWOT Analysis',
    metric1: 'Strengths',
    metric2: 'Opportunities',
    metric3: 'Threats',
    bgColor: '#ffffff',
    accentColor: '#7c3aed',
  },
  roadmap: {
    title: 'Product Roadmap',
    metric1: '2025',
    metric2: '2026',
    metric3: '2027',
    bgColor: '#fef3c7',
    accentColor: '#92400e',
  },
  'roadmap-vision': {
    title: 'Product Roadmap 2025',
    metric1: 'Launch',
    metric2: 'Scale',
    metric3: 'Evolve',
    bgColor: '#ffffff',
    accentColor: '#0ea5e9',
  },
  strategy: {
    title: 'Strategic Plan',
    metric1: 'Vision',
    metric2: 'Mission',
    metric3: 'Goals',
    bgColor: '#1e3a8a',
    accentColor: '#dbeafe',
  },
  'architecture-layout': {
    title: 'Enterprise Architecture Overview',
    metric1: 'Platform',
    metric2: 'Integrations',
    metric3: 'Security',
    bgColor: '#f9fafb',
    accentColor: '#0f172a',
  },
};

export function EnterpriseTemplate({ variant, customData }: EnterpriseTemplateProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (['dashboard', 'analytics', 'analytics-overview', 'kpi-dashboard', 'kpi-panel', 'quarterly-report', 'annual-report'].includes(variant)) {
    const isDark = !data.bgColor.startsWith('#f');
    const textColor = isDark ? '#ffffff' : '#1f2937';

    return (
      <div className='h-[450px] w-[600px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <h1 className='mb-8 text-[28px] font-bold' style={{ color: data.accentColor }}>
          {data.title}
        </h1>
        <div className='grid grid-cols-3 gap-6'>
          {[data.metric1, data.metric2, data.metric3].map((metric, idx) => (
            <div
              key={idx}
              className='rounded-lg p-6'
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
            >
              <p className='mb-2 text-[11px] font-semibold' style={{ color: textColor, opacity: 0.6 }}>
                METRIC {idx + 1}
              </p>
              <p className='text-[24px] font-bold' style={{ color: data.accentColor }}>
                {metric}
              </p>
            </div>
          ))}
        </div>
        <div className='mt-8 h-40 rounded-lg' style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          <div className='flex h-full items-end justify-around p-4'>
            {[0.6, 0.8, 0.9, 0.7].map((height, idx) => (
              <div
                key={idx}
                className='w-12 rounded-t'
                style={{ height: `${height * 100}%`, backgroundColor: data.accentColor, opacity: 0.6 + idx * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'swot') {
    return (
      <div className='h-[550px] w-[550px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <h1 className='mb-6 text-center text-[24px] font-bold' style={{ color: data.accentColor }}>
          {data.title}
        </h1>
        <div className='grid h-[400px] grid-cols-2 gap-4'>
          {[
            { label: 'Strengths', color: '#10b981' },
            { label: 'Weaknesses', color: '#ef4444' },
            { label: 'Opportunities', color: '#3b82f6' },
            { label: 'Threats', color: '#f59e0b' },
          ].map(({ label, color }) => (
            <div key={label} className='rounded-lg border-2 p-6' style={{ borderColor: color }}>
              <h3 className='mb-3 text-[16px] font-bold' style={{ color }}>
                {label}
              </h3>
              <ul className='space-y-2 text-[11px] text-slate-600'>
                <li>• Key point one</li>
                <li>• Key point two</li>
                <li>• Key point three</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'project-timeline' || variant === 'roadmap' || variant === 'roadmap-vision') {
    return (
      <div className='h-[400px] w-[650px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <h1 className='mb-8 text-[24px] font-bold' style={{ color: data.accentColor }}>
          {data.title}
        </h1>
        <div className='relative'>
          <div className='h-1 rounded-full' style={{ backgroundColor: data.accentColor, opacity: 0.2 }} />
          <div className='absolute top-0 flex w-full justify-between'>
            {[data.metric1, data.metric2, data.metric3].map((metric) => (
              <div key={metric} className='flex flex-col items-center'>
                <div className='-mt-1.5 h-4 w-4 rounded-full' style={{ backgroundColor: data.accentColor }} />
                <p className='mt-3 text-[12px] font-semibold' style={{ color: data.accentColor }}>
                  {metric}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='mt-16 space-y-4'>
          {['Phase 1: Planning', 'Phase 2: Execution', 'Phase 3: Review'].map((phase) => (
            <div key={phase} className='rounded-lg bg-slate-50 p-4 text-[12px] font-semibold text-slate-700'>
              {phase}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'architecture-layout') {
    return (
      <div className='flex h-[420px] w-[620px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-xl'>
        <div>
          <h1 className='text-[28px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h1>
          <p className='mt-2 text-[12px] text-slate-500'>Scalable systems, resilient foundations.</p>
        </div>
        <div className='grid grid-cols-3 gap-4 text-[11px] text-slate-600'>
          {[
            { label: data.metric1, color: '#0ea5e9' },
            { label: data.metric2, color: '#22d3ee' },
            { label: data.metric3, color: '#38bdf8' },
          ].map(({ label, color }) => (
            <div key={label} className='rounded-xl border bg-white/80 p-4 shadow' style={{ borderColor: `${color}33` }}>
              <div className='mb-3 h-10 w-10 rounded-lg' style={{ backgroundColor: `${color}1a` }} />
              <p className='font-semibold' style={{ color }}>
                {label}
              </p>
              <p className='mt-1 text-[10px] text-slate-500'>System components and service ownership details.</p>
            </div>
          ))}
        </div>
        <div className='flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-[11px] text-slate-500'>
          <span>Updated: Oct 2025</span>
          <span style={{ color: data.accentColor }}>Architecture Board</span>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[450px] w-[600px] overflow-hidden rounded-lg p-12 shadow-xl' style={{ backgroundColor: data.bgColor }}>
      <div className='border-l-4 pl-6' style={{ borderColor: data.accentColor }}>
        <h1 className='mb-6 text-[36px] font-extrabold' style={{ color: data.accentColor }}>
          {data.title}
        </h1>
        <div className='space-y-4'>
          {[data.metric1, data.metric2, data.metric3].map((metric) => (
            <div key={metric}>
              <h3 className='text-[14px] font-bold' style={{ color: data.accentColor, opacity: 0.7 }}>
                {metric}
              </h3>
              <p className='mt-1 text-[12px] text-slate-600'>Strategic overview and key insights.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
