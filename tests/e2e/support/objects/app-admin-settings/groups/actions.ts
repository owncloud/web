import { Page } from 'playwright'
import util from 'util'

const newGroupBtn = '.admin-settings-app-bar-actions'
const createGroupInput = '#create-group-input-display-name'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const groupTrSelector = 'tr'
const groupIdSelector = `[data-item-id="%s"] .groups-table-btn-action-dropdown`
const groupCheckboxSelector = `[data-item-id="%s"]:not(.oc-table-highlighted) input[type=checkbox]`
const deleteBtnContextMenu = '.context-menu .oc-groups-actions-delete-trigger'
const deleteBtnBatchAction = '#oc-appbar-batch-actions'

export const createGroup = async (args: { page: Page; key: string }): Promise<string> => {
  const { page, key } = args
  await page.locator(newGroupBtn).click()
  await page.locator(createGroupInput).fill(key)

  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('groups') && resp.status() === 200 && resp.request().method() === 'POST'
    ),
    page.locator(actionConfirmButton).click()
  ])
  const group = await response.json()
  return group.id
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
  const checkbox = await page.locator(util.format(groupCheckboxSelector, uuid))
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
    await page.locator(actionConfirmButton).click()
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
