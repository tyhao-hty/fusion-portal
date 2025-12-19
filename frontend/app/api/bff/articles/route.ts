import { NextRequest, NextResponse } from 'next/server'
import { parseArticlesQuery, validateYearRange } from '../../_lib/articles/query'
import { mapArticlesSort } from '../../_lib/articles/sorting'
import { fetchArticles } from '../../_lib/articles/payload'
import { buildArticlesListResponse } from '../../_lib/articles/responses'
import { badRequest, internalError, ValidationError } from '../../_lib/errors'
import { shouldUseArticlesPayload } from '../../_lib/flags'
import { getArticlesLegacy } from '../../_lib/legacy'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const query = parseArticlesQuery(req)
    validateYearRange(query.yearFrom ?? null, query.yearTo ?? null)

    if (!shouldUseArticlesPayload()) {
      return getArticlesLegacy(req)
    }

    const sort = mapArticlesSort(query.sort)
    const { total, items } = await fetchArticles(query, sort)
    const body = buildArticlesListResponse({ query, total, items })
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message)
    }
    return internalError(error instanceof Error ? error.message : undefined)
  }
}
