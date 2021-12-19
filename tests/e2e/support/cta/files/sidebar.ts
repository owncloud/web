import { Page } from 'playwright'

export const open = async ({ page, resource }: { page: Page; resource: string }): Promise<void> => {
  await page
    .locator(
      `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "resource-table-btn-action-dropdown")]`
    )
    .click()
  await page.locator('.oc-files-actions-show-details-trigger').click()
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator('.sidebar-panel.is-active-sub-panel .header__close').click()
}

export const openPanel = async ({
  page,
  name
}: {
  page: Page
  name: 'actions' | 'sharing' | 'links' | 'versions' | 'details'
}): Promise<void> => {
  await page.waitForSelector('//*[@id="sidebar-panel-details-item"]')

  const backElement = page.locator('.sidebar-panel.is-active .header__back')
  if (await backElement.count()) {
    await backElement.click()
  }

  const panelOpenElement = page.locator(`#sidebar-panel-${name}-item-select`)
  if (await panelOpenElement.count()) {
    await panelOpenElement.click()
  }
}
