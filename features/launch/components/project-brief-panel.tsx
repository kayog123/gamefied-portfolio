import type { Blueprint } from '@/types/blueprint';
import { cn } from '@/lib/cn';
import { formatBriefDate } from '@/lib/format';
import { BriefFeaturesList } from './brief-features-list';
import { BriefRoadmap } from './brief-roadmap';
import { BriefStackTable } from './brief-stack-table';
import type { BriefFormProps } from './brief-form';
import { BriefForm } from './brief-form';

export type ProjectBriefPanelProps = {
  blueprint: Blueprint;
  form: BriefFormProps['form'];
  onPrint: () => void;
  className?: string;
};

/** Sheet 06a — the desktop project brief panel. */
export function ProjectBriefPanel({ blueprint, form, onPrint, className }: ProjectBriefPanelProps) {
  return (
    <div
      id="brief-print-area"
      className={cn('flex h-full flex-col rounded-modal backdrop-blur-[18px]', className)}
      style={{
        border: '1px solid rgb(96 165 250 / 0.45)',
        background: 'rgb(11 18 32 / 0.9)',
      }}
    >
      <div className="flex items-baseline justify-between border-b border-glow/22 px-5.5 py-4.5">
        <span className="font-display text-xl font-semibold text-text-strong">Project brief · {blueprint.projectName}</span>
        <span className="font-mono text-[10px] tracking-label text-muted">REV A · {formatBriefDate(new Date())}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5.5 py-4">
        <div className="flex flex-col gap-4.5">
          <BriefFeaturesList features={blueprint.features} />
          <BriefStackTable stack={blueprint.stackTable} />
          <BriefRoadmap roadmap={blueprint.roadmap} />
        </div>
      </div>

      <div className="border-t border-glow/22 px-5.5 py-4">
        <BriefForm form={form} onPrint={onPrint} layout="desktop" />
      </div>
    </div>
  );
}
