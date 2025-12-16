import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'
import { ensureSystemAccount } from './common/system.js'

const STATE_KEY = 'timeline'
const REQUIRED_FIELDS = ['title', 'yearLabel', 'description']

const ensureTimelineFields = (timelineConfig) => {
  const fieldNames = (timelineConfig?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) {
      throw new Error(`Missing required field on timeline collection: ${field}`)
    }
  }
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
  const logger = new Logger('timeline')
  const limit = parseLimit()
  if (limit) console.log(`[timeline] limit enabled: ${limit}`)

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[timeline] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[timeline] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[timeline] payload conn=${payloadConn}`)
  console.log(`[timeline] prisma conn=${prismaConn}`)

  const config =
    payload.collections?.['timeline-events']?.config ||
    payload.collections?.timelineevents?.config ||
    payload.collections?.TimelineEvents?.config
  try {
    ensureTimelineFields(config)
    console.log('[timeline] timeline collection fields validated')
  } catch (error) {
    console.error(`[timeline] ${error.message}`)
    process.exit(1)
  }

  const systemId = await ensureSystemAccount(payload)
  console.log(`[timeline] system account id=${systemId}`)

  const stateTimeline = loadState(STATE_KEY)
  const stateArticles = loadState('articles')

  const legacyTimeline = await prisma.timelineEvent.findMany({
    orderBy: { id: 'asc' },
    ...(limit ? { take: limit } : {}),
  })
  console.log(`[timeline] Found ${legacyTimeline.length} legacy timeline events${limit ? ` (limited to ${limit})` : ''}`)

  for (const legacy of legacyTimeline) {
    const legacyId = legacy.id
    const existing = stateTimeline[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'timeline-events', id: existing.payloadId })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[timeline] mapped payload event ${existing.payloadId} missing, will recreate`)
      }
    }

    // dedupe by composite (yearLabel + title) as fallback
    const dup = await payload.find({
      collection: 'timeline-events',
      where: {
        and: [
          { yearLabel: { equals: legacy.yearLabel || '' } },
          { title: { equals: legacy.title || '' } },
        ],
      },
      limit: 1,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      stateTimeline[String(legacyId)] = {
        payloadId: doc.id,
        createdAt: new Date().toISOString(),
        source: '06_timeline',
        legacy: { table: 'TimelineEvent', id: legacyId },
      }
      logger.recordSkip()
      continue
    }

    let relatedArticle = null
    if (legacy.relatedArticleId) {
      const mapped = stateArticles[String(legacy.relatedArticleId)]
      if (!mapped) {
        console.warn(
          `[timeline] related article mapping missing for articleId=${legacy.relatedArticleId}, timeline=${legacyId}, skipping relation`,
        )
      } else {
        relatedArticle = mapped.payloadId
      }
    }

    const data = {
      title: legacy.title,
      description: legacy.description || '',
      yearLabel: legacy.yearLabel || '',
      date: legacy.yearValue ? `${legacy.yearValue}-01-01T00:00:00.000Z` : null,
      sortOrder: legacy.sortOrder ?? 0,
      relatedArticle,
      createdBy: systemId,
    }

    try {
      const created = await payload.create({
        collection: 'timeline-events',
        data,
      })

      stateTimeline[String(legacyId)] = {
        payloadId: created.id,
        createdAt: new Date().toISOString(),
        source: '06_timeline',
        legacy: { table: 'TimelineEvent', id: legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] slug=${legacy.slug}: ${error.message}`)
      console.error(`[timeline] failed to migrate event ${legacyId}`, error)
    }
  }

  saveState(STATE_KEY, stateTimeline)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[timeline] fatal error', error)
  process.exit(1)
})
