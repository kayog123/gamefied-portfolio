import type { ReactNode } from 'react';
import type { Blueprint } from '@/types/blueprint';
import { BriefFeaturesList } from './brief-features-list';
import { BriefRoadmap } from './brief-roadmap';
import { BriefStackTable } from './brief-stack-table';
import type { BriefFormProps } from './brief-form';
import { BriefForm } from './brief-form';

export type ProjectBriefMobileProps = {
  blueprint: Blueprint;
  form: BriefFormProps['form'];
  onPrint: () => void;
};

function AccordionRow({ title, count, children }: { title: string; count: string; children: ReactNode }) {
  return (
    <details className="group border-b border-glow/20">
      <summary className="flex h-12 cursor-pointer list-none items-center justify-between font-sans text-sm text-text [&::-webkit-details-marker]:hidden">
        {title}
        <span className="font-mono text-[11px] text-muted">{count} ＋</span>
      </summary>
      <div className="pb-3.5">{children}</div>
    </details>
  );
}

/** Sheet 06b — the mobile project brief, as tappable accordions. */
export function ProjectBriefMobile({ blueprint, form, onPrint }: ProjectBriefMobileProps) {
  return (
    <div id="brief-print-area" className="flex flex-col gap-1">
      <div className="font-display text-lg font-semibold text-text-strong">Project brief · {blueprint.projectName}</div>

      <AccordionRow title="Features" count={String(blueprint.features.length)}>
        <BriefFeaturesList features={blueprint.features} />
      </AccordionRow>
      <AccordionRow title="Suggested stack" count={String(blueprint.stackTable.length)}>
        <BriefStackTable stack={blueprint.stackTable} />
      </AccordionRow>
      <AccordionRow title="Roadmap · MVP → v1 → Scale" count={String(blueprint.roadmap.length)}>
        <BriefRoadmap roadmap={blueprint.roadmap} />
      </AccordionRow>

      <div className="mt-2.5">
        <BriefForm form={form} onPrint={onPrint} layout="mobile" />
      </div>
    </div>
  );
}
