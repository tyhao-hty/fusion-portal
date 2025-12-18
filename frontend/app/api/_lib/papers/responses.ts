import type { PapersQuery, PapersResponse, PaperRecord } from './types'

export function buildPapersResponse(params: {
  query: PapersQuery
  total: number
  items: PaperRecord[]
}): PapersResponse {
  const { query, total, items } = params

  const data = items.map((item) => {
    const authorsString =
      item.authors && item.authors.length
        ? item.authors.map((author) => author?.name || '').filter(Boolean).join(', ')
        : ''

    const tags =
      item.tags
        ?.filter((tag) => tag && tag.slug && tag.name)
        .map((tag) => ({ slug: tag.slug as string, name: tag.name as string })) ?? []

    return {
      slug: item.slug,
      title: item.title,
      authors: authorsString,
      year: item.year,
      venue: item.venue ?? null,
      url: item.url ?? null,
      abstract: item.abstract ?? null,
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
      tags,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  })

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit)
  const hasMore = query.page * query.limit < total

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      pageSize: query.limit,
      total,
      totalPages,
      hasNext: hasMore,
      hasMore,
    },
  }
}
