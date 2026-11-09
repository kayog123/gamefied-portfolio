import { defineField, defineType } from 'sanity';

/** The `auditRequest` document: one "Get the full audit" request. Everything is read-only except status and notes. */
export const auditRequestSchema = defineType({
  name: 'auditRequest',
  title: 'Audit request',
  type: 'document',
  fields: [
    defineField({ name: 'domain', type: 'string', readOnly: true }),
    defineField({ name: 'url', type: 'url', readOnly: true }),
    defineField({ name: 'name', type: 'string', readOnly: true }),
    defineField({ name: 'email', type: 'string', readOnly: true }),
    defineField({ name: 'message', type: 'text', rows: 4, readOnly: true }),
    defineField({ name: 'consent', type: 'boolean', readOnly: true, description: 'They agreed to be emailed about this audit only.' }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: ['pending', 'contacted', 'declined', 'running', 'completed', 'failed'],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'previewSummary',
      type: 'object',
      readOnly: true,
      description: 'Scores and counts of the free scan when they asked. No findings are stored here.',
      fields: [
        defineField({
          name: 'scores',
          type: 'object',
          fields: [
            defineField({ name: 'seo', type: 'number' }),
            defineField({ name: 'security', type: 'number' }),
            defineField({ name: 'maintainability', type: 'number' }),
          ],
        }),
        defineField({
          name: 'counts',
          type: 'object',
          fields: [
            defineField({ name: 'critical', type: 'number' }),
            defineField({ name: 'warning', type: 'number' }),
            defineField({ name: 'info', type: 'number' }),
          ],
        }),
        defineField({ name: 'lockedCount', type: 'number' }),
      ],
    }),
    defineField({ name: 'notes', type: 'text', rows: 4, description: 'Private notes for you. Never shown to the requester.' }),
  ],
  orderings: [{ title: 'Newest first', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'domain', name: 'name', status: 'status' },
    prepare: ({ title, name, status }) => ({ title, subtitle: `${status ?? 'pending'} · ${name ?? ''}` }),
  },
});
