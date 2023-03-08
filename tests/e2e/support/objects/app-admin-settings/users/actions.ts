import { Page } from 'playwright'
import util from 'util'

const userIdSelector = `[data-item-id="%s"] .users-table-btn-action-dropdown`
const editActionBtn = `.oc-users-actions-edit-trigger`
const loginDropDown = '.vs__dropdown-menu'
const loginValueDropDownOption = '.vs__dropdown-option'
const loginInput = '#login-input'
const actionConfirmButton = '.compare-save-dialog-confirm-btn'
const quotaInput = '#quota-select-form .vs__search'
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const userCheckboxSelector = `//*[@data-test-user-name="%s"]//ancestor::tr//input`
const editQuotaBtn = '.oc-files-actions-edit-quota-trigger'
const quotaInputBatchAction = '#quota-select-batch-action-form .vs__search'
const confirmChangeQuotaSeveralSpacesBtn = '.oc-modal-body-actions-confirm'

export const changeAccountEnabled = async (args: {
  page: Page
  uuid: string
  value: boolean
}): Promise<void> => {
  const { page, value, uuid } = args
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
    await page.locator(actionConfirmButton).click()
  ])
}

export const changeQuota = async (args: {
  page: Page
  uuid: string
  value: string
}): Promise<void> => {
  const { page, value, uuid } = args
  await page.locator(util.format(userIdSelector, uuid)).click()
  await page.locator(`.context-menu`).locator(editActionBtn).click()
  await page.locator(quotaInput).fill(value)
  await page.locator(util.format(quotaValueDropDown, value)).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    await page.locator(actionConfirmButton).click()
  ])
}

export const selectUser = async (args: { page: Page; displayName: string }): Promise<void> => {
  const { page, displayName } = args
  const checkbox = await page.locator(util.format(userCheckboxSelector, displayName))
  const checkBoxAlreadySelected = await checkbox.isChecked()
  if (checkBoxAlreadySelected) {
    return
  }
  await checkbox.click()
}

export const changeQuotaUsingBatchAction = async (args: {
  page: Page
  value: string
}): Promise<void> => {
  const { page, value } = args
  await page.locator(editQuotaBtn).click()
  await page.locator(quotaInputBatchAction).fill(value)
  await page.locator(util.format(quotaValueDropDown, value)).click()

  await Promise.all([
    page.waitForResponse((resp) => resp.status() === 200 && resp.request().method() === 'PATCH'),
    page.locator(confirmChangeQuotaSeveralSpacesBtn).click()
  ])
}
