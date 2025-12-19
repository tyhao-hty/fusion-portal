import { NextRequest, NextResponse } from 'next/server'
import { parseLinksQuery } from '../_lib/links/query'
import { fetchLinks, fetchGroups, fetchSections } from '../_lib/links/payload'
import { assembleLinks } from '../_lib/links/assembly'
import { buildLinksResponse } from '../_lib/links/responses'
import { badRequest, internalError, ValidationError } from '../_lib/errors'
import { shouldUseLinksPayload } from '../_lib/flags'
import { getLinksLegacy } from '../_lib/legacy'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const query = parseLinksQuery(req)

    if (!shouldUseLinksPayload()) {
      return getLinksLegacy(req)
    }

    const [links, groups, sections] = await Promise.all([
      fetchLinks(query),
      fetchGroups(query),
      fetchSections(query),
    ])

    const assembly = assembleLinks({ links, groups, sections })
    const body = buildLinksResponse({ query, assembly })
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message)
    }
    return internalError(error instanceof Error ? error.message : undefined)
  }
}
