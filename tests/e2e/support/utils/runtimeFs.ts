import fs from 'fs'
import path from 'path'
import { config } from '../../config'

export const getBytes = (fileSize: string): number => {
  fileSize = fileSize.replace(/\s/g, '').toLowerCase()
  const size = fileSize.match(/(\d+)/)[0]
  const type = fileSize.match(/[kKmMgGbB]{2}/)[0]

  if (!type) {
    return parseInt(size)
  }

  switch (type) {
    case 'kb':
      return parseInt(size) * 1024
    case 'mb':
      return parseInt(size) * Math.pow(1024, 2)
    case 'gb':
      return parseInt(size) * Math.pow(1024, 3)
    default:
      throw new Error('Invalid file size. Must be one of these: kb, mb, gb')
  }
}

export const getTempUploadPath = (): string => {
  if (!fs.existsSync(config.tempAssetsPath)) {
    fs.mkdirSync(config.tempAssetsPath)
  }
  return config.tempAssetsPath
}

export const createFileWithSize = (fileName: string, sizeInBytes: number, dir: string): void => {
  const content = Buffer.alloc(sizeInBytes)
  const file = fs.openSync(path.join(dir, fileName), 'w')
  fs.writeSync(file, content)
  fs.closeSync(file)
}
