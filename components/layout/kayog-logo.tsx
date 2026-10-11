import Image from 'next/image';

/**
 * The `</kayog>` brand, rendered from the animated SVGs in `public/brand/`
 * (the same files you can open in Figma or any design tool). The animation is
 * inside the SVG: the tag draws in, the letters rise, a dimension line grows
 * under them, and a pulse of light runs along it. It stops under reduced motion.
 */

const LOGO_RATIO = 384 / 116;

export type KayogLogoProps = {
  /** Rendered height in px. Defaults to 32. */
  height?: number;
  className?: string;
};

/** The `</kayog>` wordmark with its dimension line. */
export function KayogLogo({ height = 32, className }: KayogLogoProps) {
  return (
    <Image
      src="/brand/kayog-logo.svg"
      alt="kayog"
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      unoptimized
      className={className}
    />
  );
}

export type KayogMarkProps = {
  /** Rendered size in px. Defaults to 32. */
  size?: number;
  /** Pass "" when the mark sits next to text that already names it. */
  alt?: string;
  className?: string;
};

/** The square `</>` icon mark on a blueprint grid tile. */
export function KayogMark({ size = 32, alt = 'kayog', className }: KayogMarkProps) {
  return <Image src="/brand/kayog-mark.svg" alt={alt} width={size} height={size} unoptimized className={className} />;
}
