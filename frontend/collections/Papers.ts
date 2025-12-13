import type { CollectionConfig, PayloadRequest } from 'payload'
import { hasAnyRole, hasRole, isAdmin } from './access'

type BeforeChangeArgs = {
  req: PayloadRequest
  operation: 'create' | 'update' | 'delete'
  data?: any
}

const setPaperAuthorOnCreate = ({ req, operation, data }: BeforeChangeArgs) => {
  if (operation === 'create') {
    const userId = (req.user as any)?.id
    if (userId) {
      return { ...data, author: userId }
    }
  }
  return data
}

export const Papers: CollectionConfig = {
  slug: 'papers',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [setPaperAuthorOnCreate],
  },
  access: {
    read: ({ req }) => {
      if (hasAnyRole(req, ['editor', 'publisher', 'admin'])) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req }) => {
      if (!req.user) return false
      return hasAnyRole(req, ['author', 'editor', 'publisher', 'admin'])
    },
    update: ({ req, data }) => {
      if (!req.user) return false
      if (isAdmin(req) || hasRole(req, 'publisher')) return true

      if (hasRole(req, 'editor')) {
        if (data?._status && data._status !== 'draft') return false
        return true
      }

      if (hasRole(req, 'author')) {
        return false
      }

      return false
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (isAdmin(req) || hasRole(req, 'publisher')) return true
      return false
    },
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
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
      access: {
        update: () => false,
      },
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
