import { Pencil } from 'lucide-react';

export type ProjectIntroProps = {
  projectName: string;
  summary: string;
  onEditIdea: () => void;
  className?: string;
};

/** "PROJECT 001 · GENERATED FROM YOUR IDEA" intro block (Sheet 03). */
export function ProjectIntro({ projectName, summary, onEditIdea, className }: ProjectIntroProps) {
  return (
    <div className={className}>
      <div className="font-mono text-[10px] tracking-eyebrow text-glow">PROJECT 001 · GENERATED FROM YOUR IDEA</div>
      <h2 className="mt-2.5 font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-text-strong md:text-[34px] md:leading-[1.05]">
        {projectName}
      </h2>
      <p className="mt-2.5 text-pretty font-sans text-sm leading-[1.55] text-muted">{summary}</p>
      <button
        type="button"
        onClick={onEditIdea}
        className="focus-blueprint mt-2.5 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-glow"
      >
        <Pencil className="size-3" aria-hidden />
        EDIT IDEA
      </button>
    </div>
  );
}
