import Image from 'next/image';
import { PortableText, type PortableTextComponents } from 'next-sanity';
import type { PortableTextBlock } from 'next-sanity';
import type { PostHeading } from '../blog.types';

type ImageValue = { url?: string; width?: number; height?: number; alt?: string; caption?: string };
type CodeValue = { filename?: string; code?: string };

function buildComponents(headings: PostHeading[]): PortableTextComponents {
  const idByKey = new Map(headings.map((h) => [h.key, h.id]));

  return {
    block: {
      normal: ({ children }) => <p className="font-sans text-[17px] leading-[1.75] text-text">{children}</p>,
      h2: ({ children, value }) => (
        <h2
          id={idByKey.get(value._key ?? '')}
          className="mt-6 scroll-mt-24 text-balance font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-text-strong md:text-[30px]"
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-2 font-display text-xl font-semibold leading-[1.2] tracking-[-0.02em] text-text-strong">
          {children}
        </h3>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-2 rounded-panel border border-grid bg-wire/8 px-6 py-5 font-display text-[22px] leading-[1.35] tracking-[-0.02em] text-text-strong">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="flex list-disc flex-col gap-2.5 pl-6 font-sans text-[17px] leading-[1.7] text-text marker:text-glow">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="flex list-decimal flex-col gap-2.5 pl-6 font-sans text-[17px] leading-[1.7] text-text marker:font-mono marker:text-glow">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold text-text-strong">{children}</strong>,
      code: ({ children }) => (
        <code className="rounded-tag border border-grid bg-image px-1.5 py-0.5 font-mono text-[0.9em] text-glow-pale">
          {children}
        </code>
      ),
      link: ({ children, value }) => {
        const href: string = value?.href ?? '#';
        const external = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="focus-blueprint text-glow underline underline-offset-[3px] hover:text-glow-pale"
          >
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }: { value: ImageValue }) =>
        value.url && value.width && value.height ? (
          <figure className="my-2">
            <Image
              src={value.url}
              alt={value.alt ?? ''}
              width={value.width}
              height={value.height}
              sizes="(max-width: 768px) 100vw, 720px"
              className="h-auto w-full rounded-panel border border-grid"
            />
            {value.caption && (
              <figcaption className="pt-2.5 font-mono text-xs tracking-[0.04em] text-muted">{value.caption}</figcaption>
            )}
          </figure>
        ) : null,
      codeBlock: ({ value }: { value: CodeValue }) => (
        <figure className="my-2 overflow-hidden rounded-panel border border-grid bg-image">
          {value.filename && (
            <figcaption className="border-b border-grid px-3.5 py-2 font-mono text-[11px] tracking-label text-muted">
              {value.filename}
            </figcaption>
          )}
          <pre className="overflow-x-auto px-[18px] py-4 font-mono text-[13px] leading-[1.7] text-glow-pale" tabIndex={0}>
            <code>{value.code}</code>
          </pre>
        </figure>
      ),
    },
  };
}

/** The post body: Sanity Portable Text rendered with Blueprint typography. */
export function PostBody({ body, headings }: { body: PortableTextBlock[]; headings: PostHeading[] }) {
  return <PortableText value={body} components={buildComponents(headings)} />;
}
