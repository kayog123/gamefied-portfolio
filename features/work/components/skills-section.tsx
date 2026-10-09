import { SKILLS } from '@/content/skills';

/** Sheet 07 "Skills" section. */
export function SkillsSection() {
  return (
    <section id="skills" className="grid grid-cols-1 gap-8 border-t border-grid px-5 py-12 md:grid-cols-[320px_1fr] md:gap-16 md:px-12 md:py-20">
      <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-text-strong md:text-[44px]">Skills</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {SKILLS.map((group) => (
          <div key={group.k} className="rounded-panel border border-wire/30 bg-glass-strong p-3.5 md:p-[18px]">
            <div className="font-mono text-[11px] tracking-label text-glow">{group.k}</div>
            <div className="mt-3 flex flex-col gap-2">
              {group.v.map((skill) => (
                <span key={skill} className="flex items-center gap-2 font-sans text-sm text-text">
                  <span className="size-1.5 shrink-0 rotate-45 bg-glow" aria-hidden />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
