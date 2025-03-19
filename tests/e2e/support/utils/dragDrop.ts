import { readFileSync } from 'fs'
import { Locator, Page } from '@playwright/test'

interface File {
  name: string
  path: string
}

interface FileBuffer {
  name: string
  bufferString: string
}

// drag and drop local files to a target element
export const dragDropFiles = async (page: Page, resources: File[], targetSelector: string) => {
  const files = resources.map((file) => ({
    name: file.name,
    bufferString: JSON.stringify(Array.from(readFileSync(file.path)))
  }))

  await page.evaluate<Promise<void>, [FileBuffer[], string]>(
    ([files, targetSelector]) => {
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

// drag and drop a element to another element
export const dragTo = async (page: Page, sourceLocator: Locator, destinationLocator: Locator) => {
  // playwright 'dragTo' can be flaky sometimes
  // https://playwright.dev/docs/api/class-locator#locator-drag-to

  // perform drag and drop manually
  await sourceLocator.hover()
  await page.mouse.down()
  await destinationLocator.hover()
  await page.mouse.up()
}
