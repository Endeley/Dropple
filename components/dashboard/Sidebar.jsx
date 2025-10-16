'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    LayoutPanelTop,
    Component as ComponentIcon,
    Diamond,
    Brain,
    Camera,
    Aperture,
    Settings as SettingsIcon,
    Hexagon,
    Video,
    WalletMinimal,
    Upload as UploadIcon,
} from 'lucide-react';

import { dashboardNavItems, dashboardSidebarCta } from '../../lib/dashboard/navigation';
import BrandMark from '../BrandMark.jsx';

const iconMap = {
    layoutDashboard: LayoutDashboard,
    layoutPanelTop: LayoutPanelTop,
    aperture: Aperture,
    hexagon: Hexagon,
    component: ComponentIcon,
    diamond: Diamond,
    brain: Brain,
    camera: Camera,
    video: Video,
    settings: SettingsIcon,
    walletMinimal: WalletMinimal,
    upload: UploadIcon,
};

export default function DashboardSidebar({
    items = dashboardNavItems,
    cta = dashboardSidebarCta,
    className = '',
    onNavigate,
}) {
    const pathname = usePathname();
    const CtaIcon = cta?.icon ? iconMap[cta.icon] : undefined;

    return (
        <aside
            className={`sticky top-6 flex h-fit w-56 flex-col justify-between gap-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm shadow-slate-200/60 dark:shadow-slate-950/50 ${className}`.trim()}>
            <div className='space-y-8'>
                <BrandMark
                    href='/dashboard'
                    size={36}
                    className='text-lg font-semibold text-slate-900 dark:text-slate-100'
                    labelClassName='text-lg'
                />

                <nav className='flex flex-col gap-2 text-sm'>
                    {items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        const Icon = item.icon ? iconMap[item.icon] : undefined;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onNavigate?.()}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition ${
                                    active
                                        ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                                }`}>
                                {Icon ? <Icon className='h-5 w-5' /> : null}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {cta ? (
                <Link
                    href={cta.href}
                    onClick={() => onNavigate?.()}
                    className='flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20'>
                    {CtaIcon ? <CtaIcon className='h-5 w-5' /> : null}
                    {cta.label}
                </Link>
            ) : null}
        </aside>
    );
}
