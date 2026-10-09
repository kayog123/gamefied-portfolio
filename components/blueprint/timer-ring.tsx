export type TimerRingProps = {
  /** 1 → 0. */
  progress: number;
  /** Seconds remaining, shown as a 2-digit count. */
  remaining: number;
  size?: 52 | 56 | 68;
  className?: string;
};

/** SVG countdown ring (Sheet 00 / mini-game). Drains clockwise, turns red under 3s. */
export function TimerRing({ progress, remaining, size = 52, className }: TimerRingProps) {
  const strokeWidth = 4;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const isUrgent = remaining < 3;
  const center = size / 2;

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-grid)" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isUrgent ? '#f87171' : 'var(--color-cta)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.max(0, Math.min(1, progress)))}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-[stroke-dashoffset] duration-200 ease-linear"
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center font-mono font-semibold text-text-strong"
        style={{ fontSize: size >= 68 ? 20 : 16 }}
      >
        {String(Math.ceil(remaining)).padStart(2, '0')}
      </span>
    </div>
  );
}
