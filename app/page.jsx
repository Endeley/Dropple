import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import FeaturesGrid from '../components/FeaturesGrid.jsx';
import ProCard from '../components/ProCard.jsx';
import LogosStrip from '../components/LogosStrip.jsx';
import AudienceSegments from '../components/AudienceSegments.jsx';
import Footer from '../components/Footer.jsx';

export default function HomePage() {
    return (
        <div className='min-h-screen w-full py-12 text-slate-900 transition-colors sm:py-16 lg:py-20 dark:text-slate-100'>
            <div className='mx-auto flex w-full max-w-8xl flex-col gap-12 px-6 lg:gap-16 lg:px-8'>
                <Header />
                <main
                    className='grid gap-10 rounded-[40px] border border-white/60 bg-white/95 p-8 shadow-xl shadow-slate-200/40 transition lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:p-12 dark:border-slate-800/60 dark:bg-slate-900/75 dark:shadow-slate-950/50 animate-fade-up'
                    style={{ animationDelay: '0.05s' }}>
                    <section className='flex flex-col gap-8 lg:pr-6'>
                        <Hero />
                        <FeaturesGrid />
                    </section>
                    <section className='flex flex-col gap-8'>
                        <ProCard />
                        <LogosStrip />
                        <AudienceSegments />
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
}
