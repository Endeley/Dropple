'use client';

export type EnterpriseVariant =
  | 'dashboard'
  | 'analytics'
  | 'executive-summary'
  | 'quarterly-report'
  | 'kpi-dashboard'
  | 'project-timeline'
  | 'org-chart'
  | 'swot'
  | 'roadmap'
  | 'strategy';

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
  'kpi-dashboard': {
    title: 'KPI Metrics',
    metric1: 'Performance',
    metric2: 'Efficiency',
    metric3: 'Quality',
    bgColor: '#14532d',
    accentColor: '#86efac',
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
  strategy: {
    title: 'Strategic Plan',
    metric1: 'Vision',
    metric2: 'Mission',
    metric3: 'Goals',
    bgColor: '#1e3a8a',
    accentColor: '#dbeafe',
  },
};

export function EnterpriseTemplate({ variant, customData }: EnterpriseTemplateProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (['dashboard', 'analytics', 'kpi-dashboard', 'quarterly-report'].includes(variant)) {
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

  if (variant === 'project-timeline' || variant === 'roadmap') {
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
