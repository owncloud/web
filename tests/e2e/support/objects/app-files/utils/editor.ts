import { Page } from '@playwright/test'

const closeTextEditorOrViewerButton = '#app-top-bar-close'

export const close = (page: Page): Promise<unknown> => {
  return Promise.all([
    page.waitForNavigation(),
    page.locator(closeTextEditorOrViewerButton).click()
  ])
}
