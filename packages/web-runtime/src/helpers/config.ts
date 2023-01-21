import { v4 as uuidV4 } from 'uuid'

export const loadConfig = async () => {
  let config = await fetch('config.json', { headers: { 'X-Request-ID': uuidV4() } })
  if (config.status !== 200) {
    throw new Error(`config could not be loaded. HTTP status-code ${config.status}`)
  }
  try {
    config = await config.json()
  } catch (e) {
    throw new Error(`config could not be parsed. ${e}`)
  }
  return config
}
