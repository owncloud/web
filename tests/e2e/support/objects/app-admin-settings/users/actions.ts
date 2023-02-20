import { Page } from 'playwright'
import util from 'util'

const userIdSelector = `[data-item-id="%s"] .users-table-btn-action-dropdown`
const editActionBtn = `.oc-users-actions-edit-trigger`
const loginDropDown = '.vs__dropdown-menu'
const loginValueDropDownOption = '.vs__dropdown-option'
const loginInput = '#login-input'
const actionConfirmButton = '.compare-save-dialog-confirm-btn'

export const changeAccountEnabled = async (args: {
  page: Page
  uuid: string
  value: boolean
}): Promise<void> => {
  const { page, value, uuid } = args
  console.log(uuid)
  await page.locator(util.format(userIdSelector, uuid)).click()
  await page.waitForSelector(editActionBtn)
  await page.locator(`.context-menu`).locator(editActionBtn).click()

  await page.waitForSelector(loginInput)
  await page.locator(loginInput).click()
  await page.waitForSelector(loginDropDown)

  await page
    .locator(loginValueDropDownOption)
    .getByText(value === false ? 'Forbidden' : 'Allowed')
    .click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(actionConfirmButton).click()
  ])
}
