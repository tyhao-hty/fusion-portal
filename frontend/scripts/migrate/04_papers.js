import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'
import { ensureSystemAccount } from './common/system.js'

const STATE_KEY = 'papers'
const REQUIRED_FIELDS = ['title', 'slug', 'authors', 'tags', 'createdBy']

const ensurePaperFields = (papersConfig) => {
  const fieldNames = (papersConfig?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) {
      throw new Error(`Missing required field on papers collection: ${field}`)
    }
  }
}

const parseAuthors = (raw) => {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name }))
}

const parseLimit = () => {
  const arg = process.argv.find((v) => v.startsWith('--limit='))
  if (arg) {
    const n = Number(arg.split('=')[1])
    if (!Number.isNaN(n) && n > 0) return n
  }
  const envLimit = Number(process.env.LIMIT || 0)
  return Number.isNaN(envLimit) || envLimit <= 0 ? null : envLimit
}

const main = async () => {
  const logger = new Logger('papers')
  const limit = parseLimit()
  if (limit) console.log(`[papers] limit enabled: ${limit}`)

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[papers] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[papers] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[papers] payload conn=${payloadConn}`)
  console.log(`[papers] prisma conn=${prismaConn}`)

  const systemUserId = await ensureSystemAccount(payload)

  const papersConfig = payload.collections?.papers?.config
  try {
    ensurePaperFields(papersConfig)
    console.log('[papers] papers collection fields validated')
  } catch (error) {
    console.error(`[papers] ${error.message}`)
    process.exit(1)
  }

  const statePapers = loadState(STATE_KEY)
  const stateTags = loadState('tags')
  const stateUsers = loadState('users')

  const legacyPapers = await prisma.paper.findMany({
    include: { tags: true },
    orderBy: { id: 'asc' },
    ...(limit ? { take: limit } : {}),
  })
  console.log(`[papers] Found ${legacyPapers.length} legacy papers${limit ? ` (limited to ${limit})` : ''}`)

  for (const legacy of legacyPapers) {
    const legacyId = legacy.id
    const existing = statePapers[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'papers', id: existing.payloadId, overrideAccess: true })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[papers] mapped payload paper ${existing.payloadId} missing, will recreate`)
      }
    }

    // dedupe by slug (fallback only)
    const dup = await payload.find({
      collection: 'papers',
      where: { slug: { equals: legacy.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      statePapers[String(legacyId)] = {
        payloadId: doc.id,
        slug: doc.slug,
        createdAt: new Date().toISOString(),
        source: '04_papers',
        legacy: { table: 'Paper', id: legacyId },
      }
      logger.recordSkip()
      continue
    }

    const tagIds = []
    legacy.tags?.forEach((t) => {
      const key = `papertag:${t.id}`
      const mapped = stateTags[key]
      if (!mapped) {
        console.warn(`[papers] tag mapping missing for paperTagId=${t.id}, paper=${legacyId}, skipping this tag`)
        return
      }
      tagIds.push(mapped.payloadId)
    })

    const data = {
      title: legacy.title,
      slug: legacy.slug,
      authors: parseAuthors(legacy.authors),
      year: legacy.year,
      venue: legacy.venue || '',
      url: legacy.url || '',
      abstract: legacy.abstract || 'N/A',
      tags: tagIds,
      _status: 'published',
    }

    const authorMap = stateUsers[String(legacy.authorId || '')]
    if (authorMap?.payloadId) {
      data.createdBy = authorMap.payloadId
    } else {
      if (legacy.authorId) {
        console.warn(`[papers] author mapping missing for legacy authorId=${legacy.authorId}, paper=${legacyId}, fallback to System Account`)
      }
      if (!data.createdBy) {
        data.createdBy = systemUserId
      }
    }

    if (legacy.publishedAt) {
      data.publishedAt = legacy.publishedAt
    }

    try {
      const created = await payload.create({
        collection: 'papers',
        data,
        overrideAccess: true,
      })

      statePapers[String(legacyId)] = {
        payloadId: created.id,
        slug: created.slug,
        createdAt: new Date().toISOString(),
        source: '04_papers',
        legacy: { table: 'Paper', id: legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] slug=${legacy.slug}: ${error.message}`)
      console.error(`[papers] failed to migrate paper ${legacyId}`, error)
    }
  }

  saveState(STATE_KEY, statePapers)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[papers] fatal error', error)
  process.exit(1)
})
