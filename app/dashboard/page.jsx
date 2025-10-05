import TemplateScroller from '../../components/dashboard/TemplateScroller.jsx';
import RecentProjectsGrid from '../../components/dashboard/RecentProjectsGrid.jsx';
import UploadCard from '../../components/dashboard/UploadCard.jsx';
import PreviewCard from '../../components/dashboard/PreviewCard.jsx';

export const metadata = { title: 'Dropple Dashboard' };

export default function DashboardPage() {
    return (
        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]'>
            <div className='flex flex-col gap-8'>
                <TemplateScroller />
                <RecentProjectsGrid />
            </div>
            <div className='flex flex-col gap-6'>
                <UploadCard />
                <PreviewCard />
            </div>
        </div>
    );
}
