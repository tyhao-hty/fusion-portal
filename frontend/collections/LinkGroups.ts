import type { CollectionConfig } from 'payload'

export const LinkGroups: CollectionConfig = {
  slug: 'link-groups',
  admin: {
    useAsTitle: 'title',
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
