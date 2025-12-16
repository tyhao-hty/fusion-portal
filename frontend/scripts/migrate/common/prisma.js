import path from 'path'
import { fileURLToPath } from 'url'
import { extractDbName, loadEnvFile, redactConnectionString } from './env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const initPrismaClient = async () => {
  loadEnvFile(path.resolve(__dirname, '..', '..', '..', 'backend', '.env'))

  const conn = process.env.DATABASE_URL || ''
  if (!conn) {
    console.error('[prisma] DATABASE_URL is required')
    process.exit(1)
  }
  const dbName = extractDbName(conn)

  console.log(`[prisma] Connecting to ${redactConnectionString(conn)} (db=${dbName})`)

  const { PrismaClient } = await import('../../../../backend/node_modules/@prisma/client/index.js')
  const prisma = new PrismaClient({
    log: ['warn', 'error'],
  })

  return { prisma, dbName, connectionString: conn }
}
