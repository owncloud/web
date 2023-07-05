import { Page } from 'playwright'
import util from 'util'

const closeTextEditorOrViewerButton = '#app-top-bar-close'
const officeSuiteEditorSelector = '.oc-files-actions-%s-trigger'

export const close = (page: Page): Promise<unknown> => {
  return Promise.all([
    page.waitForNavigation(),
    page.locator(closeTextEditorOrViewerButton).click()
  ])
}


export const openFileWithOfficeSuiteEditor = async (page: Page, editorType: string): Promise<void> => {
  let newEditorTab
  await Promise.all([
    newEditorTab = page.waitForEvent("popup"),
    await page.locator(util.format(officeSuiteEditorSelector, editorType)).click()
  ])
  const editorPage = await newEditorTab
  await editorPage.waitForLoadState();
  await editorPage.waitForURL('**/external/public/**')
  const editorMainFrame = await editorPage.frameLocator('[name="app-iframe"]')
  if (editorType === 'Collabora') {
    for (let i = 1; i <= 3; i++) {
      await editorMainFrame.frameLocator('.iframe-welcome-modal').locator(`#slide-${i}-button`).click()
    }
    // return the content
  }
  if(editorType === 'OnlyOffice') {
    const innerIframe = await editorMainFrame.frameLocator('[name="frameEditor"]')
    // return the content
  }
  await editorPage.close()
}
