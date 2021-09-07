import { Page } from 'playwright'

export const open = async ({ page, resource }: { page: Page; resource: string }): Promise<void> => {
  await page.click(
    `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "oc-table-files-btn-show-details")]`
  )
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  await page.click('.sidebar-panel.is-active .header__close')
}

export const openPanel = async ({
  page,
  name
}: {
  page: Page
  name: 'actions' | 'sharing' | 'links' | 'versions' | 'details'
}): Promise<void> => {
  if (await page.$eval(`#sidebar-panel-${name}-item`, el => el.classList.contains('.is-active'))) {
    return
  }

  const backElement = await page.$('.sidebar-panel.is-active .header__back')
  if (backElement) {
    await backElement.click()
  }

  const panelOpenElement = await page.$(`#sidebar-panel-${name}-item-select`)
  if (panelOpenElement) {
    await panelOpenElement.click()
  }
}
