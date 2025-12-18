export type LinksView = 'nested' | 'flat'

export type LinksQuery = {
  view: LinksView
  section?: string | null
  group?: string | null
  keyword?: string | null
}

export type LinkRecord = {
  id: number | string
  slug: string
  name: string
  url: string
  description?: string | null
  sortOrder?: number | null
  createdAt?: string
  group?: { id?: string | number | null; slug?: string | null; section?: { id?: string | number | null; slug?: string | null } | null } | null
}

export type GroupRecord = {
  id: number | string
  slug: string
  title?: string | null
  sortOrder?: number | null
  createdAt?: string
  section?: { id?: string | number | null; slug?: string | null } | null
}

export type SectionRecord = {
  id: number | string
  slug: string
  title: string
  sortOrder?: number | null
  createdAt?: string
}

export type NestedLink = {
  slug: string
  name: string
  url: string
  description: string | null
  sortOrder: number
}

export type NestedGroup = {
  slug: string
  title: string | null
  sortOrder: number
  links: NestedLink[]
}

export type NestedSection = {
  slug: string
  title: string
  sortOrder: number
  groups: NestedGroup[]
}

export type LinksResponse = {
  data:
    | NestedSection[]
    | Array<{
        slug: string
        name: string
        url: string
        description: string | null
        sortOrder: number
        section: { slug: string; title: string }
        group: { slug: string; title: string | null }
      }>
  meta: {
    sectionCount: number
    groupCount: number
    linkCount: number
    filters: {
      section: string | null
      group: string | null
      keyword: string | null
      view: LinksView
    }
  }
}
