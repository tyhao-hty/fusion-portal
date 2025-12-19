import { NextRequest, NextResponse } from 'next/server'
import { parseStatus } from '../../_lib/articles/query'
import { fetchArticleBySlug, fetchTimelineEventsForArticle } from '../../_lib/articles/payload'
import { buildArticleDetailResponse } from '../../_lib/articles/responses'
import { badRequest, internalError, ValidationError } from '../../_lib/errors'
import { shouldUseArticlesPayload } from '../../_lib/flags'
import { getArticleDetailLegacy } from '../../_lib/legacy'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> },
): Promise<NextResponse> {
  try {
    const status = parseStatus(req.nextUrl.searchParams.get('status'))
    const { slugOrId } = await params

    if (!shouldUseArticlesPayload()) {
      return getArticleDetailLegacy(req)
    }

    const article = await fetchArticleBySlug(slugOrId, status)

    if (!article) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 })
    }

    const timelineEvents = await fetchTimelineEventsForArticle(article.id ?? article.legacyId ?? 0)
    const body = buildArticleDetailResponse({ article, timelineEvents })
    return NextResponse.json(body)
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message)
    }
    return internalError(error instanceof Error ? error.message : undefined)
  }
}
