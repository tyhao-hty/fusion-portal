import type { CollectionConfig } from 'payload'
import { hasAnyRole } from './access'

export const TimelineEvents: CollectionConfig = {
  slug: 'timeline-events',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    update: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    delete: ({ req }) => hasAnyRole(req, ['publisher', 'admin']),
  },
  fields: [
    {
      name: 'yearLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'relatedArticle',
      type: 'relationship',
      relationTo: 'articles',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
      access: {
        update: () => false,
      },
    },
  ],
}
