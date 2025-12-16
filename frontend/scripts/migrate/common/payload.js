import path from 'path'
import { fileURLToPath } from 'url'
import payload from 'payload'
import jiti from 'jiti'
import { extractDbName, loadEnvFile, redactConnectionString } from './env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadPayloadConfig = () => {
  const resolver = jiti(import.meta.url, { interopDefault: true, cache: false })
  const configPath = path.resolve(__dirname, '..', '..', '..', 'payload.config.ts')
  return resolver(configPath)
}

export const initPayloadClient = async () => {
  // Load env from repo root .env
  loadEnvFile(path.resolve(__dirname, '..', '..', '..', '.env'))

  const payloadConfig = loadPayloadConfig()
  const conn = process.env.DATABASE_URI || ''
  const dbName = extractDbName(conn)
  const adapterName = 'postgres'

  if (!conn) {
    console.error('[payload] DATABASE_URI is required')
    process.exit(1)
  }

  console.log(`[payload] Connecting to ${redactConnectionString(conn)} (db=${dbName}), adapter=${adapterName}`)

  await payload.init({
    config: payloadConfig.default || payloadConfig,
    secret: process.env.PAYLOAD_SECRET || 'dev-secret',
    local: true,
  })

  return { payload, dbName, connectionString: conn, adapterName }
}
