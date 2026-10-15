import { defineArrayMember, defineField, defineType } from 'sanity';
import { BLOG_TOPICS } from '../blog.constants';

/** The `post` document: everything the blog index and a post page render. */
export const postSchema = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required().max(120) }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'Answer-first summary. Shown on cards, in search results and as the meta description.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'topic',
      type: 'string',
      options: { list: [...BLOG_TOPICS], layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the image for screen readers and search engines.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'Posts with a future date stay hidden until then.',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'updatedAt', type: 'datetime', description: 'Set when you make a meaningful edit.' }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      rows: 2,
      description: 'Optional. Overrides the excerpt in the meta description. Keep it under 160 characters.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'body',
      type: 'array',
      validation: (rule) => rule.required(),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [defineField({ name: 'href', type: 'url', validation: (rule) => rule.uri({ allowRelative: true }) })],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: (rule) => rule.required() }),
            defineField({ name: 'caption', type: 'string' }),
          ],
        }),
        defineArrayMember({ type: 'codeBlock' }),
      ],
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'topic', media: 'coverImage' },
  },
});
