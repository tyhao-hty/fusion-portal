import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'
import { ensureSystemAccount } from './common/system.js'

const STATE_KEY = 'links'
const REQUIRED_FIELDS = ['name', 'url', 'group']

const ensureFields = (config) => {
  const fieldNames = (config?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) throw new Error(`Missing required field on links: ${field}`)
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
  const logger = new Logger('links')
  const limit = parseLimit()
  if (limit) console.log(`[links] limit enabled: ${limit}`)

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[links] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[links] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[links] payload conn=${payloadConn}`)
  console.log(`[links] prisma conn=${prismaConn}`)

  const config =
    payload.collections?.links?.config ||
    payload.collections?.Links?.config
  try {
    ensureFields(config)
    console.log('[links] collection fields validated')
  } catch (error) {
    console.error(`[links] ${error.message}`)
    process.exit(1)
  }

  const systemId = await ensureSystemAccount(payload)
  console.log(`[links] system account id=${systemId}`)

  const state = loadState(STATE_KEY)
  const stateGroups = loadState('link_groups')

  const legacyLinks = await prisma.link.findMany({
    orderBy: { id: 'asc' },
    ...(limit ? { take: limit } : {}),
  })
  console.log(`[links] Found ${legacyLinks.length} legacy links${limit ? ` (limited to ${limit})` : ''}`)

  for (const legacy of legacyLinks) {
    const legacyId = legacy.id
    const existing = state[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'links', id: existing.payloadId })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[links] mapped payload link ${existing.payloadId} missing, will recreate`)
      }
    }

    const groupMap = stateGroups[String(legacy.groupId)]
    if (!groupMap) {
      const msg = `[links] missing group mapping for groupId=${legacy.groupId}, link=${legacyId}`
      logger.recordFail(msg)
      appendErrorLog(STATE_KEY, msg)
      continue
    }

    const dup = await payload.find({
      collection: 'links',
      where: { slug: { equals: legacy.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      state[String(legacyId)] = {
        payloadId: doc.id,
        slug: doc.slug,
        createdAt: new Date().toISOString(),
        source: '09_links',
        legacy: { table: 'Link', id: legacyId },
      }
      logger.recordSkip()
      continue
    }

    try {
      const created = await payload.create({
        collection: 'links',
        data: {
          name: legacy.name,
          slug: legacy.slug,
          url: legacy.url,
          description: legacy.description || '',
          group: groupMap.payloadId,
          sortOrder: legacy.sortOrder ?? 0,
          createdBy: systemId,
        },
        overrideAccess: true,
      })

      state[String(legacyId)] = {
        payloadId: created.id,
        slug: created.slug,
        createdAt: new Date().toISOString(),
        source: '09_links',
        legacy: { table: 'Link', id: legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] slug=${legacy.slug}: ${error.message}`)
      console.error(`[links] failed to migrate link ${legacyId}`, error)
    }
  }

  saveState(STATE_KEY, state)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[links] fatal error', error)
  process.exit(1)
})
