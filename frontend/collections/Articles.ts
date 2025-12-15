import type { Access, CollectionConfig, PayloadRequest } from 'payload'
import { getUserId, hasAnyRole, hasRole, isAdmin } from './access'
import { applyArticleComputedFields, applyPublishedAt } from './hooks/articles'

type BeforeChangeArgs = {
  req: PayloadRequest
  operation: 'create' | 'update' | 'delete'
  data?: any
}

const articleReadAccess: Access = ({ req }) => {
  if (hasAnyRole(req, ['editor', 'publisher', 'admin'])) return true
  if (hasRole(req, 'author')) {
    const userId = getUserId(req)
    if (!userId) return { _status: { equals: 'published' } } as any
    return { or: [{ _status: { equals: 'published' } }, { author: { equals: userId } }] } as any
  }
  return { _status: { equals: 'published' } } as any
}

const articleUpdateAccess: Access = ({ req, data }) => {
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
    if (data?.author && String(data.author) !== userId) return false
    return { _status: { equals: 'draft' }, author: { equals: userId } } as any
  }

  return false
}

const setArticleAuthorOnCreate = ({ req, operation, data }: BeforeChangeArgs) => {
  if (operation === 'create') {
    const userId = getUserId(req)
    if (userId) {
      return { ...data, author: userId }
    }
  }
  return data
}

const isPublisherOrAdmin = (user: any) =>
  Array.isArray(user?.roles) && (user.roles.includes('publisher') || user.roles.includes('admin'))

export const Articles: CollectionConfig = {
  slug: 'articles',
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [setArticleAuthorOnCreate, applyArticleComputedFields, applyPublishedAt],
  },
  access: {
    read: articleReadAccess,
    create: ({ req, data }) => {
      if (!req.user) return false
      if (isAdmin(req) || hasAnyRole(req, ['publisher', 'editor'])) return true
      if (hasRole(req, 'author')) {
        const userId = getUserId(req)
        if (!userId) return false
        if (data?.author && String(data.author) !== userId) return false
        return true
      }
      return false
    },
    update: articleUpdateAccess,
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
      access: {
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'timelineYear',
      type: 'number',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
}
