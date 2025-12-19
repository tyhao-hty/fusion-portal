import type { Payload, Where } from 'payload'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import type {
  ArticlesQuery,
  ArticleRecord,
  ArticlesStatus,
  TimelineEventRecord,
} from './types'

let cachedPayload: Payload | null = null

const getClient = async () => {
  if (cachedPayload) return cachedPayload
  cachedPayload = await getPayload({ config: payloadConfig })
  return cachedPayload
}

const mapStatusFilter = (status: ArticlesStatus): Where | undefined => {
  if (status === 'all') return undefined
  if (status === 'published') return { _status: { equals: 'published' } }
  if (status === 'draft' || status === 'review') return { _status: { equals: 'draft' } }
  return undefined
}

export async function fetchArticles(
  query: ArticlesQuery,
  sort: string[],
): Promise<{ total: number; items: ArticleRecord[] }> {
  const client = await getClient()
  const and: Where[] = []

  // Enforce default published-only behavior
  if (query.status === 'published') {
    and.push({ _status: { equals: 'published' } })
  } else if (query.status === 'draft' || query.status === 'review') {
    and.push({ _status: { equals: 'draft' } })
  }

  if (query.search) {
    and.push({
      or: [
        { title: { like: `%${query.search}%` } },
        { excerpt: { like: `%${query.search}%` } },
      ],
    })
  }

  if (query.category) {
    and.push({ 'category.slug': { equals: query.category } })
  }

  if (query.tags?.length) {
    and.push({
      tags: {
        some: {
          or: query.tags.map((value) => ({ slug: { equals: value } })),
        },
      },
    } as Where)
  }

  if (typeof query.year === 'number') {
    and.push({ timelineYear: { equals: query.year } })
  } else if (typeof query.year === 'string') {
    and.push({
      or: [
        { title: { like: `%${query.year}%` } },
        { excerpt: { like: `%${query.year}%` } },
      ],
    })
  }

  if (typeof query.yearFrom === 'number') {
    and.push({ timelineYear: { greater_than_equal: query.yearFrom } })
  }
  if (typeof query.yearTo === 'number') {
    and.push({ timelineYear: { less_than_equal: query.yearTo } })
  }

  const where: Where = and.length ? { and } : {}

  const result = await client.find({
    collection: 'articles',
    where,
    sort,
    page: query.page,
    limit: query.pageSize,
    depth: 1,
    overrideAccess: true,
  })

  const items = (result.docs || []) as ArticleRecord[]

  // Dev/test guard: published list should not include missing publishedAt
  if (query.status === 'published' && process.env.NODE_ENV !== 'production') {
    const invalid = items.filter((item) => !item.publishedAt)
    if (invalid.length > 0) {
      const message = `articles: published list contains ${invalid.length} items without publishedAt`
      if (process.env.NODE_ENV === 'test') {
        throw new Error(message)
      }
      console.warn(message, {
        slugs: invalid.slice(0, 5).map((item) => item.slug),
      })
    }
  }

  return {
    total: result.totalDocs ?? 0,
    items,
  }
}

export async function fetchArticleBySlug(
  slug: string,
  status: ArticlesStatus,
): Promise<ArticleRecord | null> {
  const client = await getClient()
  const statusFilter = mapStatusFilter(status)

  const result = await client.find({
    collection: 'articles',
    where: {
      and: [
        { slug: { equals: slug } },
        ...(statusFilter ? [statusFilter] : []),
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return (result.docs?.[0] as ArticleRecord) ?? null
}

export async function fetchTimelineEventsForArticle(
  articleId: number | string,
): Promise<TimelineEventRecord[]> {
  const client = await getClient()

  const result = await client.find({
    collection: 'timeline-events',
    where: {
      relatedArticle: {
        equals: articleId,
      },
    },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const docs =
    (result.docs || []) as Array<{
      id?: number | string
      slug?: number | string
      yearLabel?: string
      yearValue?: number | null
      title?: string
      date?: string | null
    }>

  return docs.map((doc) => {
    const yearValue =
      doc?.date && !Number.isNaN(new Date(doc.date).getFullYear())
        ? new Date(doc.date).getFullYear()
        : doc?.yearValue ?? null
    return {
      id: doc?.id ?? '',
      slug: doc?.slug ? String(doc.slug) : String(doc?.id ?? ''),
      yearLabel: doc?.yearLabel ?? '',
      yearValue: Number.isNaN(yearValue) ? null : yearValue,
      title: doc?.title ?? '',
    }
  })
}
