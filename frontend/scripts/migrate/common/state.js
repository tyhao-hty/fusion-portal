import fs from 'fs'
import path from 'path'

const stateDir = path.resolve(process.cwd(), 'scripts', 'migrate', 'state')

const ensureDir = () => {
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true })
  }
}

const statePath = (name) => {
  ensureDir()
  return path.join(stateDir, `${name}.json`)
}

export const loadState = (name) => {
  const file = statePath(name)
  if (!fs.existsSync(file)) return {}
  try {
    const content = fs.readFileSync(file, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Failed to read state file ${file}`, error)
    return {}
  }
}

export const saveState = (name, data) => {
  const file = statePath(name)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const appendErrorLog = (name, lines) => {
  ensureDir()
  const logPath = path.join(stateDir, `errors-${name}.log`)
  const payload = Array.isArray(lines) ? lines.join('\n') : String(lines)
  fs.appendFileSync(logPath, `${payload}\n`)
}

export const stateDirPath = stateDir
