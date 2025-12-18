import type { Payload, Where } from 'payload'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import type { PapersQuery, PaperRecord } from './types'

let cachedPayload: Payload | null = null

const getClient = async () => {
  if (cachedPayload) return cachedPayload
  cachedPayload = await getPayload({ config: payloadConfig })
  return cachedPayload
}

export async function lookupPaperTagIds(tags: string[]): Promise<string[]> {
  const client = await getClient()
  const result = await client.find({
    collection: 'tags',
    where: {
      and: [
        { type: { equals: 'paper_tag' } },
        { or: tags.map((value) => ({ or: [{ slug: { equals: value } }, { name: { equals: value } }] })) },
      ],
    },
    depth: 0,
    limit: 1000,
  })
  return (result.docs || []).map((doc: any) => String(doc.id))
}

export async function fetchPapers(
  query: PapersQuery,
  sort: string[],
  tagIds?: string[],
): Promise<{ total: number; items: PaperRecord[] }> {
  if (query.tags && query.tags.length && tagIds && tagIds.length === 0) {
    return { total: 0, items: [] }
  }

  const client = await getClient()
  const where: Where = {}
  const and: Where[] = []

  if (query.search) {
    and.push({
      or: [
        { title: { like: `%${query.search}%` } },
        { abstract: { like: `%${query.search}%` } },
        { venue: { like: `%${query.search}%` } },
        { 'authors.name': { like: `%${query.search}%` } },
      ],
    })
  }

  if (typeof query.year === 'number') {
    and.push({ year: { equals: query.year } })
  } else if (typeof query.year === 'string') {
    and.push({
      or: [
        { venue: { like: `%${query.year}%` } },
        { title: { like: `%${query.year}%` } },
      ],
    })
  }

  if (typeof query.yearFrom === 'number') {
    and.push({ year: { greater_than_equal: query.yearFrom } })
  }
  if (typeof query.yearTo === 'number') {
    and.push({ year: { less_than_equal: query.yearTo } })
  }

  if (query.tags?.length) {
    if (tagIds && tagIds.length) {
      and.push({
        tags: {
          in: tagIds,
        },
      })
    } else {
      and.push({
        tags: {
          some: {
            or: query.tags.map((value) => ({
              or: [{ slug: { equals: value } }, { name: { equals: value } }],
            })),
          },
        },
      })
      and.push({ 'tags.type': { equals: 'paper_tag' } })
    }
  }

  if (and.length) {
    where.and = and
  }

  const result = await client.find({
    collection: 'papers',
    where,
    sort,
    page: query.page,
    limit: query.limit,
    depth: 1,
  })

  return {
    total: result.totalDocs ?? 0,
    items: (result.docs || []) as PaperRecord[],
  }
}
