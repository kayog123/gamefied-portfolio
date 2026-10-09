export type CaseStudyMetaProps = {
  meta: { role: string; stack: string; timeline: string; type: string };
};

/** The ROLE / STACK / TIMELINE / TYPE row (Sheet 08). */
export function CaseStudyMeta({ meta }: CaseStudyMetaProps) {
  const cells: { k: string; v: string }[] = [
    { k: 'ROLE', v: meta.role },
    { k: 'STACK', v: meta.stack },
    { k: 'TIMELINE', v: meta.timeline },
    { k: 'TYPE', v: meta.type },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-glow/35 py-4 md:mt-10 md:grid-cols-4 md:gap-0">
      {cells.map((cell) => (
        <div key={cell.k}>
          <div className="font-mono text-[10px] tracking-label text-muted">{cell.k}</div>
          <div className="mt-1.5 font-sans text-[15px] text-text">{cell.v}</div>
        </div>
      ))}
    </div>
  );
}
