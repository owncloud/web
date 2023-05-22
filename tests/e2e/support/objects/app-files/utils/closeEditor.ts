import { Page } from 'playwright'

const closeTextEditorOrViewerButton = '#app-top-bar-close'

export default (page: Page) => {
  Promise.all([page.waitForNavigation(), page.locator(closeTextEditorOrViewerButton).click()])
}
