import { NextRequest, NextResponse } from 'next/server'
import { buildTimelineResponse } from '../_lib/responses'
import { fetchTimelineFromPayload } from '../_lib/payload'
import { parseTimelineQuery, validateTimelineRange } from '../_lib/query'
import { timelineSort } from '../_lib/sorting'
import { badRequest, internalError, ValidationError } from '../_lib/errors'
import { shouldUseTimelinePayload } from '../_lib/flags'
import { getTimelineLegacy } from '../_lib/legacy'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const query = parseTimelineQuery(req)
    validateTimelineRange(query.yearFrom ?? null, query.yearTo ?? null)

    if (!shouldUseTimelinePayload()) {
      return getTimelineLegacy(req)
    }

    const sort = timelineSort(query.order)
    const { total, items } = await fetchTimelineFromPayload(query, sort)
    const body = buildTimelineResponse({ query, total, items })
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message)
    }
    return internalError(error instanceof Error ? error.message : undefined)
  }
}
