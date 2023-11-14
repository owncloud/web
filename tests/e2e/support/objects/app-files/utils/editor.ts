import { Page } from '@playwright/test'

const closeTextEditorOrViewerButton = '#app-top-bar-close'
const saveTextEditorOrViewerButton = '#app-save-action'

export const close = (page: Page): Promise<unknown> => {
  return Promise.all([
    page.waitForNavigation(),
    page.locator(closeTextEditorOrViewerButton).click()
  ])
}

export const save = async (page: Page): Promise<unknown> => {
  return Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.status() === 204),
    page.locator(saveTextEditorOrViewerButton).click()
  ])
}
