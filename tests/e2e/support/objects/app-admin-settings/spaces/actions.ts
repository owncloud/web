import { Page } from 'playwright'
import util from 'util'

const spaceTrSelector = 'tr'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const spaceIdSelector = `[data-item-id="%s"] .spaces-table-btn-action-dropdown`
const spaceCheckboxSelector = `[data-item-id="%s"]:not(.oc-table-highlighted) input[type=checkbox]`
const contextMenuActionButton = `.oc-files-actions-%s-trigger`
const inputFieldSelector =
  '//div[@class="oc-modal-body-input"]//input[contains(@class,"oc-text-input")]'
const modalConfirmBtn = `.oc-modal-body-actions-confirm`
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const selectedQuotaValueField = '.vs__dropdown-toggle'
const spacesQuotaSearchField = '.oc-modal .vs__search'

export const getDisplayedSpaces = async (page): Promise<string[]> => {
  const spaces = []
  const result = page.locator(spaceTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    spaces.push(await result.nth(i).getAttribute('data-item-id'))
  }

  return spaces
}

const clickOnContextMenuActionButton = async (args: {
  page: Page
  id: string
  action: string
  isBatchActions: boolean
}): Promise<void> => {
  const { page, id, action, isBatchActions } = args
  let context = '.batch-actions'
  if (!isBatchActions) {
    context = '.context-menu'
    await page.locator(util.format(spaceIdSelector, id)).click()
  }

  let contextMenuActionButtonSelector = null
  switch (action) {
    case 'rename':
      contextMenuActionButtonSelector = util.format(contextMenuActionButton, action)
      break
    case 'edit-description':
      contextMenuActionButtonSelector = util.format(contextMenuActionButton, action)
      break
    case 'edit-quota':
      contextMenuActionButtonSelector = util.format(contextMenuActionButton, action)
      break
    case 'delete':
      contextMenuActionButtonSelector = util.format(contextMenuActionButton, action)
      break
    case 'disable':
      contextMenuActionButtonSelector = util.format(contextMenuActionButton, action)
      break
    case 'restore':
      contextMenuActionButtonSelector = util.format(contextMenuActionButton, action)
      break
    default:
      throw new Error(`${action} not implemented`)
  }
  await page.waitForSelector(contextMenuActionButtonSelector)
  await page.locator(context).locator(contextMenuActionButtonSelector).click()
}

export const changeSpaceQuota = async (args: {
  page: Page
  id: string
  value: string
  context: string
}): Promise<void> => {
  const { page, value, id, context } = args
  const action = 'edit-quota'
  const isBatchActions = context === 'batch-actions'
  await clickOnContextMenuActionButton({ page, id, action, isBatchActions })
  const searchLocator = await page.locator(spacesQuotaSearchField)
  await searchLocator.fill(value)
  await page.waitForSelector(selectedQuotaValueField)
  await page.locator(util.format(quotaValueDropDown, `${value} GB`)).click()
  await waitForSpaceResponse({
    page,
    method: 'PATCH',
    statusCode: 200,
    isBatchActions,
    id,
    actionConfirm: true
  })
}

export const disableSpace = async (args: {
  page: Page
  id: string
  context: string
}): Promise<void> => {
  const { page, id, context } = args
  const isBatchActions = context === 'batch-actions'
  await clickOnContextMenuActionButton({ page, id, action: 'disable', isBatchActions })
  await waitForSpaceResponse({
    page,
    method: 'DELETE',
    statusCode: 204,
    isBatchActions,
    id,
    actionConfirm: false
  })
}

export const enableSpace = async (args: {
  page: Page
  id: string
  context: string
}): Promise<void> => {
  const { page, id, context } = args
  const isBatchActions = context === 'batch-actions'
  await clickOnContextMenuActionButton({ page, id, action: 'restore', isBatchActions })
  await waitForSpaceResponse({
    page,
    method: 'PATCH',
    statusCode: 200,
    isBatchActions,
    id,
    actionConfirm: false
  })
}

export const deleteSpace = async (args: {
  page: Page
  id: string
  context: string
}): Promise<void> => {
  const { page, id, context } = args
  const isBatchActions = context === 'batch-actions'
  await clickOnContextMenuActionButton({ page, id, action: 'delete', isBatchActions })
  await waitForSpaceResponse({
    page,
    method: 'DELETE',
    statusCode: 204,
    isBatchActions,
    id,
    actionConfirm: false
  })
}

export const selectSpace = async (args: { page: Page; id: string }): Promise<void> => {
  const { page, id } = args
  const checkbox = await page.locator(util.format(spaceCheckboxSelector, id))
  const checkBoxAlreadySelected = !(await checkbox.isVisible())
  if (checkBoxAlreadySelected) {
    return
  }
  await checkbox.click()
}

export const renameSpace = async (args: {
  page: Page
  id: string
  value: string
}): Promise<void> => {
  const { page, id, value } = args
  const action = 'rename'
  const isBatchActions = false
  await clickOnContextMenuActionButton({ page, id, action, isBatchActions })
  await page.locator(inputFieldSelector).fill(value)
  await waitForSpaceResponse({
    page,
    method: 'PATCH',
    statusCode: 200,
    isBatchActions,
    id,
    actionConfirm: true
  })
}

export const changeSpaceSubtitle = async (args: {
  page: Page
  id: string
  value: string
}): Promise<void> => {
  const { page, id, value } = args
  const isBatchActions = false
  await clickOnContextMenuActionButton({
    page,
    id,
    action: 'edit-description',
    isBatchActions
  })
  await page.locator(inputFieldSelector).fill(value)
  await waitForSpaceResponse({
    page,
    method: 'PATCH',
    statusCode: 200,
    isBatchActions,
    id,
    actionConfirm: true
  })
}

const waitForSpaceResponse = async (args: {
  page: Page
  method: string
  statusCode: number
  isBatchActions: boolean
  id: string
  actionConfirm: boolean
}): Promise<void> => {
  const { page, method, statusCode, isBatchActions, id, actionConfirm } = args
  let confirmButton = modalConfirmBtn
  if (actionConfirm) {
    confirmButton = actionConfirmButton
  }
  await page.waitForSelector(confirmButton)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        (isBatchActions || resp.url().endsWith(encodeURIComponent(id))) &&
        resp.status() === statusCode &&
        resp.request().method() === method
    ),
    page.locator(confirmButton).click()
  ])
}
