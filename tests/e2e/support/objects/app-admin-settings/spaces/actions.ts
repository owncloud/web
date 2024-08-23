import { Page } from '@playwright/test'
import util from 'util'
import { locatorUtils } from '../../../utils'

const spaceTrSelector = '.spaces-table tbody > tr'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const contextMenuSelector = `[data-item-id="%s"] .spaces-table-btn-action-dropdown`
const spaceCheckboxSelector = `[data-item-id="%s"] input[type=checkbox]`
const contextMenuActionButton = `.oc-files-actions-%s-trigger`
const inputFieldSelector =
  '//div[@class="oc-modal-body-input"]//input[contains(@class,"oc-text-input")]'
const modalConfirmBtn = `.oc-modal-body-actions-confirm`
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const selectedQuotaValueField = '.vs__dropdown-toggle'
const spacesQuotaSearchField = '.oc-modal .vs__search'
const appSidebarDiv = '#app-sidebar'
const toggleSidebarButton = '#files-toggle-sidebar'
const sideBarActive = '.sidebar-panel.is-active-root-panel'
const sideBarCloseButton = '.sidebar-panel .header__close:visible'
const sideBarBackButton = '.sidebar-panel .header__back:visible'
const sideBarActionButtons = `#sidebar-panel-%s-select`
const siderBarActionPanel = `#sidebar-panel-%s`
const spaceMembersDiv = '[data-testid="space-members"]'
const spaceMemberList =
  '[data-testid="space-members-role-%s"] ul [data-testid="space-members-list"]'

export const getDisplayedSpaces = async (page: Page): Promise<string[]> => {
  const spaces = []
  const result = page.locator(spaceTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    spaces.push(await result.nth(i).getAttribute('data-item-id'))
  }

  return spaces
}

const performAction = async (args: {
  page: Page
  action: string
  context: string
  id?: string
}): Promise<void> => {
  const { page, action, context, id } = args

  if (id && context === 'context-menu') {
    await page.locator(util.format(contextMenuSelector, id)).click()
  }

  let contextMenuActionButtonSelector = `.${context} `
  switch (action) {
    case 'rename':
      contextMenuActionButtonSelector += util.format(contextMenuActionButton, action)
      break
    case 'edit-description':
      contextMenuActionButtonSelector += util.format(contextMenuActionButton, action)
      break
    case 'edit-quota':
      contextMenuActionButtonSelector += util.format(contextMenuActionButton, action)
      break
    case 'delete':
      contextMenuActionButtonSelector += util.format(contextMenuActionButton, action)
      break
    case 'disable':
      contextMenuActionButtonSelector += util.format(contextMenuActionButton, action)
      break
    case 'restore':
      contextMenuActionButtonSelector += util.format(contextMenuActionButton, action)
      break
    default:
      throw new Error(`${action} not implemented`)
  }
  await page.locator(contextMenuActionButtonSelector).click()
}

export const changeSpaceQuota = async (args: {
  page: Page
  spaceIds: string[]
  value: string
  context: string
}): Promise<void> => {
  const { page, value, spaceIds, context } = args
  await performAction({ page, action: 'edit-quota', context, id: spaceIds[0] })

  const searchLocator = page.locator(spacesQuotaSearchField)
  await searchLocator.pressSequentially(value)
  await page.locator(selectedQuotaValueField).waitFor()
  await page.locator(util.format(quotaValueDropDown, `${value} GB`)).click()
  await confirmAction({
    page,
    method: 'PATCH',
    statusCode: 200,
    spaceIds,
    actionConfirm: true
  })
}

export const disableSpace = async (args: {
  page: Page
  spaceIds: string[]
  context: string
}): Promise<void> => {
  const { page, spaceIds, context } = args
  await performAction({ page, action: 'disable', context, id: spaceIds[0] })
  await confirmAction({
    page,
    method: 'DELETE',
    statusCode: 204,
    spaceIds,
    actionConfirm: false
  })
}

export const enableSpace = async (args: {
  page: Page
  spaceIds: string[]
  context: string
}): Promise<void> => {
  const { page, spaceIds, context } = args
  await performAction({ page, action: 'restore', context, id: spaceIds[0] })
  await confirmAction({
    page,
    method: 'PATCH',
    statusCode: 200,
    spaceIds,
    actionConfirm: false
  })
}

export const deleteSpace = async (args: {
  page: Page
  spaceIds: string[]
  context: string
}): Promise<void> => {
  const { page, spaceIds, context } = args
  await performAction({ page, action: 'delete', context, id: spaceIds[0] })
  await confirmAction({
    page,
    method: 'DELETE',
    statusCode: 204,
    spaceIds,
    actionConfirm: false
  })
}

export const selectSpace = async (args: { page: Page; id: string }): Promise<void> => {
  const { page, id } = args
  const checkbox = page.locator(util.format(spaceCheckboxSelector, id))
  const checkBoxAlreadySelected = await checkbox.isChecked()
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
  await performAction({ page, action: 'rename', context: 'context-menu', id })
  await page.locator(inputFieldSelector).fill(value)
  await confirmAction({
    page,
    method: 'PATCH',
    statusCode: 200,
    spaceIds: [id],
    actionConfirm: true
  })
}

export const changeSpaceSubtitle = async (args: {
  page: Page
  id: string
  value: string
}): Promise<void> => {
  const { page, id, value } = args
  await performAction({ page, action: 'edit-description', context: 'context-menu', id })
  await page.locator(inputFieldSelector).fill(value)
  await confirmAction({
    page,
    method: 'PATCH',
    statusCode: 200,
    spaceIds: [id],
    actionConfirm: true
  })
}

const confirmAction = async (args: {
  page: Page
  method: string
  statusCode: number
  spaceIds: string[]
  actionConfirm: boolean
}): Promise<void> => {
  const { page, method, statusCode, spaceIds, actionConfirm } = args
  let confirmButton = modalConfirmBtn
  if (actionConfirm) {
    confirmButton = actionConfirmButton
  }

  const checkResponses = []
  for (const id of spaceIds) {
    checkResponses.push(
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith(encodeURIComponent(id)) &&
          resp.status() === statusCode &&
          resp.request().method() === method
      )
    )
  }

  await page.locator(confirmButton).waitFor()
  await Promise.all([...checkResponses, page.locator(confirmButton).click()])
}

export const openSpaceAdminSidebarPanel = async (args: {
  page: Page
  id: string
}): Promise<void> => {
  const { page, id } = args
  if (await page.locator(appSidebarDiv).count()) {
    await page.locator(sideBarCloseButton).click()
  }
  await selectSpace({ page, id })
  await page.click(toggleSidebarButton)
}

export const openSpaceAdminActionSidebarPanel = async (args: {
  page: Page
  action: string
}): Promise<void> => {
  const { page, action } = args
  const currentPanel = page.locator(sideBarActive)
  const backButton = currentPanel.locator(sideBarBackButton)
  if (await backButton.count()) {
    await backButton.click()
    await locatorUtils.waitForEvent(currentPanel, 'transitionend')
  }
  const panelSelector = page.locator(util.format(sideBarActionButtons, action))
  const nextPanel = page.locator(util.format(siderBarActionPanel, action))
  await panelSelector.click()
  await locatorUtils.waitForEvent(nextPanel, 'transitionend')
}

export const listSpaceMembers = async (args: {
  page: Page
  filter: string
}): Promise<Array<string>> => {
  const { page, filter } = args
  await page.locator(spaceMembersDiv).waitFor()
  let users: string[] = []
  const names = []
  switch (filter) {
    case 'Can manage':
      users = await page.locator(util.format(spaceMemberList, filter)).allTextContents()
      break
    case 'Can view':
      users = await page.locator(util.format(spaceMemberList, filter)).allTextContents()
      break
    case 'Can edit':
      users = await page.locator(util.format(spaceMemberList, filter)).allTextContents()
      break
  }

  for (const user of users) {
    // the value comes in "['initials firstName secondName lastName',..]" format so only get the first name
    const [, name] = user.split(' ')
    names.push(name)
  }
  return names
}
