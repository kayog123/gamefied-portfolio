import { defineField, defineType } from 'sanity';

/**
 * The `auditSnapshot` document: one shared audit link. Set `preparedFor` to personalise the page for a prospect
 * (and get an email the first time they open it); push `expiresAt` out to keep a link alive longer.
 */
export const auditSnapshotSchema = defineType({
  name: 'auditSnapshot',
  title: 'Shared audit',
  type: 'document',
  fields: [
    defineField({ name: 'shareId', type: 'string', readOnly: true, description: 'The link is /audit/s/<this ID>.' }),
    defineField({ name: 'domain', type: 'string', readOnly: true }),
    defineField({ name: 'url', type: 'url', readOnly: true }),
    defineField({
      name: 'preparedFor',
      type: 'string',
      description:
        'Optional. Shown on the page as "Prepared for …" (max 80 characters), and turns on a one-time email when the link is first opened. Leave empty for links visitors create themselves.',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'expiresAt',
      type: 'datetime',
      description: 'After this the link shows "This audit is out of date". Change it to extend or end a link early.',
    }),
    defineField({ name: 'views', type: 'number', readOnly: true, description: 'Counted for people, not link-preview bots (best effort).' }),
    defineField({ name: 'lastViewedAt', type: 'datetime', readOnly: true }),
    defineField({ name: 'previewJson', type: 'text', readOnly: true, hidden: true, description: 'The stored public preview. Not meant to be edited.' }),
  ],
  orderings: [{ title: 'Newest first', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'domain', preparedFor: 'preparedFor', views: 'views' },
    prepare: ({ title, preparedFor, views }) => ({ title, subtitle: `${preparedFor ? `For ${preparedFor} · ` : ''}${views ?? 0} views` }),
  },
});
