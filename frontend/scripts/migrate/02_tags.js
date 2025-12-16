import path from 'path'
import { fileURLToPath } from 'url'
import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STATE_KEY = 'tags'
const REQUIRED_FIELDS = ['name', 'slug', 'type']

const ensureTagFields = (tagsConfig) => {
  const fieldNames = (tagsConfig?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) {
      throw new Error(`Missing required field on tags collection: ${field}`)
    }
  }
}

const slugify = (value) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const buildLegacyRecords = ({ tags, categories, paperTags }) => {
  const records = []

  tags.forEach((t) =>
    records.push({
      legacyKey: `tag:${t.id}`,
      name: t.name,
      slug: t.slug || slugify(t.name),
      type: 'article_tag',
      sortOrder: 0,
      sourceTable: 'Tag',
      legacyId: t.id,
    }),
  )

  categories.forEach((c) =>
    records.push({
      legacyKey: `category:${c.id}`,
      name: c.name,
      slug: c.slug || slugify(c.name),
      type: 'category',
      sortOrder: c.sortOrder ?? 0,
      sourceTable: 'Category',
      legacyId: c.id,
    }),
  )

  paperTags.forEach((p) =>
    records.push({
      legacyKey: `papertag:${p.id}`,
      name: p.name,
      slug: p.slug || slugify(p.name),
      type: 'paper_tag',
      sortOrder: 0,
      sourceTable: 'PaperTag',
      legacyId: p.id,
    }),
  )

  return records
}

const ensureUniqueSlug = async ({ payload, baseSlug, type }) => {
  let candidate = baseSlug || 'tag'
  let attempt = 0
  while (true) {
    const slug = attempt === 0 ? candidate : `${candidate}-${attempt}`
    const found = await payload.find({
      collection: 'tags',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (!found?.docs?.length) return slug
    const doc = found.docs[0]
    if (doc.type === type) return slug // same type keeps slug to avoid churn
    attempt += 1
  }
}

const main = async () => {
  const logger = new Logger('tags')

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[tags] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[tags] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[tags] payload conn=${payloadConn}`)
  console.log(`[tags] prisma conn=${prismaConn}`)

  const tagsConfig = payload.collections?.tags?.config
  try {
    ensureTagFields(tagsConfig)
    console.log('[tags] tags collection fields validated')
  } catch (error) {
    console.error(`[tags] ${error.message}`)
    process.exit(1)
  }

  const state = loadState(STATE_KEY)

  const [legacyTags, legacyCategories, legacyPaperTags] = await Promise.all([
    prisma.tag.findMany(),
    prisma.category.findMany(),
    prisma.paperTag.findMany(),
  ])

  const records = buildLegacyRecords({
    tags: legacyTags,
    categories: legacyCategories,
    paperTags: legacyPaperTags,
  })

  console.log(`[tags] total legacy records=${records.length}`)

  for (const rec of records) {
    const existing = state[rec.legacyKey]
    if (existing) {
      try {
        await payload.findByID({ collection: 'tags', id: existing.payloadId, overrideAccess: true })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[tags] mapped payload tag ${existing.payloadId} missing, will recreate`)
      }
    }

    // dedupe by name + type
    const dup = await payload.find({
      collection: 'tags',
      where: {
        name: { equals: rec.name },
        type: { equals: rec.type },
      },
      limit: 1,
      overrideAccess: true,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      state[rec.legacyKey] = {
        payloadId: doc.id,
        name: doc.name,
        type: doc.type,
        slug: doc.slug,
        createdAt: new Date().toISOString(),
        source: '02_tags',
        legacy: { table: rec.sourceTable, id: rec.legacyId },
      }
      logger.recordSkip()
      continue
    }

    const slug = await ensureUniqueSlug({ payload, baseSlug: rec.slug, type: rec.type })

    try {
      const created = await payload.create({
        collection: 'tags',
        data: {
          name: rec.name,
          slug,
          type: rec.type,
          sortOrder: rec.sortOrder ?? 0,
        },
        overrideAccess: true,
      })

      state[rec.legacyKey] = {
        payloadId: created.id,
        name: created.name,
        type: created.type,
        slug: created.slug,
        createdAt: new Date().toISOString(),
        source: '02_tags',
        legacy: { table: rec.sourceTable, id: rec.legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy=${rec.legacyKey}] ${rec.name} (${rec.type}): ${error.message}`)
      console.error(`[tags] failed to migrate ${rec.legacyKey}`, error)
    }
  }

  saveState(STATE_KEY, state)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[tags] fatal error', error)
  process.exit(1)
})
