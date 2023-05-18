import path from 'path'
import { config } from '../../config'
import fs from 'fs'

export default function (numberOfFiles: number) {
  const folder_path = path.join(config.assets, '/multipleFiles')
  if (!fs.existsSync(folder_path)) {
    fs.mkdirSync(folder_path, { recursive: true })
  }
  for (let i = 1; i <= numberOfFiles; i++) {
    const file_path = path.join(config.assets, `/multipleFiles/file${i}.txt`)
    const file_content = 'Hello'
    fs.writeFileSync(file_path, file_content)
  }
}
