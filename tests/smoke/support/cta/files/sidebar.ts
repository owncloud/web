import { Page } from 'playwright'

export const open = async ({ page, resource }: { page: Page; resource: string }): Promise<void> => {
  const showContextMenuBtn = page.locator(
    `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "resource-table-btn-action-dropdown")]`
  )
  const detailsBtn = page.locator('.oc-files-actions-show-details-trigger')

  await showContextMenuBtn.click()
  await detailsBtn.click()
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  const closeSidebarPanelBtn = page.locator('.sidebar-panel.is-active-sub-panel .header__close')
  await closeSidebarPanelBtn.click()
}

export const openPanel = async ({
  page,
  name
}: {
  page: Page
  name: 'actions' | 'sharing' | 'links' | 'versions' | 'details'
}): Promise<void> => {
  await page.waitForSelector('//*[@id="sidebar-panel-details-item"]')
  const backElement = await page.$('.sidebar-panel.is-active .header__back')
  if (backElement) {
    await backElement.click()
  }

  const panelOpenElement = await page.locator(`#sidebar-panel-${name}-item-select`)
  if (panelOpenElement) {
    await panelOpenElement.click()
  }
}
