import { Page } from '@playwright/test'
import util from 'util'
import { selectUser } from '../users/actions'

const newGroupBtn = '#create-group-btn'
const createGroupInput = '#create-group-input-display-name'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const editActionBtnContextMenu = '.context-menu .oc-groups-actions-edit-trigger'
const editActionBtnQuickActions =
  '[data-item-id="%s"] .oc-table-data-cell-actions .groups-table-btn-edit'
const groupTrSelector = 'tr'
const groupIdSelector = `[data-item-id="%s"] .groups-table-btn-action-dropdown`
const groupCheckboxSelector = `[data-item-id="%s"]:not(.oc-table-highlighted) input[type=checkbox]`
const deleteBtnContextMenu = '.context-menu .oc-groups-actions-delete-trigger'
const deleteBtnBatchAction = '#oc-appbar-batch-actions'
const editPanel = '.sidebar-panel__body-EditPanel:visible'
const closeEditPanel = '.sidebar-panel__header .header__close'
const userInput = '#%s-input'
const compareDialogConfirm = '.compare-save-dialog-confirm-btn'

export const createGroup = async (args: { page: Page; key: string }) => {
  const { page, key } = args
  await page.locator(newGroupBtn).click()
  await page.locator(createGroupInput).fill(key)

  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('groups') && resp.status() === 201 && resp.request().method() === 'POST'
    ),
    page.locator(actionConfirmButton).click()
  ])

  return await response.json()
}

export const getDisplayedGroups = async (args: { page: Page }): Promise<string[]> => {
  const { page } = args
  const groups = []
  const result = page.locator(groupTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    groups.push(await result.nth(i).getAttribute('data-item-id'))
  }
  return groups
}

export const selectGroup = async (args: { page: Page; uuid: string }): Promise<void> => {
  const { page, uuid } = args
  const checkbox = page.locator(util.format(groupCheckboxSelector, uuid))
  const checkBoxAlreadySelected = await checkbox.isChecked()

  if (checkBoxAlreadySelected) {
    return
  }
  await checkbox.click()
}

export const deleteGroupUsingContextMenu = async (args: {
  page: Page
  uuid: string
}): Promise<void> => {
  const { page, uuid } = args
  await page.locator(util.format(groupIdSelector, uuid)).click()
  await page.locator(deleteBtnContextMenu).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 204 &&
        resp.request().method() === 'DELETE'
    ),
    page.locator(actionConfirmButton).click()
  ])
}

export const deleteGrouprUsingBatchAction = async (args: {
  page: Page
  groupIds: string[]
}): Promise<void> => {
  const { page, groupIds } = args
  await page.locator(deleteBtnBatchAction).click()

  const checkResponses = []
  for (const id of groupIds) {
    checkResponses.push(
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith(encodeURIComponent(id)) &&
          resp.status() === 204 &&
          resp.request().method() === 'DELETE'
      )
    )
  }

  await Promise.all([...checkResponses, page.locator(actionConfirmButton).click()])
}

export const changeGroup = async (args: {
  page: Page
  uuid: string
  attribute: string
  value: string
}): Promise<void> => {
  const { page, attribute, value, uuid } = args
  await page.locator(util.format(userInput, attribute)).pressSequentially(value)

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 204 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(compareDialogConfirm).click()
  ])
}
export const openEditPanel = async (args: {
  page: Page
  uuid: string
  action: string
}): Promise<void> => {
  const { page, uuid, action } = args
  if (await page.locator(editPanel).count()) {
    await page.locator(closeEditPanel).click()
  }
  switch (action) {
    case 'context-menu':
      await page.locator(util.format(groupIdSelector, uuid)).click()
      await page.locator(editActionBtnContextMenu).click()
      break
    case 'quick-action':
      await selectUser({ page, uuid })
      await page.locator(util.format(editActionBtnQuickActions, uuid)).click()
      break
    default:
      throw new Error(`${action} not implemented`)
  }
}
