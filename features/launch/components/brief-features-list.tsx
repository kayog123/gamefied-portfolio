import { Check } from 'lucide-react';
import type { Feature } from '@/types/blueprint';

export function BriefFeaturesList({ features }: { features: Feature[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-label text-glow">FEATURES · {features.length}</div>
      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.id} className="flex items-baseline gap-2 font-sans text-[13px] leading-[1.4] text-text-soft">
            <Check className="relative top-px size-3 shrink-0 text-live" aria-hidden />
            <span>
              <span className="font-medium text-text-strong">{f.short}</span> — {f.subtitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
