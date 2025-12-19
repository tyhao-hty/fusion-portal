import type {
  ArticlesQuery,
  ArticlesListResponse,
  ArticleRecord,
  ArticleDetailRecord,
  ArticleDetailResponse,
  TimelineEventRecord,
} from './types'

const toNumberId = (value: number | string | undefined, fallback?: number) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) return parsed
  }
  if (typeof fallback === 'number') return fallback
  return 0
}

export function buildArticlesListResponse(params: {
  query: ArticlesQuery
  total: number
  items: ArticleRecord[]
}): ArticlesListResponse {
  const { query, total, items } = params

  const data = items.map((item) => {
    const id = toNumberId(item.legacyId, toNumberId(item.id))
    const status = (item as any).status ?? (item as any)._status ?? null
    const author =
      item.author && (item.author.id || item.author.email)
        ? {
            id: toNumberId(item.author.id),
            email: item.author.email ?? null,
          }
        : null
    const category = item.category?.slug
      ? {
          id: toNumberId(item.category.id),
          slug: item.category.slug ?? '',
          name: item.category.name ?? '',
        }
      : null
    const tags =
      item.tags?.map((tag) => ({
        id: toNumberId(tag.id),
        slug: tag.slug ?? '',
        name: tag.name ?? '',
      })) ?? []

    return {
      id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt ?? null,
      coverImageUrl: item.coverImageUrl ?? null,
      content: item.content_markdown ?? item.content_html ?? null,
      status,
      publishedAt: item.publishedAt ?? null,
      updatedAt: item.updatedAt ?? null,
      readingTime: item.readingTime ?? null,
      timelineYear: item.timelineYear ?? null,
      author,
      category,
      tags,
    }
  })

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize)
  const hasNext = query.page < totalPages

  return {
    data,
    meta: {
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages,
      hasNext,
    },
  }
}

export function buildArticleDetailResponse(params: {
  article: ArticleDetailRecord
  timelineEvents: TimelineEventRecord[]
}): ArticleDetailResponse {
  const { article, timelineEvents } = params
  const id = toNumberId(article.legacyId, toNumberId(article.id))
  const status = (article as any).status ?? (article as any)._status ?? null
  const author =
    article.author && (article.author.id || article.author.email)
      ? {
          id: toNumberId(article.author.id),
          email: article.author.email ?? null,
        }
      : null
  const category = article.category?.slug
    ? {
        id: toNumberId(article.category.id),
        slug: article.category.slug ?? '',
        name: article.category.name ?? '',
      }
    : null
  const tags =
    article.tags?.map((tag) => ({
      id: toNumberId(tag.id),
      slug: tag.slug ?? '',
      name: tag.name ?? '',
    })) ?? []

  const timeline = timelineEvents.map((event) => ({
    id: toNumberId(event.id),
    slug: event.slug,
    yearLabel: event.yearLabel,
    yearValue: event.yearValue,
    title: event.title,
  }))

  return {
    id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? null,
    coverImageUrl: article.coverImageUrl ?? null,
    content: article.content_markdown ?? article.content_html ?? null,
    status,
    publishedAt: article.publishedAt ?? null,
    updatedAt: article.updatedAt ?? null,
    readingTime: article.readingTime ?? null,
    timelineYear: article.timelineYear ?? null,
    author,
    category,
    tags,
    timelineEvents: timeline,
  }
}
