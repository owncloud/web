import { Page } from 'playwright'
import { locatorUtils } from '../../../utils'

export const open = async ({ page, resource }: { page: Page; resource: string }): Promise<void> => {
  if (await page.locator('#files-sidebar').count()) {
    await close({ page })
  }

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

export const openPanel = async ({ page, name }: { page: Page; name: string }): Promise<void> => {
  const currentPanel = page.locator('.sidebar-panel.is-active')
  const backButton = currentPanel.locator('.header__back')

  if (await backButton.count()) {
    await backButton.click()
    await locatorUtils.waitForEvent(currentPanel, 'transitionend')
  }

  await page.waitForSelector('//*[@id="sidebar-panel-details-item"]')

  const panelSelector = page.locator(`#sidebar-panel-${name}-item-select`)
  const nextPanel = page.locator(`#sidebar-panel-${name}-item`)

  if (await panelSelector.count()) {
    await Promise.all([
      locatorUtils.waitForEvent(nextPanel, 'focus'),
      locatorUtils.waitForEvent(nextPanel, 'transitionend'),
      panelSelector.click()
    ])
  }
}
