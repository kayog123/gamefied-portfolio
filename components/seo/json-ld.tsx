type JsonLdProps = {
  /** A schema.org object. Build it from `content/` in `lib/seo/schema.ts`. */
  data: Record<string, unknown>;
};

/** Server Component: renders one JSON-LD block. `<` is escaped to prevent script-tag injection. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
