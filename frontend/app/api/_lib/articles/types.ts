export type ArticlesSort = 'published_desc' | 'published_asc' | 'title_asc' | 'title_desc'

export type ArticlesStatus = 'published' | 'draft' | 'review' | 'all'

export type ArticlesQuery = {
  page: number
  pageSize: number
  sort: ArticlesSort
  status: ArticlesStatus
  search?: string | null
  category?: string | null
  tags?: string[]
  year?: number | string | null
  yearFrom?: number | null
  yearTo?: number | null
}

export type ArticleRecord = {
  id: number | string
  legacyId?: number
  slug: string
  title: string
  excerpt?: string | null
  coverImageUrl?: string | null
  content_markdown?: string | null
  content_html?: string | null
  status?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  readingTime?: number | null
  timelineYear?: number | null
  author?: { id?: number | string; email?: string | null } | null
  category?: { id?: number | string; slug?: string | null; name?: string | null } | null
  tags?: Array<{ id?: number | string; slug?: string; name?: string }> | null
}

export type ArticlesListResponse = {
  data: Array<{
    id: number
    slug: string
    title: string
    excerpt: string | null
    coverImageUrl: string | null
    content: string | null
    status: string | null
    publishedAt: string | null
    updatedAt: string | null
    readingTime: number | null
    timelineYear: number | null
    author: { id: number; email: string | null } | null
    category: { id: number; slug: string; name: string } | null
    tags: Array<{ id: number; slug: string; name: string }>
  }>
  meta: { total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean }
}
