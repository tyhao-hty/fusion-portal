import type { Access, CollectionConfig, PayloadRequest } from 'payload'
import { getUserId, hasAnyRole, hasRole, isAdmin } from './access'

type BeforeChangeArgs = {
  req: PayloadRequest
  operation: 'create' | 'update' | 'delete'
  data?: any
}

const setPaperCreatedByOnCreate = ({ req, operation, data }: BeforeChangeArgs) => {
  if (operation !== 'create') return data
  if (data?.createdBy) return data
  const userId = (req.user as any)?.id
  if (!userId) return data
  return { ...data, createdBy: userId }
}

const paperUpdateAccess: Access = ({ req, data }) => {
  if (!req.user) return false
  if (isAdmin(req) || hasRole(req, 'publisher')) return true

  if (hasRole(req, 'editor')) {
    if (data?._status && data._status !== 'draft') return false
    return { _status: { equals: 'draft' } } as any
  }

  if (hasRole(req, 'author')) {
    const userId = getUserId(req)
    if (!userId) return false
    if (data?._status && data._status !== 'draft') return false
    return { _status: { equals: 'draft' }, createdBy: { equals: userId } } as any
  }

  return false
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
    beforeChange: [setPaperCreatedByOnCreate],
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
    update: paperUpdateAccess,
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
