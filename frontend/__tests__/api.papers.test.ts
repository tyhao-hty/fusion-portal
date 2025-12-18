/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/papers/route'

jest.mock('@/app/api/_lib/papers/payload', () => ({
  fetchPapers: jest.fn(),
  lookupPaperTagIds: jest.fn(),
}))

jest.mock('@/app/api/_lib/flags', () => ({
  usePapersPayload: jest.fn(() => true),
  useTimelinePayload: jest.fn(() => true),
  useLinksPayload: jest.fn(() => true),
}))

jest.mock('@/app/api/_lib/legacy', () => ({
  getPapersLegacy: jest.fn(),
  getTimelineLegacy: jest.fn(),
  getLinksLegacy: jest.fn(),
}))

const mockedFetchPapers = jest.requireMock('@/app/api/_lib/papers/payload').fetchPapers as jest.Mock
const mockedLookupTagIds = jest.requireMock('@/app/api/_lib/papers/payload').lookupPaperTagIds as jest.Mock
const mockedUsePapersPayload = jest.requireMock('@/app/api/_lib/flags').usePapersPayload as jest.Mock
const mockedGetPapersLegacy = jest.requireMock('@/app/api/_lib/legacy').getPapersLegacy as jest.Mock

describe('GET /api/papers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUsePapersPayload.mockReturnValue(true)
  })

  it('returns 400 on invalid year range', async () => {
    const req = new NextRequest(new URL('http://localhost/api/papers?yearFrom=2025&yearTo=2024'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({
      message: 'Invalid year range: yearFrom must be less than or equal to yearTo',
      error: { code: 400, message: 'Bad Request' },
    })
  })

  it('returns empty result when tag lookup is empty', async () => {
    mockedLookupTagIds.mockResolvedValue([])

    const req = new NextRequest(new URL('http://localhost/api/papers?tags=unknown'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(mockedFetchPapers).not.toHaveBeenCalled()
    expect(body.meta).toMatchObject({
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasMore: false,
    })
    expect(body.data).toEqual([])
  })

  it('shapes response with authors flattening and tags', async () => {
    mockedLookupTagIds.mockResolvedValue(['t1'])
    mockedFetchPapers.mockResolvedValue({
      total: 3,
      items: [
        {
          slug: 'p1',
          title: 'Paper One',
          authors: [{ name: 'Alice' }, { name: 'Bob' }],
          year: 2024,
          venue: 'V1',
          url: 'http://a',
          abstract: 'Abs',
          sortOrder: null,
          tags: [{ slug: 't1', name: 'Tag1', type: 'paper_tag' }],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      ],
    })

    const req = new NextRequest(new URL('http://localhost/api/papers?page=1&limit=2'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data[0]).toMatchObject({
      slug: 'p1',
      title: 'Paper One',
      authors: 'Alice, Bob',
      year: 2024,
      venue: 'V1',
      url: 'http://a',
      abstract: 'Abs',
      sortOrder: 0,
      tags: [{ slug: 't1', name: 'Tag1' }],
    })
    expect(body.meta).toMatchObject({
      page: 1,
      limit: 2,
      pageSize: 2,
      total: 3,
      totalPages: 2,
      hasNext: true,
      hasMore: true,
    })
  })

  it('delegates to legacy when flag is off', async () => {
    mockedUsePapersPayload.mockReturnValue(false)
    mockedGetPapersLegacy.mockResolvedValue(
      new Response(JSON.stringify({ data: 'legacy' }), { status: 200 }) as any,
    )

    const req = new NextRequest(new URL('http://localhost/api/papers'))
    const res = await GET(req)

    expect(mockedGetPapersLegacy).toHaveBeenCalledTimes(1)
    expect(mockedFetchPapers).not.toHaveBeenCalled()
    expect(res.status).toBe(200)
  })
})
