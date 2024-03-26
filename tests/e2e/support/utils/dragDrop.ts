import { readFileSync } from 'fs'
import { Page, expect } from '@playwright/test'

interface File {
  name: string
  path: string
}

interface FileBuffer {
  name: string
  bufferString: string
}

export const dragDropFiles = async (page: Page, resources: File[], targetSelector: string) => {
  const files = resources.map((file) => ({
    name: file.name,
    bufferString: JSON.stringify(Array.from(readFileSync(file.path)))
  }))
  // waiting to files view
  await expect(page.locator('#new-file-menu-btn')).toBeVisible()

  await page.evaluate(
    ([files, targetSelector]: [FileBuffer[], string]) => {
      const dropArea = document.querySelector(targetSelector)
      const dt = new DataTransfer()

      for (const file of files) {
        const buffer = Buffer.from(JSON.parse(file.bufferString))
        const blob = new Blob([buffer])
        dt.items.add(new File([blob], file.name))
      }

      dropArea.dispatchEvent(new DragEvent('drop', { dataTransfer: dt }))

      return Promise.resolve()
    },
    [files, targetSelector]
  )
}
