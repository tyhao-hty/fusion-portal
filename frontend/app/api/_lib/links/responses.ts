import type { LinksQuery, LinksResponse } from './types'
import type { AssemblyResult } from './assembly'

export function buildLinksResponse(params: {
  query: LinksQuery
  assembly: AssemblyResult
}): LinksResponse {
  const { query, assembly } = params

  const data =
    query.view === 'flat'
      ? assembly.flat
      : assembly.sections

  return {
    data,
    meta: {
      sectionCount: assembly.counts.sections,
      groupCount: assembly.counts.groups,
      linkCount: query.view === 'flat' ? assembly.flat.length : assembly.counts.links,
      filters: {
        section: query.section ?? null,
        group: query.group ?? null,
        keyword: query.keyword ?? null,
        view: query.view,
      },
    },
  }
}
