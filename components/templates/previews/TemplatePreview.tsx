import { cn } from '@/lib/utils';
import type { TemplateComponentKey } from '@/lib/templates/catalogData';

type PreviewRenderer = (props: { variant?: string }) => JSX.Element;

type TemplatePreviewProps = {
    componentKey?: TemplateComponentKey;
    variant?: string;
    className?: string;
};

type ThemeVariant = {
    background: string;
    accent: string;
    text: string;
    detail?: string;
};

const FALLBACK_GRADIENTS = [
    'from-sky-400 via-cyan-400 to-indigo-500',
    'from-rose-400 via-pink-500 to-fuchsia-600',
    'from-amber-300 via-orange-400 to-rose-400',
    'from-emerald-400 via-teal-500 to-cyan-500',
    'from-slate-300 via-slate-200 to-white',
    'from-indigo-500 via-purple-500 to-pink-500',
    'from-slate-900 via-slate-800 to-slate-900',
    'from-amber-200 via-yellow-200 to-white',
];

function gradientForVariant(id?: string) {
    if (!id) return FALLBACK_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash + id.charCodeAt(i) * (i + 1)) % FALLBACK_GRADIENTS.length;
    }
    return FALLBACK_GRADIENTS[hash];
}

const DefaultPreview: PreviewRenderer = ({ variant }) => (
    <div
        className={cn(
            'flex h-full w-full flex-col justify-between rounded-xl bg-gradient-to-br p-4 text-slate-700 shadow-inner',
            gradientForVariant(variant)
        )}
    >
        <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-slate-600'>
            <span>Template</span>
            {variant ? <span>{formatVariantLabel(variant)}</span> : <span>Ready</span>}
        </div>
        <p className='text-sm font-semibold text-slate-800'>Start customizing this layout</p>
        <p className='text-[10px] text-slate-500'>All colors, fonts, and content can be edited inside Dropple.</p>
    </div>
);

const FallbackPreview: PreviewRenderer = ({ variant }) => <DefaultPreview variant={variant} />;

function formatVariantLabel(value: string): string {
    return value
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

const BUSINESS_CARD_THEMES: Record<string, ThemeVariant> = {
    modern: {
        background: 'from-indigo-500 via-sky-500 to-purple-600',
        accent: 'bg-white/90',
        text: 'bg-white/70',
        detail: 'bg-white/10',
    },
    'modern-blue': {
        background: 'from-blue-600 to-blue-500',
        accent: 'bg-white',
        text: 'bg-slate-800/70',
        detail: 'bg-white/30',
    },
    classic: {
        background: 'from-slate-900 to-slate-700',
        accent: 'bg-amber-400/90',
        text: 'bg-white/60',
        detail: 'bg-white/10',
    },
    creative: {
        background: 'from-orange-400 via-pink-500 to-rose-500',
        accent: 'bg-white/90',
        text: 'bg-white/70',
        detail: 'bg-white/10',
    },
};

const BUSINESS_CARD_COPY: Record<
    string,
    { initials: string; tagline: string; name: string; role: string; email: string; phone: string }
> = {
    modern: {
        initials: 'DG',
        tagline: 'Creative Strategy Lead',
        name: 'Dana Greene',
        role: 'Brand Strategist',
        email: 'dana.greene@dropple.com',
        phone: '(415) 555-0134',
    },
    'modern-blue': {
        initials: 'MK',
        tagline: 'Growth Partnerships',
        name: 'Martin Kent',
        role: 'Business Development Director',
        email: 'martin.kent@dropple.com',
        phone: '(917) 555-2046',
    },
    classic: {
        initials: 'AO',
        tagline: 'Private Client Services',
        name: 'Adele O’Neal',
        role: 'Wealth Advisor',
        email: 'adele.oneal@dropple.com',
        phone: '(212) 555-7812',
    },
    creative: {
        initials: 'LS',
        tagline: 'Visual Narrative Studio',
        name: 'Lena Santos',
        role: 'Creative Director',
        email: 'lena@studioatlas.com',
        phone: '(646) 555-0198',
    },
};

const BusinessCardPreview: PreviewRenderer = ({ variant }) => {
    const key = variant ?? 'modern';
    const theme = BUSINESS_CARD_THEMES[key] ?? BUSINESS_CARD_THEMES.modern;
    const copy = BUSINESS_CARD_COPY[key] ?? BUSINESS_CARD_COPY.modern;

    return (
        <div className={cn('relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br', theme.background)}>
            <div className='absolute inset-0 bg-white/10 mix-blend-overlay' />
            <div className='relative flex h-full flex-col justify-between p-4 text-white'>
                <div className='flex items-start justify-between'>
                    <div className='space-y-1.5'>
                        <span className='text-[10px] uppercase tracking-[0.35em] text-white/70'>{copy.tagline}</span>
                        <h3 className='text-lg font-semibold uppercase tracking-wide'>{copy.name}</h3>
                        <p className='text-xs text-white/80'>{copy.role}</p>
                    </div>
                    <div className='rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide'>{copy.initials}</div>
                </div>
                <div className='space-y-2 text-[11px] leading-snug text-white/80'>
                    <div className={cn('inline-flex rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-widest', theme.accent)}>
                        {copy.tagline}
                    </div>
                    <p>{copy.email}</p>
                    <p>{copy.phone}</p>
                </div>
                <div className='flex items-center justify-between text-[10px] text-white/70'>
                    <span>dropple.com</span>
                    <span className={cn('rounded-full px-2 py-[3px] text-[9px] uppercase tracking-widest', theme.detail ?? 'bg-white/10')}>
                        Connect
                    </span>
                </div>
            </div>
        </div>
    );
};

const DOCUMENT_THEMES: Record<string, { background: string; header: string; accent: string; border: string }> = {
    proposal: {
        background: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 text-white',
        header: 'bg-indigo-500',
        accent: 'bg-indigo-100',
        border: 'border-indigo-200',
    },
    'proposal-gradient': {
        background: 'bg-gradient-to-br from-indigo-700 via-purple-600 to-fuchsia-600 text-white',
        header: 'bg-gradient-to-r from-indigo-500 via-indigo-500 to-purple-500',
        accent: 'bg-indigo-50',
        border: 'border-indigo-200',
    },
    letterhead: {
        background: 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 text-white',
        header: 'bg-emerald-500',
        accent: 'bg-emerald-100',
        border: 'border-emerald-200',
    },
    'letterhead-gray': {
        background: 'bg-gradient-to-br from-slate-200 via-slate-100 to-white',
        header: 'bg-slate-300',
        accent: 'bg-slate-100',
        border: 'border-slate-200',
    },
    'certificate-gold': {
        background: 'bg-gradient-to-br from-amber-500 via-amber-400 to-amber-200 text-white',
        header: 'bg-amber-400',
        accent: 'bg-amber-100',
        border: 'border-amber-200',
    },
    'report-card': {
        background: 'bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-300 text-white',
        header: 'bg-emerald-500',
        accent: 'bg-emerald-100',
        border: 'border-emerald-200',
    },
    'lesson-plan': {
        background: 'bg-gradient-to-br from-teal-400 via-sky-300 to-cyan-400 text-slate-900',
        header: 'bg-teal-500',
        accent: 'bg-teal-100',
        border: 'border-teal-200',
    },
    'class-schedule': {
        background: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white',
        header: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        accent: 'bg-white/70',
        border: 'border-indigo-200',
    },
    'study-guide': {
        background: 'bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 text-white',
        header: 'bg-blue-500',
        accent: 'bg-blue-100',
        border: 'border-blue-200',
    },
    quote: {
        background: 'bg-gradient-to-br from-amber-500 via-amber-400 to-amber-300 text-white',
        header: 'bg-amber-500',
        accent: 'bg-amber-100',
        border: 'border-amber-200',
    },
    receipt: {
        background: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white',
        header: 'bg-slate-800',
        accent: 'bg-slate-100',
        border: 'border-slate-200',
    },
    default: {
        background: 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 text-white',
        header: 'bg-indigo-500',
        accent: 'bg-slate-100',
        border: 'border-slate-200',
    },
};

const DOCUMENT_COPY: Record<
    string,
    { badge: string; title: string; subtitle: string; points: string[]; footer: string }
> = {
    proposal: {
        badge: 'Project Proposal',
        title: 'Q3 Campaign Expansion',
        subtitle: 'Prepared for Horizon Retail Group',
        points: ['Market launch in 12 new cities', 'Projected ROI: 162%', 'Media spend split across 4 channels'],
        footer: 'Prepared by Dropple Strategy · July 2025',
    },
    'proposal-gradient': {
        badge: 'Growth Roadmap',
        title: 'North America Expansion Plan',
        subtitle: 'Focus: Subscription, Retention, Partnerships',
        points: ['Deploy lifecycle nurture journeys', 'Localize pricing in 3 new markets', 'Launch ambassador program'],
        footer: 'Presented by Nova Commerce · June 2025',
    },
    letterhead: {
        badge: 'Evergreen Wellness',
        title: 'Dr. Nadia Suleiman',
        subtitle: 'Holistic Care · Nutrition · Preventive Medicine',
        points: ['Clinic Hours: Mon–Sat · 8am – 6pm', 'Phone: (312) 555-4420', 'hello@evergreenwellness.co'],
        footer: '1812 Maple Street · Chicago, IL 60604',
    },
    'letterhead-gray': {
        badge: 'Design Bureau',
        title: 'Studio Document',
        subtitle: 'Project Reference · Materials & Specs',
        points: ['Client: Redwood Industries', 'Spec Version: 02.03', 'Delivery Window: 18 September'],
        footer: 'designbureau.co · +44 20 5550 9862',
    },
    'certificate-gold': {
        badge: 'Certificate of Achievement',
        title: 'Awarded to Jordan Ellis',
        subtitle: 'For completing the Digital Strategy Masterclass',
        points: ['Issued: 16 August 2025', 'Instructor: Dr. Amelia Price', 'Score: 98 / 100'],
        footer: 'Signature · Dropple Learning Programs',
    },
    'report-card': {
        badge: 'Progress Update',
        title: 'K–12 Student Performance Report',
        subtitle: 'Student: Maya Chen · Grade 6',
        points: ['Mathematics: A', 'Science: A-', 'Language Arts: B+'],
        footer: 'Prepared by Westside Academy · Term 3',
    },
    'lesson-plan': {
        badge: 'Lesson Plan',
        title: 'STEM Inquiry – Renewable Energy',
        subtitle: 'Class: Grade 7 · Duration: 75 mins',
        points: ['Objective: Explain solar energy transfer', 'Activity: Build mini solar ovens', 'Assessment: Reflection worksheet'],
        footer: 'Instructor: Mr. S. Rahman · 29 Sept 2025',
    },
    'class-schedule': {
        badge: 'Weekly Schedule',
        title: 'Brightside Academy – Fall Term',
        subtitle: 'Sessions begin 8:00 AM · Lunch 12:15 PM',
        points: ['Mon: Robotics Lab · Coding Basics', 'Wed: Creative Writing · Debate Club', 'Fri: Field Project · City Museum'],
        footer: 'Parent Portal · portal.brightside.edu',
    },
    'study-guide': {
        badge: 'Study Guide',
        title: 'Physics 201 – Exam Prep',
        subtitle: 'Chapters 5–8 · Focus: Energy & Motion',
        points: ['Key formulas on page 4', 'Practice problems: Set B', 'Office hours: Thu 2–4 PM'],
        footer: 'Professor Malik · University of Portland',
    },
    quote: {
        badge: 'Daily Quote',
        title: '“Creativity is contagious, pass it on.”',
        subtitle: '— Albert Einstein',
        points: ['Share a fresh idea today', 'Collaborate with your team', 'Keep a learning mindset'],
        footer: 'Powered by Dropple Inspiration',
    },
    receipt: {
        badge: 'Payment Receipt',
        title: 'Invoice #45902',
        subtitle: 'Billed to: Astra Labs · 8 July 2025',
        points: ['Subtotal: $3,240.00', 'Tax: $259.20', 'Amount Paid: $3,499.20'],
        footer: 'Paid via ACH · Reference: FJX2041',
    },
    default: {
        badge: 'Executive Summary',
        title: 'Quarterly Highlights – Q2 FY25',
        subtitle: 'Prepared for Dropple Leadership Team',
        points: ['Revenue up 34% quarter over quarter', 'User retention increased to 78%', 'Launched 62 new creative templates'],
        footer: 'Report generated 12 Aug 2025 · dropple.app',
    },
};

const DocumentPreview: PreviewRenderer = ({ variant }) => {
    if (variant === 'email-signature-blue') {
        return (
            <div className='flex h-full w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-inner'>
                <div className='h-16 w-16 rounded-lg bg-slate-200/80' />
                <div className='flex flex-1 flex-col justify-between'>
                    <div>
                        <div className='text-sm font-semibold text-slate-900'>John Smith</div>
                        <div className='text-xs text-slate-500'>Operations Manager</div>
                    </div>
                    <div className='h-px w-full bg-slate-200' />
                    <div className='text-xs font-semibold text-blue-600'>Pelican Logistics Ltd.</div>
                </div>
            </div>
        );
    }

    const key = variant ?? 'default';
    const theme = DOCUMENT_THEMES[key] ?? DOCUMENT_THEMES.default;
    const copy = DOCUMENT_COPY[key] ?? DOCUMENT_COPY.default;

    return (
        <div className={cn('flex h-full w-full flex-col gap-4 rounded-xl border p-4 shadow-inner', theme.border, theme.background)}>
            <div className={cn('inline-flex w-max items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white', theme.header)}>
                {copy.badge}
            </div>
            <div className='space-y-1.5'>
                <h3 className='text-base font-semibold'>{copy.title}</h3>
                <p className='text-xs text-slate-500'>{copy.subtitle}</p>
            </div>
            <div className={cn('rounded-lg px-3 py-2 text-xs text-slate-700', theme.accent)}>
                <ul className='space-y-1.5'>
                    {copy.points.map((point) => (
                        <li key={point} className='flex items-start gap-2'>
                            <span className='mt-[5px] h-1.5 w-1.5 flex-none rounded-full bg-slate-400/80' />
                            <span className='leading-snug'>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='mt-auto text-[11px] font-medium text-slate-500'>{copy.footer}</div>
        </div>
    );
};

type EnterpriseTheme = {
    background: string;
    header: string;
    accent: string;
    detail: string;
    badge: string;
    badgeText: string;
};

const ENTERPRISE_THEMES: Record<string, EnterpriseTheme> = {
    default: {
        background: 'bg-slate-900',
        header: 'text-indigo-300',
        accent: 'bg-indigo-500/20',
        detail: 'bg-slate-800',
        badge: 'bg-indigo-500/10 text-indigo-300',
        badgeText: 'Enterprise',
    },
    dashboard: {
        background: 'bg-slate-900',
        header: 'text-sky-300',
        accent: 'bg-sky-500/20',
        detail: 'bg-slate-800',
        badge: 'bg-sky-500/10 text-sky-300',
        badgeText: 'Dashboard',
    },
    analytics: {
        background: 'bg-slate-800',
        header: 'text-cyan-200',
        accent: 'bg-cyan-400/20',
        detail: 'bg-slate-700',
        badge: 'bg-cyan-400/15 text-cyan-200',
        badgeText: 'Analytics',
    },
    'analytics-overview': {
        background: 'bg-slate-950',
        header: 'text-sky-300',
        accent: 'bg-sky-400/30',
        detail: 'bg-slate-900',
        badge: 'bg-sky-400/15 text-sky-200',
        badgeText: 'Monthly',
    },
    'annual-report': {
        background: 'bg-white',
        header: 'text-sky-500',
        accent: 'bg-sky-100',
        detail: 'bg-slate-100',
        badge: 'bg-sky-500/10 text-sky-600',
        badgeText: 'Annual',
    },
    'kpi-dashboard': {
        background: 'bg-emerald-950',
        header: 'text-emerald-300',
        accent: 'bg-emerald-400/20',
        detail: 'bg-emerald-900',
        badge: 'bg-emerald-400/20 text-emerald-200',
        badgeText: 'KPIs',
    },
    'kpi-panel': {
        background: 'bg-slate-950',
        header: 'text-cyan-200',
        accent: 'bg-cyan-500/20',
        detail: 'bg-slate-900',
        badge: 'bg-cyan-500/10 text-cyan-200',
        badgeText: 'KPIs',
    },
    roadmap: {
        background: 'bg-amber-100',
        header: 'text-amber-700',
        accent: 'bg-white/80',
        detail: 'bg-white',
        badge: 'bg-amber-500/10 text-amber-600',
        badgeText: 'Roadmap',
    },
    'roadmap-vision': {
        background: 'bg-sky-50',
        header: 'text-sky-600',
        accent: 'bg-white',
        detail: 'bg-sky-100',
        badge: 'bg-sky-500/10 text-sky-500',
        badgeText: 'Vision',
    },
    'architecture-layout': {
        background: 'bg-slate-100',
        header: 'text-slate-800',
        accent: 'bg-white',
        detail: 'bg-slate-200',
        badge: 'bg-slate-800/10 text-slate-700',
        badgeText: 'Architecture',
    },
    strategy: {
        background: 'bg-indigo-950',
        header: 'text-indigo-200',
        accent: 'bg-indigo-400/20',
        detail: 'bg-indigo-900',
        badge: 'bg-indigo-400/10 text-indigo-200',
        badgeText: 'Strategy',
    },
};

const ENTERPRISE_COPY: Record<string, { headline: string; timestamp: string; metrics: { label: string; value: string }[]; summary: string; badge?: string }> = {
    default: {
        headline: 'Enterprise Metrics Overview',
        timestamp: 'Updated 2h ago',
        metrics: [
            { label: 'Revenue Run Rate', value: '$4.2M' },
            { label: 'Active Accounts', value: '18,420' },
            { label: 'Churn (90d)', value: '2.8%' },
        ],
        summary: 'Growth continues across enterprise segments with expansion revenue outperforming forecast.',
        badge: 'Enterprise',
    },
    dashboard: {
        headline: 'Operations Health Dashboard',
        timestamp: 'Refreshed 12m ago',
        metrics: [
            { label: 'Deployment Success', value: '99.6%' },
            { label: 'Avg. Response', value: '1.4h' },
            { label: 'Incidents (30d)', value: '12' },
        ],
        summary: 'Automation continues to reduce escalation time; platform stability remains above SLA.',
        badge: 'Operations',
    },
    analytics: {
        headline: 'Customer Intelligence Snapshot',
        timestamp: 'Synced 45m ago',
        metrics: [
            { label: 'NPS Score', value: '71' },
            { label: 'Monthly MAU', value: '242K' },
            { label: 'Upsell Pipeline', value: '$1.8M' },
        ],
        summary: 'Engagement lift is driven by personalization experiments across onboarding flows.',
        badge: 'Analytics',
    },
    'analytics-overview': {
        headline: 'Analytics Quarterly Overview',
        timestamp: 'Snapshot · Q3 FY25',
        metrics: [
            { label: 'Data Coverage', value: '94%' },
            { label: 'Insights Shipped', value: '128' },
            { label: 'Automation Saves', value: '412h' },
        ],
        summary: 'Product analytics now consolidated with automated KPI alerts every Monday morning.',
        badge: 'Monthly',
    },
    'annual-report': {
        headline: 'Annual Financial Report',
        timestamp: 'FY25 Finalised',
        metrics: [
            { label: 'YoY Revenue', value: '+36%' },
            { label: 'EBITDA Margin', value: '18%' },
            { label: 'Net Retention', value: '128%' },
        ],
        summary: 'Partner channels and enterprise renewals continue to underpin our year-over-year momentum.',
        badge: 'Annual',
    },
    'kpi-dashboard': {
        headline: 'Key Performance Indicators',
        timestamp: 'Week of 4 Nov',
        metrics: [
            { label: 'Support SLA Met', value: '98%' },
            { label: 'Tickets Resolved', value: '2,430' },
            { label: 'CSAT Score', value: '4.8 / 5' },
        ],
        summary: 'Customer satisfaction keeps climbing thanks to faster triage and self-serve knowledge base updates.',
        badge: 'KPIs',
    },
    'kpi-panel': {
        headline: 'Product Growth Signals',
        timestamp: 'Live Metrics',
        metrics: [
            { label: 'Feature Adoption', value: '63%' },
            { label: 'Trial → Paid', value: '41%' },
            { label: 'Active Workspaces', value: '9,812' },
        ],
        summary: 'Lifecycle messaging experiments continue to improve activation and monetization funnels.',
        badge: 'KPIs',
    },
    roadmap: {
        headline: '2026 Product Roadmap',
        timestamp: 'Review Session · Jan 12',
        metrics: [
            { label: 'Phase 1 · Foundation', value: 'Mar' },
            { label: 'Phase 2 · Scale', value: 'Jul' },
            { label: 'Phase 3 · Global', value: 'Nov' },
        ],
        summary: 'Cross-functional milestones aligned; readiness assessments for partner integrations underway.',
        badge: 'Roadmap',
    },
    'roadmap-vision': {
        headline: 'Vision 2027 Highlights',
        timestamp: 'Executive Brief',
        metrics: [
            { label: 'AI Workflows', value: 'Launch H2' },
            { label: 'Global Regions', value: '28' },
            { label: 'Sustainability Rating', value: 'A-' },
        ],
        summary: 'Long-term initiatives focus on automation, regional accessibility, and sustainability commitments.',
        badge: 'Vision',
    },
    'architecture-layout': {
        headline: 'Systems Architecture Board',
        timestamp: 'Quarterly Governance',
        metrics: [
            { label: 'Core Services', value: '17' },
            { label: 'Latency SLO', value: '95ms' },
            { label: 'Uptime', value: '99.98%' },
        ],
        summary: 'Platform resilience maintained with multi-region failover and proactive incident automation.',
        badge: 'Architecture',
    },
    strategy: {
        headline: 'Strategic Initiatives Tracker',
        timestamp: 'Governance Meeting · Q4',
        metrics: [
            { label: 'Initiatives On Track', value: '12 / 14' },
            { label: 'Resource Capacity', value: '87%' },
            { label: 'ROI Forecast', value: '1.9x' },
        ],
        summary: 'Executive priorities remain on schedule with mitigations in place for the remaining dependencies.',
        badge: 'Strategy',
    },
};

const EnterprisePreview: PreviewRenderer = ({ variant }) => {
    const key = variant ?? 'default';
    const theme = ENTERPRISE_THEMES[key] ?? ENTERPRISE_THEMES.default;
    const copy = ENTERPRISE_COPY[key] ?? ENTERPRISE_COPY.default;

    return (
        <div className={cn('flex h-full w-full flex-col overflow-hidden rounded-xl p-4 text-white shadow-inner', theme.background)}>
            <div className='flex items-center justify-between text-[10px] uppercase tracking-wide'>
                <span className={cn('rounded-full px-2 py-0.5 font-semibold', theme.badge)}>{copy.badge ?? theme.badgeText}</span>
                <span className='text-white/55'>{copy.timestamp}</span>
            </div>
            <div className={cn('mt-4 text-sm font-semibold', theme.header)}>{copy.headline}</div>
            <div className={cn('mt-3 grid grid-cols-3 gap-2 text-[10px]')}>
                {copy.metrics.map(({ label, value }) => (
                    <div key={label} className={cn('space-y-1 rounded-lg p-3', theme.accent)}>
                        <div className='text-white/65'>{label}</div>
                        <div className='text-base font-semibold text-white'>{value}</div>
                    </div>
                ))}
            </div>
            <div className={cn('mt-auto rounded-lg border border-dashed border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/80', theme.detail)}>
                {copy.summary}
            </div>
        </div>
    );
};

const REAL_ESTATE_THEMES: Record<string, { background: string; accent: string; detail: string }> = {
    default: {
        background: 'bg-white',
        accent: 'text-slate-900',
        detail: 'text-slate-500',
    },
    'listing-modern': {
        background: 'bg-white',
        accent: 'text-emerald-500',
        detail: 'text-slate-500',
    },
    'open-house': {
        background: 'bg-slate-100',
        accent: 'text-blue-600',
        detail: 'text-slate-600',
    },
    'agent-card': {
        background: 'bg-white',
        accent: 'text-slate-900',
        detail: 'text-slate-500',
    },
    'property-carousel': {
        background: 'bg-slate-900 text-white',
        accent: 'text-sky-300',
        detail: 'text-slate-300',
    },
    'agent-banner': {
        background: 'bg-slate-900 text-white',
        accent: 'text-white',
        detail: 'text-white/70',
    },
};

const REAL_ESTATE_COPY: Record<string, { specs: string; price: string; location: string }> = {
    default: {
        specs: '3 Bed • 2 Bath • 1,850 sqft',
        price: '$549,000',
        location: 'Maple Street · Austin, TX',
    },
    'listing-modern': {
        specs: 'Loft + Studio · 1,420 sqft',
        price: '$729,500',
        location: 'Williamsburg · Brooklyn, NY',
    },
    'open-house': {
        specs: 'Open House · Sat 11am – 2pm',
        price: '$1,045,000',
        location: 'Seaside Avenue · Santa Monica',
    },
    'agent-card': {
        specs: 'Meet Olivia Chen · Senior Broker',
        price: '(415) 555-2290',
        location: 'olivia@coastlinerealty.com',
    },
    'property-carousel': {
        specs: 'Skyline Penthouse',
        price: '$1,250,000',
        location: 'Harbor District · Seattle',
    },
    'agent-banner': {
        specs: 'Your Trusted Real Estate Partner',
        price: '15 Years · 420+ closings',
        location: 'Schedule a private tour today',
    },
};

const RealEstatePreview: PreviewRenderer = ({ variant }) => {
    const key = variant ?? 'default';
    const theme = REAL_ESTATE_THEMES[key] ?? REAL_ESTATE_THEMES.default;
    const copy = REAL_ESTATE_COPY[key] ?? REAL_ESTATE_COPY.default;

    if (variant === 'agent-banner') {
        return (
            <div className='flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900 p-4 text-center text-white shadow-inner'>
                <div>
                    <p className='text-sm font-semibold uppercase tracking-[0.3em] text-white/70'>{copy.specs}</p>
                    <p className='mt-2 text-xs text-white/60'>{copy.price}</p>
                    <p className='text-xs text-white/50'>{copy.location}</p>
                </div>
            </div>
        );
    }

    if (variant === 'property-carousel') {
        return (
            <div className='flex h-full w-full flex-col justify-between rounded-xl bg-slate-950 p-4 text-white shadow-inner'>
                <div className='text-center'>
                    <p className='text-xs uppercase tracking-[0.4em] text-sky-200/80'>{copy.specs}</p>
                    <p className='mt-2 text-xl font-bold text-sky-300'>{copy.price}</p>
                    <p className='text-xs text-white/70'>{copy.location}</p>
                </div>
                <div className='flex items-center justify-center gap-1 text-[10px] text-white/60'>
                    {[0, 1, 2].map((dot) => (
                        <span key={dot} className='h-1.5 w-1.5 rounded-full bg-white/40' />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex h-full w-full flex-col items-center justify-center rounded-xl p-4 text-center shadow-inner', theme.background)}>
            <p className={cn('text-xs font-semibold uppercase tracking-[0.35em]', theme.detail)}>{copy.specs}</p>
            <p className={cn('mt-2 text-2xl font-extrabold', theme.accent)}>{copy.price}</p>
            <p className={cn('mt-1 text-xs', theme.detail)}>{copy.location}</p>
        </div>
    );
};

const FOOD_THEMES: Record<string, { background: string; accent: string; detail: string }> = {
    default: { background: 'bg-amber-50', accent: 'text-amber-600', detail: 'text-slate-600' },
    'restaurant-ad': { background: 'bg-slate-900 text-white', accent: 'text-amber-300', detail: 'text-white/70' },
    'menu-minimal': { background: 'bg-slate-900 text-white', accent: 'text-white', detail: 'text-slate-300' },
    'story-gradient': { background: 'bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 text-white', accent: 'text-white', detail: 'text-white/75' },
    'delivery-promo': { background: 'bg-white text-rose-600', accent: 'text-rose-600', detail: 'text-rose-400' },
    'recipe-card': { background: 'bg-amber-50 text-slate-900', accent: 'text-slate-900', detail: 'text-slate-500' },
};

const FoodPreview: PreviewRenderer = ({ variant }) => {
    const theme = FOOD_THEMES[variant ?? 'default'] ?? FOOD_THEMES.default;

    if (variant === 'story-gradient') {
        return (
            <div className='flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 p-4 text-center text-white shadow-inner'>
                <span className='text-[10px] uppercase tracking-[0.35em] text-white/70'>Weekend Brunch</span>
                <p className='mt-3 text-base font-bold text-white'>Buy 1 Get 1 Free</p>
            </div>
        );
    }

    if (variant === 'delivery-promo') {
        return (
            <div className='flex h-full w-full flex-col items-center justify-center rounded-xl bg-white p-4 text-center text-rose-600 shadow-inner'>
                <p className='text-lg font-black'>Free Delivery</p>
                <p className='text-xs font-semibold text-rose-400'>Orders over $25</p>
            </div>
        );
    }

    if (variant === 'menu-minimal') {
        return (
            <div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-900 p-4 text-center text-white shadow-inner'>
                <p className='text-sm font-semibold uppercase tracking-[0.3em]'>Today’s Menu</p>
                <div className='text-xs text-slate-200'>• Truffle Pasta • Grilled Salmon • Caesar Salad</div>
            </div>
        );
    }

    if (variant === 'restaurant-ad') {
        return (
            <div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-900 p-4 text-center text-white shadow-inner'>
                <p className='text-lg font-extrabold text-amber-300'>Chef’s Special Tonight</p>
                <p className='text-xs text-white/70'>Reserve your table now</p>
            </div>
        );
    }

    return (
        <div className='flex h-full w-full flex-col justify-between rounded-xl bg-amber-50 p-4 text-slate-900 shadow-inner'>
            <div className='h-16 rounded-lg bg-amber-200' />
            <div>
                <p className='text-sm font-semibold text-slate-900'>Creamy Garlic Pasta</p>
                <p className='text-xs text-slate-500'>Ingredients • Pasta • Garlic • Cream • Parmesan</p>
            </div>
        </div>
    );
};

const MEDICAL_THEMES: Record<
    string,
    { background: string; header: string; accent: string; highlight: string; footer: string }
> = {
    default: {
        background: 'bg-gradient-to-br from-cyan-100 via-white to-teal-50',
        header: 'text-cyan-700',
        accent: 'text-slate-600',
        highlight: 'text-emerald-600',
        footer: 'text-slate-500',
    },
    'clinic-flyer': {
        background: 'bg-gradient-to-br from-sky-600 via-cyan-500 to-sky-500 text-white',
        header: 'text-white',
        accent: 'text-white/85',
        highlight: 'text-amber-200',
        footer: 'text-white/70',
    },
    'wellness-poster': {
        background: 'bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-500 text-white',
        header: 'text-white',
        accent: 'text-emerald-50',
        highlight: 'text-amber-200',
        footer: 'text-white/75',
    },
    'appointment-card': {
        background: 'bg-slate-50',
        header: 'text-slate-800',
        accent: 'text-slate-600',
        highlight: 'text-sky-600',
        footer: 'text-slate-500',
    },
};

const MEDICAL_COPY: Record<
    string,
    { headline: string; subhead: string; callout: string; details: string; footer: string }
> = {
    default: {
        headline: 'Annual Health Check',
        subhead: 'Comprehensive screening with board-certified physicians.',
        callout: 'Book your visit this week.',
        details: 'Monday – Saturday · 8am to 6pm · Same-day results available.',
        footer: 'Evergreen Medical · 112 Market Street · (312) 555-4072',
    },
    'clinic-flyer': {
        headline: 'CityCare Medical Center',
        subhead: 'Expert care, modern facilities, compassionate teams.',
        callout: '24/7 emergency clinic now open.',
        details: 'Primary care · Pediatrics · Telehealth · Pharmacy on site.',
        footer: 'Call (415) 555-2040 · citycare.health',
    },
    'wellness-poster': {
        headline: 'Wellness Weekend Retreat',
        subhead: 'Mindfulness, nutrition coaching, and guided movement classes.',
        callout: 'Reserve your spot · Limited seats',
        details: 'June 14–16 · Mountain View Lodge · All programs included.',
        footer: 'Hosted by Harmony Collective · harmonywellness.co',
    },
    'appointment-card': {
        headline: 'Appointment Reminder',
        subhead: 'Dr. Nadia Suleiman · Evergreen Wellness',
        callout: 'Tuesday · March 8 · 9:15 AM',
        details: 'Bring photo ID and insurance card · Arrive 15 minutes early.',
        footer: 'Need to reschedule? Call (312) 555-4420',
    },
};

const MedicalPreview: PreviewRenderer = ({ variant }) => {
    const key = variant ?? 'default';
    const theme = MEDICAL_THEMES[key] ?? MEDICAL_THEMES.default;
    const copy = MEDICAL_COPY[key] ?? MEDICAL_COPY.default;

    return (
        <div className={cn('flex h-full w-full flex-col justify-between rounded-xl p-4 shadow-inner', theme.background)}>
            <div>
                <p className={cn('text-[10px] uppercase tracking-[0.3em] font-semibold', theme.header)}>{copy.callout}</p>
                <h3 className={cn('mt-2 text-lg font-bold', theme.header)}>{copy.headline}</h3>
                <p className={cn('mt-1 text-xs', theme.accent)}>{copy.subhead}</p>
            </div>
            <p className={cn('text-[11px] leading-snug', theme.highlight)}>{copy.details}</p>
            <p className={cn('text-[10px] font-medium', theme.footer)}>{copy.footer}</p>
        </div>
    );
};

const TRAVEL_THEMES: Record<string, { background: string; text: string; badge: string }> = {
    default: {
        background: 'bg-gradient-to-br from-sky-400 via-cyan-400 to-indigo-500',
        text: 'text-white',
        badge: 'bg-white/25 text-white',
    },
    'travel-poster': {
        background: 'bg-gradient-to-br from-amber-400 via-orange-300 to-rose-400',
        text: 'text-slate-900',
        badge: 'bg-slate-900/10 text-slate-700',
    },
    'travel-story': {
        background: 'bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500',
        text: 'text-white',
        badge: 'bg-white/20 text-white',
    },
    'city-guide': {
        background: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
        text: 'text-white',
        badge: 'bg-sky-500/20 text-sky-200',
    },
};

const TRAVEL_COPY: Record<string, { destination: string; highlight: string; message: string; cta: string }> = {
    default: {
        destination: 'Explore Bali',
        highlight: 'Sunrise treks · Coral reefs · Local cuisine',
        message: '7-day curated adventures with boutique stays and guided experiences.',
        cta: 'Secure your escape today',
    },
    'travel-poster': {
        destination: 'Santorini Escape',
        highlight: 'Caldera sunsets · Cliffside villas · Olive grove tours',
        message: 'Limited seasonal packages with private guide and tasting sessions.',
        cta: 'Book your island getaway',
    },
    'travel-story': {
        destination: 'Adventure Awaits!',
        highlight: 'Glacier kayaking · Night sky tours · Cozy mountain lodges',
        message: 'Share your itinerary and inspire your crew to travel boldly.',
        cta: 'Tap to plan',
    },
    'city-guide': {
        destination: 'Paris City Guide',
        highlight: 'Art walks · Café culture · Riverside cycling',
        message: 'Download the insider map with must-try spots curated by locals.',
        cta: 'Start your journey',
    },
};

const TravelPreview: PreviewRenderer = ({ variant }) => {
    const key = variant ?? 'default';
    const theme = TRAVEL_THEMES[key] ?? TRAVEL_THEMES.default;
    const copy = TRAVEL_COPY[key] ?? TRAVEL_COPY.default;

    return (
        <div className={cn('flex h-full w-full flex-col justify-between rounded-xl p-4 shadow-inner', theme.background, theme.text)}>
            <div className='flex items-center justify-between text-[10px] uppercase tracking-[0.35em]'>
                <span>Wander More</span>
                <span>&#9992;</span>
            </div>
            <div>
                <h3 className='text-lg font-semibold'>{copy.destination}</h3>
                <p className='mt-1 text-xs opacity-80'>{copy.highlight}</p>
            </div>
            <div className='space-y-2 text-[11px] opacity-80'>
                <p>{copy.message}</p>
                <span className={cn('inline-flex rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-widest', theme.badge)}>
                    {copy.cta}
                </span>
            </div>
        </div>
    );
};

const ResumePreview: PreviewRenderer = ({ variant }) => {
    const palette: Record<string, { sidebar: string; accent: string; accentText: string }> = {
        professional: { sidebar: 'bg-slate-900', accent: 'bg-indigo-100', accentText: 'text-indigo-600' },
        creative: { sidebar: 'bg-gradient-to-b from-pink-500 to-orange-500', accent: 'bg-pink-100/80', accentText: 'text-pink-600' },
        minimal: { sidebar: 'bg-slate-200', accent: 'bg-slate-100', accentText: 'text-slate-600' },
    };
    const copy: Record<string, { name: string; role: string; summary: string; skills: string[]; contact: string[] }> = {
        professional: {
            name: 'Jamal Reese',
            role: 'Senior Product Manager',
            summary: 'Leading cross-functional teams to launch global SaaS experiences focused on growth and retention.',
            skills: ['Roadmapping & OKRs', 'Data-led experimentation', 'Stakeholder alignment'],
            contact: ['jamal.reese@dropple.com', '(917) 555-4210', 'New York, NY'],
        },
        creative: {
            name: 'Marta Castillo',
            role: 'Art Director',
            summary: 'Designing high-impact visual systems for brands in fashion, beauty, and streetwear culture.',
            skills: ['Creative direction', 'Team leadership', 'Motion & 3D'],
            contact: ['marta@studiohalo.com', '@martacreates', 'Los Angeles, CA'],
        },
        minimal: {
            name: 'Priya Desai',
            role: 'UX Researcher',
            summary: 'Translating customer insights into actionable recommendations for enterprise product teams.',
            skills: ['Qualitative research', 'Journey mapping', 'Service design'],
            contact: ['priya.desai@layered.co', '(415) 555-7832', 'Remote · PST'],
        },
    };

    const key = variant ?? 'professional';
    const theme = palette[key] ?? palette.professional;
    const content = copy[key] ?? copy.professional;

    return (
        <div className='flex h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner'>
            <div className={cn('flex w-1/3 flex-col justify-between rounded-r-xl p-4 text-white', theme.sidebar)}>
                <div className='space-y-2'>
                    <div className='h-12 w-12 rounded-full bg-white/25' />
                    <h3 className='text-sm font-semibold'>{content.name}</h3>
                    <p className='text-xs text-white/70'>{content.role}</p>
                </div>
                <div className='space-y-1 text-[10px] text-white/70'>
                    {content.contact.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </div>
            <div className='flex flex-1 flex-col gap-3 p-4'>
                <div className={cn('inline-flex w-max rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider', theme.accent, theme.accentText)}>
                    Profile Summary
                </div>
                <p className='text-[11px] leading-snug text-slate-600'>{content.summary}</p>
                <div>
                    <p className='text-xs font-semibold text-slate-800'>Core Strengths</p>
                    <ul className='mt-1 space-y-1 text-[10px] text-slate-500'>
                        {content.skills.map((skill) => (
                            <li key={skill}>• {skill}</li>
                        ))}
                    </ul>
                </div>
                <div className='mt-auto text-[10px] text-slate-400'>Portfolio · dropple.app/{content.name.toLowerCase().replace(/[^a-z]+/g, '-')}</div>
            </div>
        </div>
    );
};

const POSTER_COPY: Record<string, { headline: string; subheadline: string; cta: string; badge: string; badgeValue: string }> = {
    event: {
        headline: 'Innovation Summit 2025',
        subheadline: '3 days · 18 speakers · San Diego Convention Center',
        cta: 'Reserve Seat',
        badge: 'Conference',
        badgeValue: '2025',
    },
    sale: {
        headline: 'Weekend Flash Sale 60% Off',
        subheadline: 'Apparel · Lifestyle · Accessories · Ends Sunday night',
        cta: 'Claim Offer',
        badge: 'Limited',
        badgeValue: '48 Hrs',
    },
    service: {
        headline: 'Dropple Creative Studio',
        subheadline: 'Brand strategy, visual identity, and on-demand content teams',
        cta: 'Book Discovery Call',
        badge: 'Agency',
        badgeValue: 'Trusted',
    },
    'bold-sale': {
        headline: 'Last Call · 70% Off Everything',
        subheadline: 'Colorful fits, bold shapes, free returns within 30 days',
        cta: 'Shop Collection',
        badge: 'Sale',
        badgeValue: 'Final',
    },
    'event-promo': {
        headline: 'Creative Makers Festival',
        subheadline: 'Live workshops · Block party · Pop-up galleries · 27 July',
        cta: 'Get Tickets',
        badge: 'Festival',
        badgeValue: 'All Access',
    },
    'product-launch': {
        headline: 'Launch: Atlas OS 3.0',
        subheadline: 'Experience the new canvas workspace built for modern teams',
        cta: 'Try Atlas Today',
        badge: 'Launch',
        badgeValue: 'v3.0',
    },
    'social-tech': {
        headline: 'Creator Tools for AI Storytelling',
        subheadline: 'Automate edits, publish instantly, grow your audience with insights',
        cta: 'Start Free Trial',
        badge: 'Platform',
        badgeValue: 'Dropple AI',
    },
    'brochure-corporate': {
        headline: 'Northwind Consulting Group',
        subheadline: 'Infrastructure advisory for global logistics, finance, and ventures',
        cta: 'Download Overview',
        badge: 'Brochure',
        badgeValue: '2025',
    },
    'product-card-clean': {
        headline: 'Nimbus Noise-Cancelling Headphones',
        subheadline: '38h battery · Adaptive EQ · Titanium acoustic chambers',
        cta: 'Preorder Ships 21 Aug',
        badge: 'Product',
        badgeValue: 'Nimbus',
    },
    'product-showcase-lifestyle': {
        headline: 'City Backpack · Everyday Performance',
        subheadline: 'Weatherproof fabric · Modular pockets · Lifetime repair guarantee',
        cta: 'Explore Lookbook',
        badge: 'Lifestyle',
        badgeValue: 'New',
    },
    'sale-banner-fashion': {
        headline: 'Summer Runway Capsule',
        subheadline: 'Limited edition pieces designed in collaboration with Mira Sol',
        cta: 'Shop the Drop',
        badge: 'Collection',
        badgeValue: 'Mira',
    },
    'email-receipt-minimal': {
        headline: 'Digital Receipt · Order #20495',
        subheadline: 'Thank you for shopping with Solstice Supply · Delivered via email',
        cta: 'View Purchase Details',
        badge: 'Receipt',
        badgeValue: 'Sent',
    },
    'pricing-table-gradient': {
        headline: 'Choose Your Plan',
        subheadline: 'Starter, Growth, and Pro tiers for collaborative design teams',
        cta: 'Compare Features',
        badge: 'Pricing',
        badgeValue: 'Monthly',
    },
};

const PosterPreview: PreviewRenderer = ({ variant }) => {
    const palette: Record<string, string> = {
        event: 'from-indigo-500 via-purple-500 to-pink-500',
        sale: 'from-orange-500 via-amber-400 to-yellow-300',
        service: 'from-emerald-500 via-teal-500 to-cyan-500',
        'bold-sale': 'from-rose-500 via-orange-400 to-yellow-300',
        'event-promo': 'from-amber-400 via-rose-500 to-fuchsia-600',
        'product-launch': 'from-slate-900 via-slate-800 to-slate-900',
        'social-tech': 'from-slate-950 via-slate-900 to-slate-800',
        'brochure-corporate': 'from-sky-100 via-white to-slate-50',
        'product-card-clean': 'from-slate-100 via-slate-200 to-white',
        'product-showcase-lifestyle': 'from-slate-900 via-slate-800 to-slate-900',
        'sale-banner-fashion': 'from-rose-500 via-orange-400 to-amber-300',
        'email-receipt-minimal': 'from-slate-100 via-slate-200 to-white',
        'pricing-table-gradient': 'from-blue-500 via-sky-400 to-cyan-300',
    };
    const key = variant ?? 'event';
    const background = palette[key] ?? palette.event;
    const copy = POSTER_COPY[key] ?? POSTER_COPY.event;

    const isLight = key === 'brochure-corporate' || key === 'product-card-clean' || key === 'email-receipt-minimal';
    const textClass = isLight ? 'text-slate-900' : 'text-white';
    const badgeClass = isLight ? 'bg-slate-900/10 text-slate-700' : 'bg-white/20 text-white';

    return (
        <div className={cn('flex h-full w-full flex-col justify-between rounded-xl bg-gradient-to-br p-5', background, textClass)}>
            <div className='space-y-1.5'>
                <h3 className='text-lg font-bold leading-snug'>{copy.headline}</h3>
                <p className='text-xs font-medium opacity-80'>{copy.subheadline}</p>
            </div>
            <div className='text-xs font-semibold uppercase tracking-[0.3em] opacity-80'>{copy.cta}</div>
            <div className={cn('flex items-center justify-between rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest', badgeClass)}>
                <span>{copy.badge}</span>
                <span>{copy.badgeValue}</span>
            </div>
        </div>
    );
};

const InvoicePreview: PreviewRenderer = ({ variant }) => {
    if (variant === 'modern-minimal') {
        return (
            <div className='flex h-full w-full flex-col overflow-hidden rounded-xl border border-blue-200 bg-white shadow-inner'>
                <div className='bg-blue-500/90 px-3 py-2 text-white'>
                    <div className='flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide'>
                        <span>Invoice</span>
                        <span>#INV-2045</span>
                    </div>
                    <p className='mt-1 text-[9px] text-blue-100/80'>Issued Aug 14 · Due Aug 28 · Net 14</p>
                </div>
                <div className='flex flex-1 flex-col gap-3 p-3 text-[10px] text-slate-600'>
                    <div className='rounded-lg border border-dashed border-blue-100 p-3'>
                        <div className='flex items-center justify-between font-semibold text-slate-800'>
                            <span>Billed To</span>
                            <span>Pelican Group LLC</span>
                        </div>
                        <p className='mt-1 text-[9px] text-slate-500'>accounts@pelicangroup.com · (312) 555-4409</p>
                    </div>
                    <div className='rounded-lg border border-slate-200 p-3'>
                        <div className='flex items-center justify-between text-slate-500'>
                            <span>Service</span>
                            <span className='font-semibold text-slate-800'>Amount</span>
                        </div>
                        <div className='mt-2 space-y-1.5 text-[9px]'>
                            <div className='flex items-center justify-between'>
                                <span>Creative Retainer · August</span>
                                <span>$2,800.00</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span>Campaign Assets · Sprint 12</span>
                                <span>$1,450.00</span>
                            </div>
                        </div>
                    </div>
                    <div className='mt-auto flex items-center justify-between text-[10px] font-semibold text-slate-700'>
                        <span>Total Due</span>
                        <span className='text-blue-500'>$4,250.00</span>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'gradient-header') {
        return (
            <div className='flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-inner'>
                <div className='bg-gradient-to-r from-indigo-500 to-sky-500 p-3 text-white'>
                    <div className='flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide'>
                        <span>Invoice</span>
                        <span>#2025-014</span>
                    </div>
                    <p className='mt-2 text-[9px] text-indigo-100/80'>Horizon Retail Group · VAT 55892014</p>
                </div>
                <div className='flex flex-1 flex-col gap-2 p-3 text-[10px] text-slate-500'>
                    <div className='rounded-lg border border-indigo-100/80 p-3'>
                        <div className='flex items-center justify-between font-semibold text-indigo-600'>
                            <span>Bill To</span>
                            <span>$5,250.00</span>
                        </div>
                        <p className='mt-1 text-[9px] text-slate-500'>Pelican Group · 112 Market Street · Chicago, IL</p>
                    </div>
                    <div className='flex items-center justify-between rounded-lg border border-dashed border-indigo-100 p-3 text-[9px]'>
                        <span>Due Nov 04, 2025</span>
                        <span className='rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-600'>Net 30</span>
                    </div>
                    <p className='mt-auto text-[9px] text-slate-400'>Payment via ACH · memo: INV-2025-014</p>
                </div>
            </div>
        );
    }

    if (variant === 'clean-blue') {
        return (
            <div className='flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
                <div className='bg-white px-3 py-2 text-[10px] text-slate-500'>
                    <div className='flex items-center justify-between font-semibold text-slate-800'>
                        <span>Invoice #0001</span>
                        <span>Pelican Group</span>
                    </div>
                    <p className='text-slate-400'>312 Market Street · Chicago, IL</p>
                </div>
                <div className='flex flex-1 flex-col gap-3 p-3 text-[10px] text-slate-600'>
                    <div className='rounded-lg bg-white p-3'>
                        <div className='flex items-center justify-between font-semibold text-slate-800'>
                            <span>Consulting Sprint</span>
                            <span>$2,800.00</span>
                        </div>
                        <p className='text-[9px] text-slate-400'>Strategy workshop · 2 day engagement</p>
                    </div>
                    <div className='rounded-lg bg-white p-3'>
                        <div className='flex items-center justify-between font-semibold text-slate-800'>
                            <span>Creative Retainer</span>
                            <span>$1,200.00</span>
                        </div>
                        <p className='text-[9px] text-slate-400'>Ongoing design support · August</p>
                    </div>
                    <div className='mt-auto flex items-center justify-between font-semibold text-slate-700'>
                        <span>Amount Due · Nov 01</span>
                        <span className='text-indigo-500'>$4,000.00</span>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'modern-teal') {
        return (
            <div className='flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-inner'>
                <div className='bg-teal-500 px-3 py-2 text-[10px] text-white'>
                    <div className='flex items-center justify-between font-semibold uppercase tracking-wide'>
                        <span>Invoice</span>
                        <span>#1048</span>
                    </div>
                    <p className='text-[9px] text-teal-100/80'>Issued by BrightWave Digital · brightwave.co</p>
                </div>
                <div className='flex flex-1 flex-col gap-3 p-3 text-[10px] text-slate-500'>
                    <div className='rounded-lg border border-teal-100 bg-teal-50/70 p-3 text-teal-700'>Due Nov 04, 2025 · Payment via bank transfer</div>
                    <div className='rounded-lg border border-slate-200 p-3'>
                        <div className='flex items-center justify-between text-teal-600'>
                            <span>Total Due</span>
                            <span className='text-lg font-semibold text-slate-800'>$4,850.00</span>
                        </div>
                        <div className='mt-3 space-y-1 text-[9px]'>
                            <div className='flex items-center justify-between'>
                                <span>Design Sprint · 4 days</span>
                                <span>$1,800.00</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span>Prototype Build</span>
                                <span>$2,400.00</span>
                            </div>
                            <div className='flex items-center justify-between text-slate-400'>
                                <span>Taxes</span>
                                <span>$650.00</span>
                            </div>
                        </div>
                    </div>
                    <div className='rounded-lg border border-slate-200 p-3 text-[9px] text-slate-400'>
                        Payment via ACH · Reference: INV-2025-1048
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'minimal-gray') {
        return (
            <div className='flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] text-slate-500'>
                <div className='flex items-center justify-between'>
                    <span className='font-semibold text-slate-800'>INVOICE</span>
                    <span>#4520</span>
                </div>
                <div className='mt-2 h-px w-full bg-slate-200' />
                <div className='mt-2 space-y-2'>
                    <div className='flex items-center justify-between'>
                        <span>Invoice Date</span>
                        <span className='font-semibold text-slate-800'>Oct 04</span>
                    </div>
                    <div className='flex items-center justify-between'>
                        <span>Due Date</span>
                        <span className='font-semibold text-slate-800'>Nov 04</span>
                    </div>
                </div>
                <div className='mt-auto rounded-lg border border-slate-200 bg-white p-2'>
                    <div className='flex items-center justify-between'>
                        <span>Total</span>
                        <span className='font-semibold text-slate-900'>$4,350</span>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'gradient-creative') {
        return (
            <div className='flex h-full w-full flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500 p-4 text-white shadow-inner'>
                <div className='flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest'>
                    <span>Invoice</span>
                    <span>#5729</span>
                </div>
                <div className='space-y-1 text-[10px] text-white/80'>
                    <p>Creative Studio · Mira Sol Agency</p>
                    <p>Delivery of visuals & motion assets · Project Aurora</p>
                </div>
                <div className='rounded-lg bg-white/10 p-3 text-[10px]'>
                    <div className='flex items-center justify-between text-white'>
                        <span>Total Due</span>
                        <span className='text-[13px] font-bold'>$5,500.00</span>
                    </div>
                    <p className='mt-1 text-[9px] text-white/70'>Deposit received · balance payable within 7 days</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-full w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-[10px] text-slate-600'>
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-xs font-semibold text-slate-900'>Invoice Summary</p>
                    <p className='text-[9px] text-slate-400'>Issued Oct 18 · Due Nov 18</p>
                </div>
                <span className='rounded-full bg-indigo-500/10 px-3 py-1 text-[9px] font-semibold text-indigo-600'>Draft</span>
            </div>
            <div className='rounded-lg border border-dashed border-slate-200 p-3'>
                <div className='flex items-center justify-between font-semibold text-slate-800'>
                    <span>Client</span>
                    <span>Nova Labs</span>
                </div>
                <p className='text-[9px] text-slate-400'>billing@novalabs.io · (415) 555-0940</p>
            </div>
            <div className='space-y-1 rounded-lg border border-slate-100 p-3'>
                <div className='flex items-center justify-between'>
                    <span>Brand Strategy Sprint</span>
                    <span className='font-semibold text-slate-800'>$3,200</span>
                </div>
                <div className='flex items-center justify-between text-slate-400'>
                    <span>Retainer</span>
                    <span>$1,100</span>
                </div>
            </div>
            <div className='mt-auto flex items-center justify-between font-semibold text-slate-700'>
                <span>Total</span>
                <span className='text-indigo-500'>$4,300</span>
            </div>
        </div>
    );
};

type SocialTheme = {
    wrapper: string;
    text: string;
    mutedText?: string;
    accentBlock: string;
    linePrimary: string;
    lineSecondary: string;
    pill: string;
    topLabel?: string;
    handle?: string;
    bottomLabel?: string;
    pillIcon?: string;
    headline?: string;
    subheadline?: string;
    cta?: string;
};

const SOCIAL_THEMES: Record<string, SocialTheme> = {
    default: {
        wrapper: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/40',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/60',
        pill: 'bg-white/30 text-white',
        topLabel: 'New Post',
        handle: '@dropple',
        bottomLabel: 'Swipe Up',
        headline: 'Launch your next big idea',
        subheadline: 'Share a vibrant update and drive your followers to the latest drop.',
        cta: 'Discover More',
    },
    post: {
        wrapper: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/40',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/60',
        pill: 'bg-white/30 text-white',
        headline: 'Weekly growth highlights',
        subheadline: 'Showcase metrics and wins from your latest campaign.',
        cta: 'Read Update',
    },
    story: {
        wrapper: 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-orange-400',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/30',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/50',
        pill: 'bg-white/30 text-white',
        bottomLabel: 'View',
        headline: 'Behind the scenes today',
        subheadline: 'Bring your audience into the creative process with a quick highlight.',
        cta: 'Watch Story',
    },
    'instagram-story': {
        wrapper: 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-orange-400',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/30',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/50',
        pill: 'bg-white/30 text-white',
        bottomLabel: 'View',
        headline: 'Daily drop is live',
        subheadline: 'Tap to explore the newest templates crafted for your brand.',
        cta: 'Tap to View',
    },
    'youtube-thumbnail': {
        wrapper: 'bg-slate-900',
        text: 'text-sky-200',
        mutedText: 'text-sky-200/70',
        accentBlock: 'bg-sky-500/30',
        linePrimary: 'bg-sky-400',
        lineSecondary: 'bg-sky-400/60',
        pill: 'bg-sky-400 text-slate-900',
        bottomLabel: 'Watch',
        headline: '5 tips for creators',
        subheadline: 'New video breakdown on workflow and batching content.',
        cta: 'Play Episode',
    },
    'youtube-tech': {
        wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
        text: 'text-cyan-100',
        mutedText: 'text-cyan-200/80',
        accentBlock: 'bg-cyan-400/30',
        linePrimary: 'bg-cyan-400',
        lineSecondary: 'bg-cyan-400/60',
        pill: 'bg-cyan-400 text-slate-900',
        topLabel: 'Tech Review',
        bottomLabel: 'Watch Now',
        headline: 'Testing the new Atlas workstation',
        subheadline: 'Hands-on impressions and benchmarks from our creative lab.',
        cta: 'Watch Review',
    },
    'twitter-post': {
        wrapper: 'bg-gradient-to-br from-sky-500 to-blue-500',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/30',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/60',
        pill: 'bg-white/30 text-white',
        topLabel: 'Tweet',
        handle: '@dropple',
        bottomLabel: 'Retweet',
        pillIcon: '↻',
        headline: 'Product update is live',
        subheadline: 'Thread your launch story and pin the key win for your audience.',
        cta: 'View Thread',
    },
    'twitter-quote': {
        wrapper: 'bg-slate-100 border border-slate-200',
        text: 'text-slate-900',
        mutedText: 'text-slate-500',
        accentBlock: 'bg-sky-500/20',
        linePrimary: 'bg-slate-800/70',
        lineSecondary: 'bg-slate-600/40',
        pill: 'bg-sky-500 text-white',
        topLabel: 'Quote',
        handle: '@dropple',
        bottomLabel: 'Share',
        pillIcon: '↗',
        headline: '“Design is intelligence made visible.”',
        subheadline: 'Share what inspired your team today and invite the conversation.',
        cta: 'Quote & Share',
    },
    'linkedin-banner': {
        wrapper: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900',
        text: 'text-white',
        mutedText: 'text-white/70',
        accentBlock: 'bg-white/20',
        linePrimary: 'bg-white/70',
        lineSecondary: 'bg-white/40',
        pill: 'bg-emerald-400 text-slate-900',
        topLabel: 'Business',
        bottomLabel: 'Connect',
        pillIcon: '✉️',
        headline: 'Product Manager Insights',
        subheadline: 'Share your leadership moment and invite peers to connect.',
        cta: 'Connect Today',
    },
    'linkedin-growth': {
        wrapper: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
        text: 'text-white',
        mutedText: 'text-white/70',
        accentBlock: 'bg-white/20',
        linePrimary: 'bg-emerald-400/80',
        lineSecondary: 'bg-emerald-400/50',
        pill: 'bg-emerald-400 text-slate-900',
        topLabel: 'Growth',
        bottomLabel: 'Connect',
        pillIcon: '✉️',
        headline: 'We just crossed 100K active teams',
        subheadline: 'Thank your network and outline the next bold milestone.',
        cta: 'View Story',
    },
    'tiktok-cover': {
        wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
        text: 'text-white',
        mutedText: 'text-white/60',
        accentBlock: 'bg-rose-500/40',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/50',
        pill: 'bg-rose-500 text-white',
        topLabel: 'TikTok',
        bottomLabel: 'Watch',
        pillIcon: '▶',
        headline: 'Trend breakdown in 30 seconds',
        subheadline: 'Hook your viewers with the hottest sound and a three-step tip.',
        cta: 'Play Video',
    },
    'tiktok-music': {
        wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
        text: 'text-rose-100',
        mutedText: 'text-rose-100/80',
        accentBlock: 'bg-rose-500/30',
        linePrimary: 'bg-rose-400',
        lineSecondary: 'bg-rose-400/60',
        pill: 'bg-rose-500 text-white',
        topLabel: 'New Single',
        bottomLabel: 'Listen',
        pillIcon: '♪',
        headline: 'Midnight Echo is out now',
        subheadline: 'Drop a teaser clip and direct fans to their favorite platform.',
        cta: 'Listen Now',
    },
    'facebook-restaurant': {
        wrapper: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/30',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/60',
        pill: 'bg-white/30 text-white',
        topLabel: 'Special Menu',
        bottomLabel: 'Book Table',
        pillIcon: '🍽️',
        headline: 'Weekend chef’s tasting menu',
        subheadline: 'Reserve a table and enjoy a five-course experience crafted for autumn.',
        cta: 'Reserve Table',
    },
    'pinterest-home': {
        wrapper: 'bg-gradient-to-br from-rose-100 via-amber-100 to-slate-50 border border-rose-100',
        text: 'text-slate-900',
        mutedText: 'text-slate-500',
        accentBlock: 'bg-amber-400/40',
        linePrimary: 'bg-slate-800/70',
        lineSecondary: 'bg-slate-600/40',
        pill: 'bg-slate-900 text-white',
        topLabel: 'Home Decor',
        bottomLabel: 'Pin It',
        pillIcon: '📌',
        headline: 'Minimal living room makeover ideas',
        subheadline: 'A moodboard of muted tones and soft textures to inspire your next project.',
        cta: 'Save Inspiration',
    },
    'food-promo': {
        wrapper: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/40',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/60',
        pill: 'bg-white/30 text-white',
        topLabel: 'Fresh Today',
        bottomLabel: 'Order Now',
        pillIcon: '→',
        headline: 'Fresh daily specials',
        subheadline: 'Seasonal dishes delivered hot to your doorstep in under 30 minutes.',
        cta: 'Order Dinner',
    },
    'product-carousel': {
        wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
        text: 'text-sky-200',
        mutedText: 'text-sky-200/80',
        accentBlock: 'bg-sky-500/30',
        linePrimary: 'bg-sky-400/80',
        lineSecondary: 'bg-sky-400/60',
        pill: 'bg-sky-400 text-slate-900',
        topLabel: 'New Drop',
        bottomLabel: 'Learn More',
        pillIcon: '→',
        headline: 'Nimbus headphones lookbook',
        subheadline: 'Swipe through product shots and tap to explore the limited edition line.',
        cta: 'See Collection',
    },
    'fitness-motivation': {
        wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-black',
        text: 'text-emerald-200',
        mutedText: 'text-emerald-200/80',
        accentBlock: 'bg-emerald-500/30',
        linePrimary: 'bg-emerald-400',
        lineSecondary: 'bg-emerald-400/60',
        pill: 'bg-emerald-500 text-slate-900',
        topLabel: 'Motivation',
        bottomLabel: 'Start',
        pillIcon: '▶',
        headline: 'Train with intensity today',
        subheadline: 'Drop in for a 20 minute HIIT session and save your progress with the community.',
        cta: 'Start Workout',
    },
    'fashion-story': {
        wrapper: 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500',
        text: 'text-white',
        mutedText: 'text-white/80',
        accentBlock: 'bg-white/30',
        linePrimary: 'bg-white/80',
        lineSecondary: 'bg-white/60',
        pill: 'bg-white/30 text-white',
        topLabel: 'Collection',
        bottomLabel: 'Shop',
        pillIcon: '🛍️',
        headline: 'Runway capsule just arrived',
        subheadline: 'Preview key looks from the limited edition drop before it sells out.',
        cta: 'Shop Capsule',
    },
};

const SocialPreview: PreviewRenderer = ({ variant }) => {
    const key = variant ?? 'default';
    const theme = SOCIAL_THEMES[key] ?? SOCIAL_THEMES.default;
    const headline = theme.headline ?? `${formatVariantLabel(key)} Spotlight`;
    const subheadline = theme.subheadline ?? 'Share a bold update and keep your audience engaged.';
    const cta = theme.cta ?? theme.bottomLabel ?? 'Swipe Up';

    return (
        <div className={cn('relative flex h-full w-full flex-col justify-between rounded-xl p-4', theme.wrapper, theme.text)}>
            <div className={cn('flex items-center justify-between text-[10px] uppercase tracking-wider', theme.mutedText ?? theme.text)}>
                <span>{theme.topLabel ?? formatVariantLabel(key)}</span>
                <span>{theme.handle ?? '@dropple'}</span>
            </div>
            <div className='space-y-3'>
                <div className={cn('rounded-lg px-3 py-2 text-sm font-semibold leading-snug', theme.accentBlock)}>{headline}</div>
                <p className='text-xs opacity-80'>{subheadline}</p>
            </div>
            <div className={cn('flex items-center justify-between text-[10px] uppercase tracking-wider', theme.mutedText ?? theme.text)}>
                <span>{cta}</span>
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-full', theme.pill)}>
                    {theme.pillIcon ?? '→'}
                </div>
            </div>
        </div>
    );
};

const SlidePreview: PreviewRenderer = () => (
    <div className='flex h-full w-full flex-col justify-between rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white'>
        <div>
            <span className='inline-flex rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-100'>Keynote</span>
            <h3 className='mt-3 text-lg font-bold'>Design Systems for Velocity</h3>
            <p className='text-xs text-white/70'>How unified component libraries accelerate product delivery across teams.</p>
        </div>
        <ul className='space-y-2 text-[11px] text-white/80'>
            <li>• Align cross-platform typography and grid decisions.</li>
            <li>• Automate tokens so design and code stay connected.</li>
            <li>• Measure impact with release cadence and QA savings.</li>
        </ul>
    </div>
);

const VisualPreview: PreviewRenderer = () => (
    <div className='flex h-full w-full flex-col justify-between rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-4 text-white'>
        <div>
            <p className='text-xs uppercase tracking-[0.35em] text-white/70'>Moodboard</p>
            <h3 className='mt-2 text-lg font-semibold'>Oceanic Creative Palette</h3>
            <p className='text-xs text-white/80'>A vibrant mix of aqua tones, glass textures, and high-contrast typography.</p>
        </div>
        <div className='grid h-20 w-24 grid-cols-2 gap-2 self-end'>
            <div className='rounded-lg bg-white/80' />
            <div className='rounded-lg bg-white/40' />
            <div className='rounded-lg bg-white/60' />
            <div className='rounded-lg bg-white/90' />
        </div>
    </div>
);

const PREVIEW_COMPONENTS: Partial<Record<TemplateComponentKey, PreviewRenderer>> = {
    BusinessCard: BusinessCardPreview,
    BusinessTemplate: DocumentPreview,
    EnterpriseTemplate: EnterprisePreview,
    EducationTemplate: DocumentPreview,
    EcommerceTemplate: PosterPreview,
    RealEstateTemplate: RealEstatePreview,
    FoodTemplate: FoodPreview,
    Flyer: PosterPreview,
    Invoice: InvoicePreview,
    MedicalTemplate: MedicalPreview,
    Resume: ResumePreview,
    PresentationSlide: SlidePreview,
    SocialMediaTemplate: SocialPreview,
    InstagramPost: SocialPreview,
    InstagramStory: SocialPreview,
    EditableInstagramPost: SocialPreview,
    TravelTemplate: TravelPreview,
    VisualTemplate: VisualPreview,
};

export function TemplatePreview({ componentKey, variant, className }: TemplatePreviewProps) {
    const Renderer = componentKey ? PREVIEW_COMPONENTS[componentKey] : undefined;

    return (
        <div className={cn('h-full w-full', className)}>
            {(Renderer ?? FallbackPreview)({ variant })}
        </div>
    );
}
