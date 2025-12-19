import type { Payload, Where } from 'payload'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import type { LinksQuery, LinkRecord, GroupRecord, SectionRecord } from './types'

let cachedPayload: Payload | null = null

const getClient = async () => {
  if (cachedPayload) return cachedPayload
  cachedPayload = await getPayload({ config: payloadConfig })
  return cachedPayload
}

const linkSort = ['-sortOrder', '-createdAt']
const groupSort = ['-sortOrder', '-createdAt']
const sectionSort = ['-sortOrder', '-createdAt']

export async function fetchLinks(query: LinksQuery): Promise<LinkRecord[]> {
  const client = await getClient()

  const where: Where = {}

  if (query.keyword) {
    where.or = [
      { name: { like: `%${query.keyword}%` } },
      { description: { like: `%${query.keyword}%` } },
      { url: { like: `%${query.keyword}%` } },
    ]
  }

  if (query.group) {
    where.and = where.and || []
    where.and.push({
      'group.slug': { equals: query.group },
    })
  }

  if (query.section) {
    where.and = where.and || []
    where.and.push({
      'group.section.slug': { equals: query.section },
    })
  }

  const result = await client.find({
    collection: 'links',
    where,
    sort: linkSort,
    // Need depth>0 so group.section slugs are populated; depth 0 returns IDs and prunes everything in assembly.
    depth: 1,
    limit: 0,
  })

  return (result.docs || []) as LinkRecord[]
}

export async function fetchGroups(query: LinksQuery): Promise<GroupRecord[]> {
  const client = await getClient()

  const where: Where = {}

  if (query.group) {
    where.slug = { equals: query.group }
  }

  const result = await client.find({
    collection: 'link-groups',
    where,
    sort: groupSort,
    // Hydrate section relation so assembly can attach groups; depth 0 only returns IDs.
    depth: 1,
    limit: 0,
  })

  return (result.docs || []) as GroupRecord[]
}

export async function fetchSections(query: LinksQuery): Promise<SectionRecord[]> {
  const client = await getClient()

  const where: Where = {}

  if (query.section) {
    where.slug = { equals: query.section }
  }

  const result = await client.find({
    collection: 'link-sections',
    where,
    sort: sectionSort,
    depth: 0,
    limit: 0,
  })

  return (result.docs || []) as SectionRecord[]
}
