/** "04 — Stack" (Sheet 08). */
export function StackGrid({ stack }: { stack: { name: string; role: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {stack.map((item) => (
        <div key={item.name} className="rounded-control border border-glow/45 bg-wire/[0.08] px-4 py-3.5">
          <div className="font-mono text-sm font-semibold text-glow-pale">{item.name}</div>
          <div className="mt-1 font-sans text-[13px] text-muted">{item.role}</div>
        </div>
      ))}
    </div>
  );
}
