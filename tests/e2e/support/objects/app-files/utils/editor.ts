import { Page } from 'playwright'

const closeTextEditorOrViewerButton = '#app-top-bar-close'
const officeSuiteEditorSelector = '.oc-files-actions-%s-trigger'

export const close = (page: Page): Promise<unknown> => {
  return Promise.all([
    page.waitForNavigation(),
    page.locator(closeTextEditorOrViewerButton).click()
  ])
}
