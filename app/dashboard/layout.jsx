import DashboardShell from '../../components/dashboard/DashboardShell.jsx';
import { requireUser } from '../../lib/stack-auth';
import { dashboardNavItems, dashboardSidebarCta } from '../../lib/dashboard/navigation';

export default async function DashboardLayout({ children }) {
    const user = await requireUser('/dashboard');
    const userName = user?.displayName ?? user?.primaryEmail?.emailAddress ?? 'Signed in user';
    const profileImage =
        user?.profileImageUrl ?? 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60';

    return (
        <DashboardShell
            navItems={dashboardNavItems}
            sidebarCta={dashboardSidebarCta}
            userName={userName}
            profileImage={profileImage}>
            {children}
        </DashboardShell>
    );
}
