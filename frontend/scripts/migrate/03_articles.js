import path from 'path'
import { fileURLToPath } from 'url'
import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState } from './common/state.js'
import { ensureSystemAccount } from './common/system.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const STATE_KEY = 'articles'
const REQUIRED_FIELDS = ['title', 'slug', 'content', 'author', 'tags']

const ensureArticleFields = (articlesConfig) => {
  const fieldNames = (articlesConfig?.fields || []).map((f) => f.name)
  for (const field of REQUIRED_FIELDS) {
    if (!fieldNames.includes(field)) {
      throw new Error(`Missing required field on articles collection: ${field}`)
    }
  }
}

const mapStatus = (legacyStatus) => {
  if (!legacyStatus) return 'draft'
  const s = legacyStatus.toLowerCase()
  return s === 'published' ? 'published' : 'draft'
}

const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

const buildRichText = (legacyContent) => {
  const text = stripHtml(legacyContent || '')
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              text,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
        },
      ],
    },
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
  const logger = new Logger('articles')
  const limit = parseLimit()
  if (limit) console.log(`[articles] limit enabled: ${limit}`)

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[articles] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[articles] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[articles] payload conn=${payloadConn}`)
  console.log(`[articles] prisma conn=${prismaConn}`)

  const systemUserId = await ensureSystemAccount(payload)

  const articlesConfig = payload.collections?.articles?.config
  try {
    ensureArticleFields(articlesConfig)
    console.log('[articles] articles collection fields validated')
  } catch (error) {
    console.error(`[articles] ${error.message}`)
    process.exit(1)
  }

  const stateArticles = loadState(STATE_KEY)
  const stateTags = loadState('tags')
  const stateUsers = loadState('users')

  const legacyArticles = await prisma.article.findMany({
    include: { tags: true, category: true, author: true },
  })
  console.log(`[articles] Found ${legacyArticles.length} legacy articles`)

  let processed = 0

  for (const legacy of legacyArticles) {
    if (limit && processed >= limit) break
    const legacyId = legacy.id

    const existing = stateArticles[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'articles', id: existing.payloadId, overrideAccess: true })
        logger.recordSkip()
        processed += 1
        continue
      } catch {
        console.warn(`[articles] mapped payload article ${existing.payloadId} missing, will recreate`)
      }
    }

    // dedupe by slug (fallback only)
    const dup = await payload.find({
      collection: 'articles',
      where: { slug: { equals: legacy.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (dup?.docs?.length) {
      const doc = dup.docs[0]
      stateArticles[String(legacyId)] = {
        payloadId: doc.id,
        slug: doc.slug,
        createdAt: new Date().toISOString(),
        source: '03_articles',
        legacy: { table: 'Article', id: legacyId },
      }
      logger.recordSkip()
      processed += 1
      continue
    }

    const tagIds = []
    legacy.tags?.forEach((t) => {
      const key = `tag:${t.id}`
      const mapped = stateTags[key]
      if (!mapped) {
        console.warn(`[articles] tag mapping missing for tagId=${t.id}, article=${legacyId}, skipping this tag`)
        return
      }
      tagIds.push(mapped.payloadId)
    })

    let categoryId = null
    if (legacy.categoryId) {
      const catKey = `category:${legacy.categoryId}`
      const mappedCat = stateTags[catKey]
      if (!mappedCat) {
        console.warn(`[articles] category mapping missing for categoryId=${legacy.categoryId}, article=${legacyId}, skipping category`)
      } else {
        categoryId = mappedCat.payloadId
      }
    }

    const authorMap = stateUsers[String(legacy.authorId)]
    if (!authorMap && legacy.authorId) {
      console.warn(`[articles] missing author mapping for legacy authorId=${legacy.authorId} (article ${legacyId}), fallback to System Account`)
    }

    const data = {
      title: legacy.title,
      slug: legacy.slug,
      excerpt: legacy.excerpt || '',
      content: buildRichText(legacy.content),
      author: authorMap?.payloadId || systemUserId,
      tags: tagIds,
      category: categoryId,
      timelineYear: legacy.timelineYear ?? null,
      _status: mapStatus(legacy.status),
    }

    if (legacy.publishedAt) {
      data.publishedAt = legacy.publishedAt
    }

    try {
      const created = await payload.create({
        collection: 'articles',
        data,
        overrideAccess: true,
      })

      stateArticles[String(legacyId)] = {
        payloadId: created.id,
        slug: created.slug,
        createdAt: new Date().toISOString(),
        source: '03_articles',
        legacy: { table: 'Article', id: legacyId },
      }
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] slug=${legacy.slug}: ${error.message}`)
      console.error(`[articles] failed to migrate article ${legacyId}`, error)
    }

    processed += 1
  }

  saveState(STATE_KEY, stateArticles)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[articles] fatal error', error)
  process.exit(1)
})
