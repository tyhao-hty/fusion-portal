import { NextRequest, NextResponse } from 'next/server'
import { parsePapersQuery, validateYearRange } from '../_lib/papers/query'
import { mapPapersSort } from '../_lib/papers/sorting'
import { fetchPapers, lookupPaperTagIds } from '../_lib/papers/payload'
import { buildPapersResponse } from '../_lib/papers/responses'
import { badRequest, internalError, ValidationError } from '../_lib/errors'
import { usePapersPayload } from '../_lib/flags'
import { getPapersLegacy } from '../_lib/legacy'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const query = parsePapersQuery(req)
    validateYearRange(query.yearFrom ?? null, query.yearTo ?? null)

    if (!usePapersPayload()) {
      return getPapersLegacy(req)
    }

    const sort = mapPapersSort(query.sort)
    const tagIds = query.tags?.length ? await lookupPaperTagIds(query.tags) : undefined
    if (query.tags?.length && tagIds && tagIds.length === 0) {
      const emptyBody = buildPapersResponse({ query, total: 0, items: [] })
      return NextResponse.json(emptyBody)
    }
    const { total, items } = await fetchPapers(query, sort, tagIds)
    const body = buildPapersResponse({ query, total, items })
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message)
    }
    return internalError(error instanceof Error ? error.message : undefined)
  }
}
