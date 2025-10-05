import DashboardShell from '../../components/dashboard/DashboardShell.jsx';
import { getCurrentUser } from '../../lib/stack-auth';
import { dashboardNavItems, dashboardSidebarCta } from '../../lib/dashboard/navigation';

export default async function TemplatesLayout({ children }) {
    const user = await getCurrentUser();
    const userName =
        user?.displayName ?? user?.primaryEmail?.emailAddress ?? 'Guest';
    const profileImage =
        user?.profileImageUrl ??
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60';

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
