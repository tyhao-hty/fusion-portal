import { NextRequest } from 'next/server'
import type { LinksQuery, LinksView } from './types'

export function normalizeView(input: string | null | undefined): LinksView {
  return input === 'flat' ? 'flat' : 'nested'
}

export function parseLinksQuery(req: NextRequest): LinksQuery {
  const params = req.nextUrl.searchParams
  const view = normalizeView(params.get('view'))
  const section = params.get('section') ?? params.get('sectionSlug')
  const group = params.get('group') ?? params.get('groupSlug')
  const keyword = params.get('q') ?? params.get('search')

  return {
    view,
    section: section && section.trim().length > 0 ? section : null,
    group: group && group.trim().length > 0 ? group : null,
    keyword: keyword && keyword.trim().length > 0 ? keyword : null,
  }
}
