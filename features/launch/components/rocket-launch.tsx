import { Rocket } from 'lucide-react';

/** The amber launch beam + rocket (Sheet 06a, desktop only). Decorative. */
export function RocketLaunch() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      <div
        className="absolute left-[36%] top-0 h-[470px] w-1 blur-[1px]"
        style={{ background: 'linear-gradient(180deg, transparent, rgb(245 158 11 / 0.25) 30%, rgb(253 224 140 / 0.9))' }}
      />
      <div
        className="absolute left-[34.7%] top-[150px] grid size-11 place-items-center rounded-full border border-cta bg-navy/80 text-cta-hover"
        style={{ boxShadow: '0 0 30px rgb(245 158 11 / 0.6)' }}
      >
        <Rocket className="size-[22px]" aria-hidden />
      </div>
    </div>
  );
}
