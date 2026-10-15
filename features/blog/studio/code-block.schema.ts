import { defineField, defineType } from 'sanity';

/** A code sample inside a post body. Plain text, no extra Studio plugin needed. */
export const codeBlockSchema = defineType({
  name: 'codeBlock',
  title: 'Code block',
  type: 'object',
  fields: [
    defineField({ name: 'filename', type: 'string', description: 'Optional, e.g. route.ts' }),
    defineField({ name: 'code', type: 'text', rows: 10, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: 'filename', subtitle: 'code' },
    prepare: ({ title, subtitle }: { title?: string; subtitle?: string }) => ({
      title: title ?? 'Code block',
      subtitle: subtitle?.slice(0, 60),
    }),
  },
});
