import { Page } from 'playwright'
import util from 'util'

const userIdSelector = `[data-item-id="%s"] .users-table-btn-action-dropdown`
const editActionBtn = `.oc-users-actions-edit-trigger`
const loginDropDown = '.vs__dropdown-menu'
const dropdownOption = '.vs__dropdown-option'
const loginInput = '#login-input'
const compareDialogConfirm = '.compare-save-dialog-confirm-btn'
const addToGroupsBatchAction = '.oc-users-actions-add-to-groups-trigger'
const removeFromGroupsBatchAction = '.oc-users-actions-remove-from-groups-trigger'
const groupsModalInput = '.oc-modal .vs__search'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const userTrSelector = 'tr'
const userFilter = '.item-filter-%s'
const userFilterOption = '//ul[contains(@class, "item-filter-list")]//button[@data-test-value="%s"]'
const usersTable = '.users-table'
const quotaInput = '#quota-select-form .vs__search'
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const userCheckboxSelector = `[data-item-id="%s"]:not(.oc-table-highlighted) input[type=checkbox]`
const editQuotaBtn = '.oc-files-actions-edit-quota-trigger'
const quotaInputBatchAction = '#quota-select-batch-action-form .vs__search'
const confirmChangeQuotaSeveralSpacesBtn = '.oc-modal-body-actions-confirm'
const userInput = '#%s-input'
const roleValueDropDown = `.vs__dropdown-menu :text-is("%s")`

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
    .locator(dropdownOption)
    .getByText(value === false ? 'Forbidden' : 'Allowed')
    .click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    await page.locator(compareDialogConfirm).click()
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
  await page.locator(util.format(quotaValueDropDown, `${value} GB`)).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    await page.locator(compareDialogConfirm).click()
  ])
}

export const changeQuotaUsingBatchAction = async (args: {
  page: Page
  value: string
}): Promise<void> => {
  const { page, value } = args
  await page.locator(editQuotaBtn).click()
  await page.locator(quotaInputBatchAction).fill(value)
  await page.locator(util.format(quotaValueDropDown, `${value} GB`)).click()

  await Promise.all([
    page.waitForResponse((resp) => resp.status() === 200 && resp.request().method() === 'PATCH'),
    page.locator(confirmChangeQuotaSeveralSpacesBtn).click()
  ])
}

export const getDisplayedUsers = async (args: { page: Page }): Promise<string[]> => {
  const { page } = args
  const users = []
  await page.waitForSelector(usersTable)
  const result = page.locator(userTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    users.push(await result.nth(i).getAttribute('data-item-id'))
  }

  return users
}

export const selectUser = async (args: { page: Page; uuid: string }): Promise<void> => {
  const { page, uuid } = args
  const checkbox = await page.locator(util.format(userCheckboxSelector, uuid))
  const checkBoxAlreadySelected = !(await checkbox.isVisible())
  if (checkBoxAlreadySelected) {
    return
  }
  await checkbox.click()
}

export const addSelectedUsersToGroups = async (args: {
  page: Page
  groups: string[]
}): Promise<void> => {
  const { page, groups } = args
  await page.locator(addToGroupsBatchAction).click()
  for (const group of groups) {
    await page.locator(groupsModalInput).click()
    await page.locator(dropdownOption).getByText(group).click()
  }
  await page.locator(actionConfirmButton).click()
}

export const removeSelectedUsersFromGroups = async (args: {
  page: Page
  groups: string[]
}): Promise<void> => {
  const { page, groups } = args
  await page.locator(removeFromGroupsBatchAction).click()
  for (const group of groups) {
    await page.locator(groupsModalInput).click()
    await page.locator(dropdownOption).getByText(group).click()
  }
  await page.locator(actionConfirmButton).click()
}

export const filterUsers = async (args: {
  page: Page
  filter: string
  values: string[]
}): Promise<void> => {
  const { page, filter, values } = args
  await page.locator(util.format(userFilter, filter)).click()
  for (const value of values) {
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/users') &&
          resp.status() === 200 &&
          resp.request().method() === 'GET'
      ),
      page.locator(util.format(userFilterOption, value)).click()
    ])
  }
}

export const changeUser = async (args: {
  page: Page
  uuid: string
  attribute: string
  value: string
}): Promise<void> => {
  const { page, attribute, value, uuid } = args
  await page.locator(util.format(userIdSelector, uuid)).click()
  await page.waitForSelector(editActionBtn)
  await page.locator(`.context-menu`).locator(editActionBtn).click()
  await page.locator(util.format(userInput, attribute)).fill(value)

  if (attribute === 'role') {
    await page.locator(util.format(roleValueDropDown, value)).click()
  }

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    await page.locator(compareDialogConfirm).click()
  ])
}
