import Image from 'next/image';

export type DeviceMockupProps = {
  title: string;
  desktop: string;
  mobile: string;
  /** Smaller sizing for the card; the case study page uses the large one. */
  size?: 'card' | 'hero';
  priority?: boolean;
};

/** Layered browser window + phone, so a site screenshot reads as a product shot. */
export function DeviceMockup({ title, desktop, mobile, size = 'card', priority = false }: DeviceMockupProps) {
  const hero = size === 'hero';
  return (
    <div
      className={`relative overflow-hidden border-glow/25 ${hero ? 'h-[260px] rounded-control border md:h-[520px]' : 'aspect-[16/10] border-b'}`}
      style={{ backgroundImage: 'radial-gradient(120% 90% at 20% 0%, rgb(59 130 246 / 0.35), transparent 60%), linear-gradient(160deg, #0b1b4a, #060d24)' }}
    >
      <div className={`absolute overflow-hidden rounded-lg border border-white/15 bg-[#0b1220] shadow-[0_18px_40px_rgb(0,0,0,0.5)] ${hero ? 'left-[5%] top-[8%] w-[72%]' : 'left-[6%] top-[10%] w-[74%]'}`}>
        <div className="flex h-[7%] min-h-4 items-center gap-1 bg-[#111a2e] px-2 py-1">
          <span className="size-1.5 rounded-full bg-[#ff5f57]" />
          <span className="size-1.5 rounded-full bg-[#febc2e]" />
          <span className="size-1.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="relative aspect-[16/10]">
          <Image src={desktop} alt={`${title} desktop screenshot`} fill className="object-cover object-top" sizes={hero ? '(max-width: 768px) 80vw, 840px' : '(max-width: 768px) 80vw, 25vw'} priority={priority} />
        </div>
      </div>
      <div className={`absolute overflow-hidden rounded-[10%/5%] border-[3px] border-[#0b1220] bg-[#0b1220] shadow-[0_18px_40px_rgb(0,0,0,0.6)] ring-1 ring-white/20 ${hero ? 'bottom-[6%] right-[6%] w-[22%]' : 'bottom-[7%] right-[6%] w-[24%]'}`}>
        <div className="relative aspect-[390/844]">
          <Image src={mobile} alt={`${title} mobile screenshot`} fill className="object-cover object-top" sizes={hero ? '220px' : '100px'} priority={priority} />
        </div>
      </div>
    </div>
  );
}
