import fs from 'fs'
import path from 'path'

const CONFIG_PATH = path.resolve('config.json')

const defaults = {
  region: process.env.AWS_REGION || 'ap-south-1',
  bucket: process.env.S3_BUCKET || '',
  prefix: process.env.S3_PREFIX || 'spotify/tracks/'
}

export function readConfig() {
  try {
    const txt = fs.readFileSync(CONFIG_PATH, 'utf-8')
    const cfg = JSON.parse(txt)
    return { ...defaults, ...cfg }
  } catch {
    return { ...defaults }
  }
}

export function writeConfig(partial) {
  const prev = readConfig()
  const merged = { ...prev, ...partial }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2))
  return merged
}
