/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/articles/[slugOrId]/route'

jest.mock('@/app/api/_lib/articles/payload', () => ({
  fetchArticleBySlug: jest.fn(),
  fetchTimelineEventsForArticle: jest.fn(),
}))

jest.mock('@/app/api/_lib/flags', () => ({
  useArticlesPayload: jest.fn(() => true),
  useTimelinePayload: jest.fn(() => true),
  useLinksPayload: jest.fn(() => true),
  usePapersPayload: jest.fn(() => true),
}))

jest.mock('@/app/api/_lib/legacy', () => ({
  getArticleDetailLegacy: jest.fn(),
  getArticlesLegacy: jest.fn(),
  getTimelineLegacy: jest.fn(),
  getLinksLegacy: jest.fn(),
  getPapersLegacy: jest.fn(),
}))

const mockedFetchBySlug = jest.requireMock('@/app/api/_lib/articles/payload')
  .fetchArticleBySlug as jest.Mock
const mockedFetchTimeline = jest.requireMock('@/app/api/_lib/articles/payload')
  .fetchTimelineEventsForArticle as jest.Mock
const mockedUseArticlesPayload = jest.requireMock('@/app/api/_lib/flags')
  .useArticlesPayload as jest.Mock
const mockedGetArticleDetailLegacy = jest.requireMock('@/app/api/_lib/legacy')
  .getArticleDetailLegacy as jest.Mock

describe('GET /api/articles/:slugOrId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseArticlesPayload.mockReturnValue(true)
  })

  it('fetches by slug', async () => {
    mockedFetchBySlug.mockResolvedValue({
      id: '2',
      legacyId: 2,
      slug: 'slug-1',
      title: 'T2',
      content_html: '<p>M</p>',
    })
    mockedFetchTimeline.mockResolvedValue([])

    const req = new NextRequest(new URL('http://localhost/api/articles/slug-1?status=all'))
    const res = await GET(req, { params: { slugOrId: 'slug-1' } })

    expect(mockedFetchBySlug).toHaveBeenCalledWith('slug-1', 'all')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ id: 2, content: '<p>M</p>' })
  })

  it('numeric-looking slug is treated as slug and returns 404 if missing', async () => {
    mockedFetchBySlug.mockResolvedValue(null)
    mockedFetchTimeline.mockResolvedValue([])

    const req = new NextRequest(new URL('http://localhost/api/articles/2025'))
    const res = await GET(req, { params: { slugOrId: '2025' } })

    expect(mockedFetchBySlug).toHaveBeenCalledWith('2025', 'published')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ message: '文章不存在' })
  })

  it('flag off delegates to legacy', async () => {
    mockedUseArticlesPayload.mockReturnValue(false)
    mockedGetArticleDetailLegacy.mockResolvedValue(
      new Response(JSON.stringify({ data: 'legacy' }), { status: 200 }) as any,
    )

    const req = new NextRequest(new URL('http://localhost/api/articles/slug-1'))
    const res = await GET(req, { params: { slugOrId: 'slug-1' } })

    expect(mockedGetArticleDetailLegacy).toHaveBeenCalledTimes(1)
    expect(mockedFetchBySlug).not.toHaveBeenCalled()
    expect(res.status).toBe(200)
  })
})
