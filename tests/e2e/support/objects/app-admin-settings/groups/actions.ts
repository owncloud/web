import { Page } from 'playwright'

const newGroupBtn = '.admin-settings-app-bar-actions'
const createGroupInput = '#create-group-input-display-name'
const actionConfirmButton = '.oc-modal-body-actions-confirm'

export const createGroup = async (args: { page: Page; key: string }): Promise<void> => {
  const { page, key } = args
  await page.locator(newGroupBtn).click()
  await page.locator(createGroupInput).fill(key)

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('groups') && resp.status() === 200 && resp.request().method() === 'POST'
    ),
    page.locator(actionConfirmButton).click()
  ])
}
