import { Play } from 'lucide-react';
import { Button } from '@/components/blueprint';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ContactSection } from './contact-section';
import { ExperienceSection } from './experience-section';
import { Hero } from './hero';
import { ShippedWork } from './shipped-work';
import { SkillsSection } from './skills-section';

/** Sheet 07 — See My Work: the static, recruiter-friendly 2D fallback. */
export function WorkPage() {
  return (
    <PageWrapper>
      <Hero />
      {/* Sheet 07b: full-width "Play the blueprint" CTA shown only on mobile */}
      <div className="px-5 pb-5 md:hidden">
        <Button href="/" size="lg" variant="secondary" className="w-full justify-center" iconRight={<Play className="size-[15px]" aria-hidden />}>
          Play the blueprint
        </Button>
      </div>
      <ShippedWork />
      <SkillsSection />
      <ExperienceSection />
      <ContactSection />
    </PageWrapper>
  );
}
