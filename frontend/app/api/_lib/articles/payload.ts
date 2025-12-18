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

  const statusFilter = mapStatusFilter(query.status)
  if (statusFilter) and.push(statusFilter)

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
    })
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
  })

  return {
    total: result.totalDocs ?? 0,
    items: (result.docs || []) as ArticleRecord[],
  }
}

export async function fetchArticleByLegacyId(
  legacyId: number,
  status: ArticlesStatus,
): Promise<ArticleRecord | null> {
  const client = await getClient()
  const statusFilter = mapStatusFilter(status)

  const result = await client.find({
    collection: 'articles',
    where: {
      and: [
        { legacyId: { equals: legacyId } },
        ...(statusFilter ? [statusFilter] : []),
      ],
    },
    limit: 1,
    depth: 1,
  })

  return (result.docs?.[0] as ArticleRecord) ?? null
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
  })

  return (result.docs || []) as TimelineEventRecord[]
}
