import { landingSections } from './landing/section-data';
import { HeroSection, SplitSection, CTASection, PageFooter } from './landing/components';

const COMPONENTS = {
    hero: HeroSection,
    split: SplitSection,
    cta: CTASection,
};

export default function HomePage() {
    return (
        <main className='min-h-screen bg-[var(--color-canvas)] text-[color:var(--color-text-primary)]'>
            {landingSections.map((section) => {
                const SectionComponent = COMPONENTS[section.layout] || SplitSection;
                return <SectionComponent key={section.id} section={section} />;
            })}
            <PageFooter />
        </main>
    );
}
