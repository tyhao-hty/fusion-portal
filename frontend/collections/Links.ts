import type { CollectionConfig } from 'payload'
import { hasAnyRole } from './access'
import { syncLinkSection } from './hooks/links'

export const Links: CollectionConfig = {
  slug: 'links',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    update: ({ req }) => hasAnyRole(req, ['editor', 'publisher', 'admin']),
    delete: ({ req }) => hasAnyRole(req, ['publisher', 'admin']),
  },
  hooks: {
    beforeChange: [syncLinkSection],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'section',
      type: 'relationship',
      relationTo: 'link-sections',
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'link-groups',
      required: true,
    },
    {
      name: 'icon',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
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
