import { NextResponse, type NextRequest } from 'next/server'

export async function getTimelineLegacy(req: NextRequest): Promise<NextResponse> {
  // Placeholder for real legacy handler invocation; should be replaced with actual legacy logic wiring.
  return NextResponse.json(
    {
      data: [],
      meta: {
        page: 1,
        limit: 8,
        pageSize: 8,
        total: 0,
        totalPages: 0,
        order: 'desc',
        hasNext: false,
        hasMore: false,
      },
    },
    { status: 200 },
  )
}

export async function getLinksLegacy(req: NextRequest): Promise<NextResponse> {
  // Placeholder for real legacy handler invocation; should be replaced with actual legacy logic wiring.
  return NextResponse.json(
    {
      data: [],
      meta: {
        sectionCount: 0,
        groupCount: 0,
        linkCount: 0,
        filters: {
          section: null,
          group: null,
          keyword: null,
          view: 'nested',
        },
      },
    },
    { status: 200 },
  )
}

export async function getPapersLegacy(req: NextRequest): Promise<NextResponse> {
  // Placeholder for real legacy handler invocation; should be replaced with actual legacy logic wiring.
  return NextResponse.json(
    {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasMore: false,
      },
    },
    { status: 200 },
  )
}

export async function getArticlesLegacy(req: NextRequest): Promise<NextResponse> {
  // Placeholder for real legacy handler invocation; should be replaced with actual legacy logic wiring.
  return NextResponse.json(
    {
      data: [],
      meta: {
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNext: false,
      },
    },
    { status: 200 },
  )
}

export async function getArticleDetailLegacy(req: NextRequest): Promise<NextResponse> {
  // Placeholder for real legacy handler invocation; should be replaced with actual legacy logic wiring.
  return NextResponse.json({ message: '文章不存在' }, { status: 404 })
}
