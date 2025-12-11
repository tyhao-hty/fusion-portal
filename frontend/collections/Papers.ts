import type { CollectionConfig } from 'payload'

export const Papers: CollectionConfig = {
  slug: 'papers',
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
      name: 'authors',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'affiliation',
          type: 'text',
        },
      ],
    },
    {
      name: 'year',
      type: 'number',
      required: true,
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'pdf',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'abstract',
      type: 'textarea',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      filterOptions: {
        type: { equals: 'paper_tag' },
      },
    },
  ],
}
