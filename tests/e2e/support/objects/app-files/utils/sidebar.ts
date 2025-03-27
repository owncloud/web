import { Page } from '@playwright/test'
import util from 'util'
import { locatorUtils } from '../../../utils'

const contextMenuSelector =
  '//span[@data-test-resource-name="%s"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "resource-table-btn-action-dropdown")]'
const folderModalIframe = '#iframe-folder-view'
const actionMenuForCurrentFolderSelector = '#oc-breadcrumb-contextmenu-trigger'
const closeSidebarRootPanelBtn = `#app-sidebar .is-active-root-panel .header__close`
const closeSidebarSubPanelBtn = `#app-sidebar .is-active-sub-panel .header__close`

const openForResource = async ({
  page,
  resource,
  resourceType
}: {
  page: Page
  resource: string
  resourceType: string
}): Promise<void> => {
  if (resourceType === 'passwordProtectedFolder') {
    await page.frameLocator(folderModalIframe).locator(actionMenuForCurrentFolderSelector).click()
    await page
      .frameLocator(folderModalIframe)
      .locator('.oc-files-actions-show-details-trigger')
      .click()
  } else {
    await page.locator(util.format(contextMenuSelector, resource)).click()
    await page.locator('.oc-files-actions-show-details-trigger').click()
  }
}

export const openPanelForResource = async ({
  page,
  resource,
  panel
}: {
  page: Page
  resource: string
  panel: string
}): Promise<void> => {
  await page.locator(util.format(contextMenuSelector, resource)).click()
  await page.locator(`.oc-files-actions-show-${panel}-trigger`).click()
}

const openGlobal = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator('#files-toggle-sidebar').click()
}

export const open = async ({
  page,
  resource,
  resourceType
}: {
  page: Page
  resource?: string
  resourceType?: string
}): Promise<void> => {
  if (resourceType === 'passwordProtectedFolder') {
    if (await page.frameLocator(folderModalIframe).locator('#app-sidebar').count()) {
      await closePasswordProtectedFolder({ page })
    }
  } else {
    if (await page.locator('#app-sidebar').count()) {
      await close({ page })
    }
  }

  resource ? await openForResource({ page, resource, resourceType }) : await openGlobal({ page })
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  // await sidebar transitions
  await new Promise((resolve) => setTimeout(resolve, 250))

  const isSubPanelActive = await page.locator(closeSidebarSubPanelBtn).isVisible()
  if (isSubPanelActive) {
    await page.locator(closeSidebarSubPanelBtn).click()
  } else {
    await page.locator(closeSidebarRootPanelBtn).click()
  }
}

export const openPanel = async ({
  page,
  name,
  resourceType
}: {
  page: Page
  name: string
  resourceType?: string
}): Promise<void> => {
  const currentPanel = page.locator('.sidebar-panel.is-active')
  const backButton = currentPanel.locator('.header__back')

  if (await backButton.count()) {
    await Promise.all([
      locatorUtils.waitForEvent(currentPanel, 'transitionend'),
      backButton.click()
    ])
  }
  if (resourceType === 'passwordProtectedFolder') {
    const panelSelector = page
      .frameLocator(folderModalIframe)
      .locator(`#sidebar-panel-${name}-select`)
    const nextPanel = page.frameLocator(folderModalIframe).locator(`#sidebar-panel-${name}`)
    await Promise.all([nextPanel.waitFor(), panelSelector.click()])
  } else {
    const panelSelector = page.locator(`#sidebar-panel-${name}-select`)
    const nextPanel = page.locator(`#sidebar-panel-${name}`)
    await Promise.all([nextPanel.waitFor(), panelSelector.click()])
  }
}

export const closePasswordProtectedFolder = async ({ page }: { page: Page }): Promise<void> => {
  const isSubPanelActive = await page
    .frameLocator(folderModalIframe)
    .locator(closeSidebarSubPanelBtn)
    .isVisible()
  if (isSubPanelActive) {
    await page.frameLocator(folderModalIframe).locator(closeSidebarSubPanelBtn).click()
  } else {
    await page.frameLocator(folderModalIframe).locator(closeSidebarRootPanelBtn).click()
  }
}
