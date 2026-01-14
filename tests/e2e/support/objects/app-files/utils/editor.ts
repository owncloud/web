import { Locator, Page } from '@playwright/test'
import { objects } from '../../..'
import { World } from '../../../../cucumber/environment/world'
import { expect } from '@playwright/test'

const closeTextEditorOrViewerButton = '#app-top-bar-close'
const saveTextEditorOrViewerButton = '#app-save-action'
const texEditor = '#text-editor'
const pdfViewer = '#pdf-viewer'
const imageViewer = '.stage'

export const close = async (page: Page, world?: World): Promise<void> => {
  const a11yObject = new objects.a11y.Accessibility({ page })
  let a11yViolations = []
  world.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
  await Promise.all([
    page.waitForURL(/.*\/files\/(spaces|shares|link|search)\/.*/),
    (a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      closeTextEditorOrViewerButton
    )),
    page.locator(closeTextEditorOrViewerButton).click()
  ])
}

export const save = async (page: Page, world: World): Promise<void> => {
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.status() === 204),
    page.waitForResponse((res) => res.request().method() === 'PROPFIND' && res.status() === 207),
    page.locator(saveTextEditorOrViewerButton).click()
  ])
  const a11yObject = new objects.a11y.Accessibility({ page })
  const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
    saveTextEditorOrViewerButton
  )
  world.currentStepData = {
    a11yViolations
  }
  expect(a11yViolations).toMatchObject([])
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
