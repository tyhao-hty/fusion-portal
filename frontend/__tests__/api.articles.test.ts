/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/bff/articles/route'

jest.mock('@/app/api/_lib/articles/payload', () => ({
  fetchArticles: jest.fn(),
}))

jest.mock('@/app/api/_lib/flags', () => ({
  shouldUseArticlesPayload: jest.fn(() => true),
  shouldUseTimelinePayload: jest.fn(() => true),
  shouldUseLinksPayload: jest.fn(() => true),
  shouldUsePapersPayload: jest.fn(() => true),
}))

jest.mock('@/app/api/_lib/legacy', () => ({
  getArticlesLegacy: jest.fn(),
  getTimelineLegacy: jest.fn(),
  getLinksLegacy: jest.fn(),
  getPapersLegacy: jest.fn(),
}))

const mockedFetchArticles = jest.requireMock('@/app/api/_lib/articles/payload').fetchArticles as jest.Mock
const mockedShouldUseArticlesPayload = jest.requireMock('@/app/api/_lib/flags')
  .shouldUseArticlesPayload as jest.Mock
const mockedGetArticlesLegacy = jest.requireMock('@/app/api/_lib/legacy').getArticlesLegacy as jest.Mock

describe('GET /api/bff/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedShouldUseArticlesPayload.mockReturnValue(true)
  })

  it('returns 400 on invalid year range', async () => {
    const req = new NextRequest(new URL('http://localhost/api/bff/articles?yearFrom=2025&yearTo=2024'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({
      message: 'Invalid year range: yearFrom must be less than or equal to yearTo',
      error: { code: 400, message: 'Bad Request' },
    })
  })

  it('applies defaults and shapes meta', async () => {
    mockedFetchArticles.mockResolvedValue({ total: 0, items: [] })

    const req = new NextRequest(new URL('http://localhost/api/bff/articles'))
    const res = await GET(req)
    const body = await res.json()

    expect(mockedFetchArticles).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10, sort: 'published_desc', status: 'published' }),
      expect.any(Array),
    )
    expect(res.status).toBe(200)
    expect(body.meta).toMatchObject({
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNext: false,
    })
    expect(body.data).toEqual([])
  })

  it('defaults to published and requires publishedAt', async () => {
    mockedFetchArticles.mockResolvedValue({
      total: 2,
      items: [
        {
          id: 1,
          legacyId: 1,
          slug: 'pub-1',
          title: 'Published 1',
          content_markdown: 'M1',
          status: 'published',
          publishedAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 2,
          legacyId: 2,
          slug: 'pub-2',
          title: 'Published 2',
          content_markdown: 'M2',
          status: 'published',
          publishedAt: '2024-02-01T00:00:00.000Z',
          updatedAt: '2024-02-02T00:00:00.000Z',
        },
      ],
    })

    const req = new NextRequest(new URL('http://localhost/api/bff/articles'))
    const res = await GET(req)
    const body = await res.json()

    expect(mockedFetchArticles).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'published' }),
      expect.any(Array),
    )
    expect(res.status).toBe(200)
    expect(body.data.every((item: any) => item.publishedAt)).toBe(true)
  })

  it('returns shaped data with ids, content, tags and status mapping', async () => {
    mockedFetchArticles.mockResolvedValue({
      total: 3,
      items: [
        {
          id: '99',
          legacyId: 7,
          slug: 'a-1',
          title: 'T1',
          excerpt: 'E1',
          coverImageUrl: 'http://img',
          content_markdown: 'M1',
          status: 'published',
          publishedAt: '2024-01-01',
          updatedAt: '2024-01-02',
          readingTime: 5,
          timelineYear: 2024,
          author: { id: '5', email: 'a@b.com' },
          category: { id: '6', slug: 'cat', name: 'Cat' },
          tags: [
            { id: '10', slug: 't1', name: 'Tag1' },
            { id: 11, slug: 't2', name: 'Tag2' },
          ],
        },
      ],
    })

    const req = new NextRequest(new URL('http://localhost/api/bff/articles?page=1&pageSize=2'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data[0]).toMatchObject({
      id: 7,
      slug: 'a-1',
      title: 'T1',
      excerpt: 'E1',
      coverImageUrl: 'http://img',
      content: 'M1',
      status: 'published',
      publishedAt: '2024-01-01',
      updatedAt: '2024-01-02',
      readingTime: 5,
      timelineYear: 2024,
      author: { id: 5, email: 'a@b.com' },
      category: { id: 6, slug: 'cat', name: 'Cat' },
      tags: [
        { id: 10, slug: 't1', name: 'Tag1' },
        { id: 11, slug: 't2', name: 'Tag2' },
      ],
    })
    expect(body.meta).toMatchObject({ total: 3, pageSize: 2, totalPages: 2, hasNext: true })
  })

  it('feature flag off delegates to legacy', async () => {
    mockedShouldUseArticlesPayload.mockReturnValue(false)
    mockedGetArticlesLegacy.mockResolvedValue(
      new Response(JSON.stringify({ data: 'legacy' }), { status: 200 }) as any,
    )

    const req = new NextRequest(new URL('http://localhost/api/bff/articles'))
    const res = await GET(req)

    expect(mockedGetArticlesLegacy).toHaveBeenCalledTimes(1)
    expect(mockedFetchArticles).not.toHaveBeenCalled()
    expect(res.status).toBe(200)
  })
})
