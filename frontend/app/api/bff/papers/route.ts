import { NextRequest, NextResponse } from 'next/server'
import { parsePapersQuery, validateYearRange } from '../../_lib/papers/query'
import { mapPapersSort } from '../../_lib/papers/sorting'
import { fetchPapers, lookupPaperTagIds } from '../../_lib/papers/payload'
import { buildPapersResponse } from '../../_lib/papers/responses'
import { badRequest, internalError, ValidationError } from '../../_lib/errors'
import { shouldUsePapersPayload } from '../../_lib/flags'
import { getPapersLegacy } from '../../_lib/legacy'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const query = parsePapersQuery(req)
    validateYearRange(query.yearFrom ?? null, query.yearTo ?? null)

    if (!shouldUsePapersPayload()) {
      return getPapersLegacy(req)
    }

    const sort = mapPapersSort(query.sort)
    let tagIds: string[] | undefined
    if (query.tags?.length) {
      const resolved = await lookupPaperTagIds(query.tags)
      tagIds = resolved.length ? resolved : undefined
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
