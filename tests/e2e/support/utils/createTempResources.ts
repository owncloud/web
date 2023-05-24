import path from 'path'
import fs from 'fs'
import { config } from '../../config'

export default function (numberOfFiles: number) {
  const createdFiles = []
  if (!fs.existsSync(config.tempAssetsPath)) {
    fs.mkdirSync(config.tempAssetsPath, { recursive: true })
  }
  for (let i = 1; i <= numberOfFiles; i++) {
    const file_path = path.join(config.tempAssetsPath, `/file${i}.txt`)
    fs.writeFileSync(file_path, 'test content')
    createdFiles.push(`/temp/file${i}.txt`)
  }
  return createdFiles
}
