import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'

const STATE_KEY = 'link_groups'
const REQUIRED_FIELDS = ['title', 'slug', 'section']

const ensureFields = (config) => {
  const fieldNames = (config?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) throw new Error(`Missing required field on link-groups: ${field}`)
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
  const logger = new Logger('link-groups')
  const limit = parseLimit()
  if (limit) console.log(`[link-groups] limit enabled: ${limit}`)

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[link-groups] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[link-groups] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[link-groups] payload conn=${payloadConn}`)
  console.log(`[link-groups] prisma conn=${prismaConn}`)

  const config =
    payload.collections?.['link-groups']?.config ||
    payload.collections?.linkgroups?.config ||
    payload.collections?.LinkGroups?.config
  try {
    ensureFields(config)
    console.log('[link-groups] collection fields validated')
  } catch (error) {
    console.error(`[link-groups] ${error.message}`)
    process.exit(1)
  }

  const state = loadState(STATE_KEY)
  const stateSections = loadState('link_sections')

  const legacyGroups = await prisma.linkGroup.findMany({
    orderBy: { id: 'asc' },
    ...(limit ? { take: limit } : {}),
  })
  console.log(`[link-groups] Found ${legacyGroups.length} legacy groups${limit ? ` (limited to ${limit})` : ''}`)

  for (const legacy of legacyGroups) {
    const legacyId = legacy.id
    const existing = state[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'link-groups', id: existing.payloadId })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[link-groups] mapped payload group ${existing.payloadId} missing, will recreate`)
      }
    }

    const sectionMap = stateSections[String(legacy.sectionId)]
    if (!sectionMap) {
      const msg = `[link-groups] missing section mapping for sectionId=${legacy.sectionId}, group=${legacyId}`
      logger.recordFail(msg)
      appendErrorLog(STATE_KEY, msg)
      continue
    }

    const dup = await payload.find({
      collection: 'link-groups',
      where: { slug: { equals: legacy.slug } },
      limit: 1,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      state[String(legacyId)] = {
        payloadId: doc.id,
        slug: doc.slug,
        createdAt: new Date().toISOString(),
        source: '08_link_groups',
        legacy: { table: 'LinkGroup', id: legacyId },
      }
      logger.recordSkip()
      continue
    }

    try {
      const created = await payload.create({
        collection: 'link-groups',
        data: {
          title: legacy.title || '',
          slug: legacy.slug,
          section: sectionMap.payloadId,
          description: legacy.description || '',
          sortOrder: legacy.sortOrder ?? 0,
        },
      })

      state[String(legacyId)] = {
        payloadId: created.id,
        slug: created.slug,
        createdAt: new Date().toISOString(),
        source: '08_link_groups',
        legacy: { table: 'LinkGroup', id: legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] slug=${legacy.slug}: ${error.message}`)
      console.error(`[link-groups] failed to migrate group ${legacyId}`, error)
    }
  }

  saveState(STATE_KEY, state)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[link-groups] fatal error', error)
  process.exit(1)
})
