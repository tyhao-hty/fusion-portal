import fs from 'fs'
import path from 'path'

const parseLine = (line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const eqIndex = trimmed.indexOf('=')
  if (eqIndex === -1) return null
  const key = trimmed.slice(0, eqIndex).trim()
  const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '')
  if (!key) return null
  return [key, value]
}

export const loadEnvFile = (filePath) => {
  try {
    const resolved = path.resolve(filePath)
    if (!fs.existsSync(resolved)) return
    const content = fs.readFileSync(resolved, 'utf8')
    content.split('\n').forEach((line) => {
      const entry = parseLine(line)
      if (entry) {
        const [key, value] = entry
        if (process.env[key] === undefined) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.error(`Failed to load env file at ${filePath}`, error)
  }
}

export const redactConnectionString = (conn) => {
  if (!conn) return ''
  try {
    const url = new URL(conn)
    const userInfo = url.username ? `${url.username}@` : ''
    return `${url.protocol}//${userInfo}${url.hostname}:${url.port}${url.pathname}`
  } catch {
    return conn
  }
}

export const extractDbName = (conn) => {
  if (!conn) return ''
  try {
    const url = new URL(conn)
    return url.pathname.replace(/^\//, '')
  } catch {
    return ''
  }
}
