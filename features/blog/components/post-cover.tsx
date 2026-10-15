import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { BlogImage } from '../blog.types';

type PostCoverProps = {
  image?: BlogImage;
  /** Tailwind aspect/height classes for the frame. */
  className?: string;
  sizes: string;
  priority?: boolean;
};

/** A post's cover image, or a blueprint-grid placeholder when the post has none. */
export function PostCover({ image, className, sizes, priority = false }: PostCoverProps) {
  return (
    <div className={cn('relative overflow-hidden bg-image', className)}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority={priority}
          className="size-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="size-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 60%, rgb(59 130 246 / 0.24), transparent 65%), linear-gradient(rgb(96 165 250 / 0.12) 1px, transparent 1px), linear-gradient(90deg, rgb(96 165 250 / 0.12) 1px, transparent 1px)',
            backgroundSize: 'auto, 24px 24px, 24px 24px',
          }}
        />
      )}
    </div>
  );
}
