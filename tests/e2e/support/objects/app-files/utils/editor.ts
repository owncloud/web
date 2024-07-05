import { Locator, Page } from '@playwright/test'

const closeTextEditorOrViewerButton = '#app-top-bar-close'
const saveTextEditorOrViewerButton = '#app-save-action'
const texEditor = '#text-editor'
const pdfViewer = '#pdf-viewer'
const imageViewer = '.stage'

export const close = (page: Page): Promise<unknown> => {
  return Promise.all([
    page.waitForURL(/.*\/files\/(spaces|shares|link|search)\/.*/),
    page.locator(closeTextEditorOrViewerButton).click()
  ])
}

export const save = async (page: Page): Promise<unknown> => {
  return await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.status() === 204),
    page.locator(saveTextEditorOrViewerButton).click()
  ])
}

export const fileViewerLocator = ({
  page,
  fileViewerType
}: {
  page: Page
  fileViewerType: string
}): Locator => {
  switch (fileViewerType) {
    case 'text-editor':
      return page.locator(texEditor)
    case 'pdf-viewer':
      return page.locator(pdfViewer)
    case 'media-viewer':
      return page.locator(imageViewer)
    default:
      throw new Error(`${fileViewerType} not implemented`)
  }
}
