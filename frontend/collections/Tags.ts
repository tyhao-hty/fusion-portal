import type { CollectionConfig } from 'payload'
import { hasAnyRole } from './access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    update: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    delete: ({ req }) => hasAnyRole(req, ['publisher', 'admin']),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Category', value: 'category' },
        { label: 'Article Tag', value: 'article_tag' },
        { label: 'Paper Tag', value: 'paper_tag' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
