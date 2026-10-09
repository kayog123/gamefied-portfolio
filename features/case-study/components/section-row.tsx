import type { ReactNode } from 'react';

export type SectionRowProps = {
  label: string;
  children: ReactNode;
};

/** The numbered "01 — PROBLEM" label + content split (Sheet 08). */
export function SectionRow({ label, children }: SectionRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-5 pb-12 md:grid-cols-[240px_1fr] md:gap-12 md:px-40 md:pb-[72px]">
      <div className="font-mono text-xs tracking-label text-glow">{label}</div>
      <div>{children}</div>
    </div>
  );
}
