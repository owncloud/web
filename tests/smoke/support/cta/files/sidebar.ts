import { Page } from 'playwright'

export const open = async ({ page, resource }: { page: Page; resource: string }): Promise<void> => {
  await page.click(
    `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "oc-table-files-btn-action-dropdown")]`
  )
  await page.waitForSelector('//*[@id="oc-files-context-actions"]')
  await page.click('.oc-files-actions-show-details-trigger')
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  await page.click('.sidebar-panel.is-active-sub-panel .header__close')
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

  const panelOpenElement = await page.$(`#sidebar-panel-${name}-item-select`)
  if (panelOpenElement) {
    await panelOpenElement.click()
  }
}
