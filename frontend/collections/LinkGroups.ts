import type { CollectionConfig } from 'payload'
import { hasAnyRole } from './access'

export const LinkGroups: CollectionConfig = {
  slug: 'link-groups',
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
      name: 'title',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'link-sections',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
