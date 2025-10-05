'use client';

import { useState } from 'react';

import { Sheet, SheetContent } from '../ui/sheet';
import DashboardHeader from './DashboardHeader.jsx';
import DashboardSidebar from './Sidebar.jsx';

export default function DashboardShell({
    children,
    navItems,
    sidebarCta,
    userName,
    profileImage,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleToggle = () => setMobileOpen(true);
    const handleClose = () => setMobileOpen(false);

    return (
        <div className='min-h-screen w-full py-4 text-slate-900 transition-colors sm:py-14 lg:py-8 dark:text-slate-100'>
            <div className='relative mx-auto flex w-full max-w-8xl gap-6 px-4 sm:px-6 lg:gap-10 lg:px-6 xl:px-8'>
                <DashboardSidebar items={navItems} cta={sidebarCta} className='hidden md:flex' />

                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetContent side='right' className='w-72 border-none bg-[var(--surface)] p-0 text-slate-900 dark:text-slate-100 md:hidden'>
                        <div className='h-full overflow-auto p-4'>
                            <DashboardSidebar
                                items={navItems}
                                cta={sidebarCta}
                                onNavigate={handleClose}
                                className='flex h-full w-full flex-col gap-8 border-none p-0 shadow-none'
                            />
                        </div>
                    </SheetContent>
                </Sheet>

                <div className='flex flex-1 flex-col gap-8'>
                    <DashboardHeader
                        userName={userName}
                        profileImage={profileImage}
                        onToggleSidebar={handleToggle}
                    />
                    <main className='flex-1'>{children}</main>
                </div>
            </div>
        </div>
    );
}
