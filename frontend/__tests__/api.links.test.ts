/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/links/route'

jest.mock('@/app/api/_lib/links/payload', () => ({
  fetchLinks: jest.fn(),
  fetchGroups: jest.fn(),
  fetchSections: jest.fn(),
}))

jest.mock('@/app/api/_lib/flags', () => ({
  useLinksPayload: jest.fn(() => true),
  useTimelinePayload: jest.fn(() => true),
}))

jest.mock('@/app/api/_lib/legacy', () => ({
  getLinksLegacy: jest.fn(),
  getTimelineLegacy: jest.fn(),
}))

const mockedFetchLinks = jest.requireMock('@/app/api/_lib/links/payload').fetchLinks as jest.Mock
const mockedFetchGroups = jest.requireMock('@/app/api/_lib/links/payload').fetchGroups as jest.Mock
const mockedFetchSections = jest.requireMock('@/app/api/_lib/links/payload')
  .fetchSections as jest.Mock
const mockedUseLinksPayload = jest.requireMock('@/app/api/_lib/flags').useLinksPayload as jest.Mock
const mockedGetLinksLegacy = jest.requireMock('@/app/api/_lib/legacy').getLinksLegacy as jest.Mock

describe('GET /api/links', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseLinksPayload.mockReturnValue(true)
  })

  it('returns empty data/meta when no records', async () => {
    mockedFetchLinks.mockResolvedValue([])
    mockedFetchGroups.mockResolvedValue([])
    mockedFetchSections.mockResolvedValue([])

    const req = new NextRequest(new URL('http://localhost/api/links'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toMatchObject({
      data: [],
      meta: {
        sectionCount: 0,
        groupCount: 0,
        linkCount: 0,
        filters: { section: null, group: null, keyword: null, view: 'nested' },
      },
    })
  })

  it('assembles nested view with pruning and ordering, mixed id types', async () => {
    mockedFetchLinks.mockResolvedValue([
      {
        id: '1',
        slug: 'l1',
        name: 'A',
        url: 'http://a',
        description: null,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        group: { id: 11, slug: 'g1', section: { id: 21, slug: 's1' } },
      },
      {
        id: 2,
        slug: 'l2',
        name: 'B',
        url: 'http://b',
        description: null,
        sortOrder: 1,
        createdAt: '2024-02-01T00:00:00.000Z',
        group: { id: 'g1', slug: 'g1', section: { id: 's1', slug: 's1' } },
      },
      {
        id: 3,
        slug: 'l3',
        name: 'C',
        url: 'http://c',
        description: null,
        sortOrder: 0,
        createdAt: '2024-03-01T00:00:00.000Z',
        group: { id: 'g2', slug: 'g2', section: { id: 's2', slug: 's2' } },
      },
    ])

    mockedFetchGroups.mockResolvedValue([
      { id: 11, slug: 'g1', title: 'G1', sortOrder: 5, createdAt: '2024-01-02', section: { id: 21, slug: 's1' } },
      { id: 'g2', slug: 'g2', title: 'G2', sortOrder: 4, createdAt: '2024-01-03', section: { id: 's2', slug: 's2' } },
      { id: 'g3', slug: 'g3', title: 'G3', sortOrder: 10, createdAt: '2024-01-04', section: { id: 's3', slug: 's3' } },
    ])

    mockedFetchSections.mockResolvedValue([
      { id: 21, slug: 's1', title: 'S1', sortOrder: 2, createdAt: '2024-01-10' },
      { id: 's2', slug: 's2', title: 'S2', sortOrder: 1, createdAt: '2024-01-11' },
      { id: 's3', slug: 's3', title: 'S3', sortOrder: 0, createdAt: '2024-01-12' },
    ])

    const req = new NextRequest(new URL('http://localhost/api/links'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.meta).toMatchObject({
      sectionCount: 2,
      groupCount: 2,
      linkCount: 3,
    })
    expect(body.data[0].slug).toBe('s1')
    expect(body.data[0].groups[0].slug).toBe('g1')
    expect(body.data[0].groups[0].links.map((l: any) => l.slug)).toEqual(['l2', 'l1'])
  })

  it('flat view preserves traversal order', async () => {
    mockedFetchLinks.mockResolvedValue([
      {
        id: 1,
        slug: 'l1',
        name: 'A',
        url: 'http://a',
        description: null,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        group: { id: 11, slug: 'g1', section: { id: 21, slug: 's1' } },
      },
      {
        id: 2,
        slug: 'l2',
        name: 'B',
        url: 'http://b',
        description: null,
        sortOrder: 1,
        createdAt: '2024-01-02T00:00:00.000Z',
        group: { id: 12, slug: 'g2', section: { id: 21, slug: 's1' } },
      },
    ])

    mockedFetchGroups.mockResolvedValue([
      { id: 11, slug: 'g1', title: 'G1', sortOrder: 5, createdAt: '2024-01-02', section: { id: 21, slug: 's1' } },
      { id: 12, slug: 'g2', title: 'G2', sortOrder: 4, createdAt: '2024-01-03', section: { id: 21, slug: 's1' } },
    ])

    mockedFetchSections.mockResolvedValue([
      { id: 21, slug: 's1', title: 'S1', sortOrder: 2, createdAt: '2024-01-10' },
    ])

    const req = new NextRequest(new URL('http://localhost/api/links?view=flat'))
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.map((l: any) => l.slug)).toEqual(['l1', 'l2'])
  })

  it('flag off calls legacy', async () => {
    mockedUseLinksPayload.mockReturnValue(false)
    mockedGetLinksLegacy.mockResolvedValue(
      new Response(JSON.stringify({ data: 'legacy' }), { status: 200 }) as any,
    )

    const req = new NextRequest(new URL('http://localhost/api/links'))
    const res = await GET(req)

    expect(mockedGetLinksLegacy).toHaveBeenCalledTimes(1)
    expect(mockedFetchLinks).not.toHaveBeenCalled()
    expect(res.status).toBe(200)
  })
})
