import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'

const STATE_KEY = 'link_sections'
const REQUIRED_FIELDS = ['title', 'slug']

const ensureFields = (config) => {
  const fieldNames = (config?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) throw new Error(`Missing required field on link-sections: ${field}`)
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
  const logger = new Logger('link-sections')
  const limit = parseLimit()
  if (limit) console.log(`[link-sections] limit enabled: ${limit}`)

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[link-sections] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[link-sections] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[link-sections] payload conn=${payloadConn}`)
  console.log(`[link-sections] prisma conn=${prismaConn}`)

  const config =
    payload.collections?.['link-sections']?.config ||
    payload.collections?.linksections?.config ||
    payload.collections?.LinkSections?.config
  try {
    ensureFields(config)
    console.log('[link-sections] collection fields validated')
  } catch (error) {
    console.error(`[link-sections] ${error.message}`)
    process.exit(1)
  }

  const state = loadState(STATE_KEY)
  const legacySections = await prisma.linkSection.findMany({
    orderBy: { id: 'asc' },
    ...(limit ? { take: limit } : {}),
  })
  console.log(`[link-sections] Found ${legacySections.length} legacy sections${limit ? ` (limited to ${limit})` : ''}`)

  for (const legacy of legacySections) {
    const legacyId = legacy.id
    const existing = state[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'link-sections', id: existing.payloadId })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[link-sections] mapped payload section ${existing.payloadId} missing, will recreate`)
      }
    }

    const dup = await payload.find({
      collection: 'link-sections',
      where: { slug: { equals: legacy.slug } },
      limit: 1,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      state[String(legacyId)] = {
        payloadId: doc.id,
        slug: doc.slug,
        createdAt: new Date().toISOString(),
        source: '07_link_sections',
        legacy: { table: 'LinkSection', id: legacyId },
      }
      logger.recordSkip()
      continue
    }

    try {
      const created = await payload.create({
        collection: 'link-sections',
        data: {
          title: legacy.title,
          slug: legacy.slug,
          description: legacy.description || '',
          sortOrder: legacy.sortOrder ?? 0,
        },
      })

      state[String(legacyId)] = {
        payloadId: created.id,
        slug: created.slug,
        createdAt: new Date().toISOString(),
        source: '07_link_sections',
        legacy: { table: 'LinkSection', id: legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] slug=${legacy.slug}: ${error.message}`)
      console.error(`[link-sections] failed to migrate section ${legacyId}`, error)
    }
  }

  saveState(STATE_KEY, state)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[link-sections] fatal error', error)
  process.exit(1)
})
