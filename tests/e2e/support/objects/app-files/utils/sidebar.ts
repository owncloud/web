import { config } from '../../../../config'
import { Page } from 'playwright'
import { locatorUtils } from '../../../utils'

const openForResource = async ({
  page,
  resource
}: {
  page: Page
  resource: string
}): Promise<void> => {
  await page
    .locator(
      `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "resource-table-btn-action-dropdown")]`
    )
    .click()
  await page.locator('.oc-files-actions-show-details-trigger').click()
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
  await page
    .locator(
      `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "resource-table-btn-action-dropdown")]`
    )
    .click()
  await page.locator(`.oc-files-actions-show-${panel}-trigger`).click()
}

const openGlobal = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator('#files-toggle-sidebar').click()
}

export const open = async ({
  page,
  resource
}: {
  page: Page
  resource?: string
}): Promise<void> => {
  if (await page.locator('#app-sidebar').count()) {
    await close({ page })
  }

  resource ? await openForResource({ page, resource }) : await openGlobal({ page })
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator('.sidebar-panel .header__close:visible').click()
}

export const openPanel = async ({ page, name }: { page: Page; name: string }): Promise<void> => {
  const currentPanel = page.locator('.sidebar-panel.is-active')
  const backButton = currentPanel.locator('.header__back')

  if (await backButton.count()) {
    await backButton.click()
    await locatorUtils.waitForEvent(currentPanel, 'transitionend')
  }
  const panelSelector = page.locator(`#sidebar-panel-${name}-item-select`)
  const nextPanel = page.locator(`#sidebar-panel-${name}-item`)

  await panelSelector.click()
  if (config.ocis) {
    // here is flaky in oc10. need researching
    await locatorUtils.waitForEvent(nextPanel, 'transitionend')
  }
}
