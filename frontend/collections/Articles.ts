import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'content_html',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'readingTime',
      type: 'number',
    },
    {
      name: 'publishedAt',
      type: 'date',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'tags',
      filterOptions: {
        type: { equals: 'category' },
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      filterOptions: {
        type: { equals: 'article_tag' },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'timelineYear',
      type: 'number',
    },
  ],
}
