import { EXPERIENCE } from '@/content/experience';

/** Sheet 07 "Experience" timeline. */
export function ExperienceSection() {
  return (
    <section id="experience" className="grid grid-cols-1 gap-8 border-t border-grid px-5 py-12 md:grid-cols-[320px_1fr] md:gap-16 md:px-12 md:py-20">
      <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-text-strong md:text-[44px]">Experience</h2>
      <div className="flex flex-col">
        {EXPERIENCE.map((job, i) => (
          <div key={i} className="grid grid-cols-[100px_24px_1fr] gap-4 pb-8 md:grid-cols-[180px_24px_1fr] md:gap-4">
            <span className="font-mono text-xs text-muted md:text-[13px]">{job.when}</span>
            <span className="flex flex-col items-center">
              <span className="mt-1 size-2.5 rotate-45 border-[1.5px] border-glow bg-navy" aria-hidden />
              <span className="mt-1.5 w-px flex-1 bg-wire/40" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-text-strong md:text-xl">{job.role}</span>
              <span className="mt-1.5 block font-sans text-sm leading-[1.55] text-muted">{job.note}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
