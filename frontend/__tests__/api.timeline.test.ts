/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/bff/timeline/route'

jest.mock('@/app/api/_lib/payload', () => ({
  fetchTimelineFromPayload: jest.fn(),
}))

jest.mock('@/app/api/_lib/flags', () => ({
  shouldUseTimelinePayload: jest.fn(() => true),
}))

jest.mock('@/app/api/_lib/legacy', () => ({
  getTimelineLegacy: jest.fn(),
}))

const mockedFetchTimelineFromPayload = jest.requireMock('@/app/api/_lib/payload')
  .fetchTimelineFromPayload as jest.Mock
const mockedShouldUseTimelinePayload = jest.requireMock('@/app/api/_lib/flags')
  .shouldUseTimelinePayload as jest.Mock
const mockedGetTimelineLegacy = jest.requireMock('@/app/api/_lib/legacy')
  .getTimelineLegacy as jest.Mock

describe('GET /api/bff/timeline', () => {
  beforeEach(() => {
    mockedFetchTimelineFromPayload.mockReset()
    mockedShouldUseTimelinePayload.mockReset()
    mockedGetTimelineLegacy.mockReset()
    mockedShouldUseTimelinePayload.mockReturnValue(true)
  })

  it('returns 400 for invalid year range with legacy envelope', async () => {
    const req = new NextRequest(
      new URL('http://localhost/api/bff/timeline?yearFrom=2025&yearTo=2024'),
    )

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({
      message: 'Invalid year range: yearFrom must be less than or equal to yearTo',
      error: { code: 400, message: 'Bad Request' },
    })
    expect(mockedFetchTimelineFromPayload).not.toHaveBeenCalled()
  })

  it('maps numeric id, slug, yearValue and meta when total divides limit', async () => {
    mockedFetchTimelineFromPayload.mockResolvedValue({
      total: 4,
      items: [
        {
          id: 'not-used',
          legacyId: 7,
          yearLabel: '2020',
          date: '2020-05-01T00:00:00.000Z',
          title: 'Fusion Event',
          description: null,
          sortOrder: 5,
        },
      ],
    })

    const req = new NextRequest(new URL('http://localhost/api/bff/timeline?page=2&limit=2'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data[0]).toMatchObject({
      id: 7,
      slug: '7',
      yearLabel: '2020',
      yearValue: 2020,
      title: 'Fusion Event',
      description: null,
      sortOrder: 5,
    })
    expect(body.meta).toMatchObject({
      page: 2,
      limit: 2,
      pageSize: 2,
      total: 4,
      totalPages: 2,
      hasNext: false,
      hasMore: false,
      order: 'desc',
    })
  })

  it('falls back to legacy handler when flag is off', async () => {
    mockedShouldUseTimelinePayload.mockReturnValue(false)
    mockedGetTimelineLegacy.mockResolvedValue(
      new Response(JSON.stringify({ data: ['legacy'] }), { status: 200 }) as any,
    )

    const req = new NextRequest(new URL('http://localhost/api/bff/timeline'))
    const res = await GET(req)

    expect(mockedGetTimelineLegacy).toHaveBeenCalledTimes(1)
    expect(mockedFetchTimelineFromPayload).not.toHaveBeenCalled()
    expect(res.status).toBe(200)
  })
})
