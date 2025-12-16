import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initPayloadClient } from './common/payload.js'
import { initPrismaClient } from './common/prisma.js'
import { Logger } from './common/logger.js'
import { appendErrorLog, loadState, saveState, stateDirPath } from './common/state.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REQUIRED_USER_FIELDS = ['name', 'roles']
const STATE_KEY = 'users'

const roleMap = {
  admin: 'admin',
  editor: 'editor',
  publisher: 'publisher',
  author: 'author',
  user: 'author',
}

const ensureUserFields = (usersConfig) => {
  if (!usersConfig?.auth) {
    throw new Error('Payload users collection must enable auth (email/password)')
  }
  const fieldNames = (usersConfig.fields || []).map((f) => f.name)
  for (const field of REQUIRED_USER_FIELDS) {
    if (!fieldNames.includes(field)) {
      throw new Error(`Missing required field on users collection: ${field}`)
    }
  }
}

const mapLegacyRole = (legacyRole) => {
  if (!legacyRole) return ['author']
  const normalized = legacyRole.toLowerCase()
  return [roleMap[normalized] || 'author']
}

const randomPassword = () => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let pwd = 'Temp-'
  for (let i = 0; i < 10; i += 1) {
    pwd += charset[Math.floor(Math.random() * charset.length)]
  }
  return pwd
}

const writePasswordCsv = (rows) => {
  if (!rows.length) return
  const header = 'legacy_id,email,temp_password\n'
  const lines = rows.map((r) => `${r.legacyId},${r.email},${r.password}`)
  const csv = header + lines.join('\n')
  const dest = path.join(stateDirPath, 'users-temp-passwords.csv')
  fs.writeFileSync(dest, csv)
  console.log(`[users] wrote temp password CSV: ${dest}`)
}

const main = async () => {
  const logger = new Logger('users')

  const [{ payload, dbName: payloadDb, connectionString: payloadConn }, { prisma, dbName: prismaDb, connectionString: prismaConn }] =
    await Promise.all([initPayloadClient(), initPrismaClient()])

  if (payloadDb && prismaDb && payloadDb === prismaDb) {
    console.error(`[users] payload DB (${payloadDb}) and prisma DB (${prismaDb}) are identical. Abort.`)
    process.exit(1)
  }

  console.log(`[users] payload DB=${payloadDb}, prisma DB=${prismaDb}`)
  console.log(`[users] payload conn=${payloadConn}`)
  console.log(`[users] prisma conn=${prismaConn}`)

  const usersConfig = payload.collections?.users?.config
  try {
    ensureUserFields(usersConfig)
    console.log('[users] users collection fields validated')
  } catch (error) {
    console.error(`[users] ${error.message}`)
    process.exit(1)
  }

  const state = loadState(STATE_KEY)
  const tempPasswords = []

  const legacyUsers = await prisma.user.findMany()
  console.log(`[users] Found ${legacyUsers.length} legacy users`)

  for (const legacy of legacyUsers) {
    const legacyId = legacy.id
    const existing = state[String(legacyId)]
    if (existing) {
      try {
        await payload.findByID({ collection: 'users', id: existing.payloadId })
        logger.recordSkip()
        continue
      } catch {
        console.warn(`[users] mapped payload user ${existing.payloadId} missing, will recreate`)
      }
    }

    // dedupe by email
    const found = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: legacy.email,
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (found?.docs?.length) {
      const doc = found.docs[0]
      state[String(legacyId)] = {
        payloadId: doc.id,
        email: legacy.email,
        createdAt: new Date().toISOString(),
        source: '01_users',
      }
      logger.recordSkip()
      continue
    }

    const password = randomPassword()
    try {
      const created = await payload.create({
        collection: 'users',
        data: {
          email: legacy.email,
          name: legacy.name || legacy.email,
          roles: mapLegacyRole(legacy.role),
          password,
        },
        overrideAccess: true,
      })

      state[String(legacyId)] = {
        payloadId: created.id,
        email: legacy.email,
        createdAt: new Date().toISOString(),
        source: '01_users',
      }

      tempPasswords.push({ legacyId, email: legacy.email, password })
      logger.recordSuccess()
    } catch (error) {
      logger.recordFail(error)
      appendErrorLog(STATE_KEY, `[legacy_id=${legacyId}] ${legacy.email}: ${error.message}`)
      console.error(`[users] failed to migrate user ${legacyId}`, error)
    }
  }

  saveState(STATE_KEY, state)
  writePasswordCsv(tempPasswords)
  logger.printSummary()

  await payload.shutdown?.()
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('[users] fatal error', error)
  process.exit(1)
})
