export type PapersSort = 'year_desc' | 'year_asc' | 'name_asc' | 'name_desc'

export type PapersQuery = {
  page: number
  limit: number
  sort: PapersSort
  year?: number | string | null
  yearFrom?: number | null
  yearTo?: number | null
  search?: string | null
  tags?: string[] // deduped slugs/names
}

export type PaperRecord = {
  slug: string
  title: string
  authors?: Array<{ name: string; affiliation?: string | null }> | null
  year: number
  venue?: string | null
  url?: string | null
  abstract?: string | null
  sortOrder?: number | null
  tags?: Array<{ slug: string; name: string; type?: string | null }> | null
  createdAt?: string
  updatedAt?: string
}

export type PapersResponse = {
  data: Array<{
    slug: string
    title: string
    authors: string
    year: number
    venue: string | null
    url: string | null
    abstract: string | null
    sortOrder: number
    tags: Array<{ slug: string; name: string }>
    createdAt?: string
    updatedAt?: string
  }>
  meta: {
    page: number
    limit: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasMore: boolean
  }
}
