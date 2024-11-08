import { Page } from '@playwright/test'
import util from 'util'
import { UsersEnvironment } from '../../../environment'

const userIdSelector = `[data-item-id="%s"] .users-table-btn-action-dropdown`
const editActionBtnContextMenu = '.context-menu .oc-users-actions-edit-trigger'
const editActionBtnQuickActions =
  '[data-item-id="%s"] .oc-table-data-cell-actions .users-table-btn-edit'
const editPanel = '.sidebar-panel__body-EditPanel:visible'
const closeEditPanel = '.sidebar-panel__header .header__close'
const deleteActionBtn = '.oc-users-actions-delete-trigger'
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
const quotaValueDropDown = 'ul.vs__dropdown-menu'
const userCheckboxSelector = `[data-item-id="%s"] input[type=checkbox]`
const editQuotaBtn = '.oc-users-actions-edit-quota-trigger'
const quotaInputBatchAction = '.quota-select-batch-action-form .vs__search'
const userInput = '#%s-input'
const roleValueDropDown = `.vs__dropdown-menu :text-is("%s")`
const groupsInput = '#user-group-select-form .vs__search'
const createUserButton = '#create-user-btn'
const userNameInput = '#create-user-input-user-name'
const displayNameInput = '#create-user-input-display-name'
const emailInput = '#create-user-input-email'
const passwordInput = '#create-user-input-password'

export interface UserInterface {
  displayName: string
  givenName: string
  id: string
  mail: string
  onPremisesSamAccountName: string
  surname: string
  userType: string
}

export const createUser = async (args: {
  page: Page
  name: string
  displayname: string
  email: string
  password: string
}): Promise<UserInterface> => {
  const { page, name, displayname, email, password } = args
  await page.locator(createUserButton).click()
  await page.locator(userNameInput).fill(name)
  await page.locator(displayNameInput).fill(displayname)
  await page.locator(emailInput).fill(email)
  await page.locator(passwordInput).fill(password)

  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('users') && resp.status() === 201 && resp.request().method() === 'POST'
    ),
    page.locator(actionConfirmButton).click()
  ])

  return await response.json()
}
export const changeAccountEnabled = async (args: {
  page: Page
  uuid: string
  value: boolean
}): Promise<void> => {
  const { page, value, uuid } = args
  await page.locator(loginInput).waitFor()
  await page.locator(loginInput).click()
  await page.locator(loginDropDown).waitFor()

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
    page.locator(compareDialogConfirm).click()
  ])
}

export const changeQuota = async (args: {
  page: Page
  uuid: string
  value: string
}): Promise<void> => {
  const { page, value, uuid } = args
  await page.locator(quotaInput).pressSequentially(value)
  await page.locator(quotaValueDropDown).first().click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(compareDialogConfirm).click()
  ])
}

export const changeQuotaUsingBatchAction = async (args: {
  page: Page
  value: string
  userIds: string[]
}): Promise<void> => {
  const { page, value, userIds } = args
  await page.locator(editQuotaBtn).click()
  await page.locator(quotaInputBatchAction).pressSequentially(value, { delay: 100 })
  await page.locator(quotaInputBatchAction).press('Enter')

  const checkResponses = []
  for (const id of userIds) {
    checkResponses.push(
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith(encodeURIComponent(id)) &&
          resp.status() === 200 &&
          resp.request().method() === 'PATCH'
      )
    )
  }

  await Promise.all([...checkResponses, page.locator(actionConfirmButton).click()])
}

export const getDisplayedUsers = async (args: { page: Page }): Promise<string[]> => {
  const { page } = args
  const users = []
  await page.locator(usersTable).waitFor()
  const result = page.locator(userTrSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    users.push(await result.nth(i).getAttribute('data-item-id'))
  }

  return users
}

export const selectUser = async (args: { page: Page; uuid: string }): Promise<void> => {
  const { page, uuid } = args
  const checkbox = page.locator(util.format(userCheckboxSelector, uuid))
  const checkBoxAlreadySelected = await checkbox.isChecked()
  if (checkBoxAlreadySelected) {
    return
  }
  await checkbox.click()
}

export const addSelectedUsersToGroups = async (args: {
  page: Page
  userIds: string[]
  groups: string[]
}): Promise<void> => {
  const { page, userIds, groups } = args
  const groupIds = []

  await page.locator(addToGroupsBatchAction).click()
  for (const group of groups) {
    groupIds.push(getGroupId(group))
    await page.locator(groupsModalInput).click()
    await page.locator(groupsModalInput).pressSequentially(group)
    await page.keyboard.press('Enter')
  }

  const checkResponses = []
  for (const userId of userIds) {
    for (const groupId of groupIds) {
      checkResponses.push(
        page.waitForResponse((resp) => {
          if (
            resp.url().endsWith(`groups/${encodeURIComponent(groupId)}/members/$ref`) &&
            resp.status() === 204 &&
            resp.request().method() === 'POST'
          ) {
            return JSON.parse(resp.request().postData())['@odata.id'].endsWith(
              `/users/${encodeURIComponent(userId)}`
            )
          }
          return false
        })
      )
    }
  }

  await Promise.all([...checkResponses, page.locator(actionConfirmButton).click()])
}

export const removeSelectedUsersFromGroups = async (args: {
  page: Page
  userIds: string[]
  groups: string[]
}): Promise<void> => {
  const { page, userIds, groups } = args
  const groupIds = []

  await page.locator(removeFromGroupsBatchAction).click()
  for (const group of groups) {
    groupIds.push(getGroupId(group))
    await page.locator(groupsModalInput).click()
    await page.locator(groupsModalInput).fill(group)
    await page.keyboard.press('Enter')
  }

  const checkResponses = []
  for (const userId of userIds) {
    for (const groupId of groupIds) {
      checkResponses.push(
        page.waitForResponse(
          (resp) =>
            resp
              .url()
              .endsWith(
                `groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}/$ref`
              ) &&
            resp.status() === 204 &&
            resp.request().method() === 'DELETE'
        )
      )
    }
  }

  await Promise.all([...checkResponses, page.locator(actionConfirmButton).click()])
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
}): Promise<unknown> => {
  const { page, attribute, value, uuid } = args
  await page.locator(util.format(userInput, attribute)).fill(value)
  await page.locator(util.format(userInput, attribute)).press('Enter')

  if (attribute === 'role') {
    await page.locator(util.format(roleValueDropDown, value)).click()
    return Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().endsWith(`${encodeURIComponent(uuid)}/appRoleAssignments`) &&
          resp.status() === 201 &&
          resp.request().method() === 'POST'
      ),
      page.locator(compareDialogConfirm).click()
    ])
  }

  return Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(uuid)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(compareDialogConfirm).click()
  ])
}

export const addUserToGroups = async (args: {
  page: Page
  userId: string
  groups: string[]
}): Promise<void> => {
  const { page, userId, groups } = args
  const groupIds = []
  for (const group of groups) {
    groupIds.push(getGroupId(group))
    await page.locator(groupsInput).pressSequentially(group)
    await page.keyboard.press('Enter')
  }
  console.log("hh")
  const checkResponses = []
  for (const groupId of groupIds) {
    checkResponses.push(
      page.waitForResponse((resp) => {
        if (
          resp.url().endsWith(`groups/${encodeURIComponent(groupId)}/members/$ref`) &&
          resp.status() === 204 &&
          resp.request().method() === 'POST'
        ) {
          return JSON.parse(resp.request().postData())['@odata.id'].endsWith(
            `/users/${encodeURIComponent(userId)}`
          )
        }
        return false
      })
    )
  }

  await Promise.all([...checkResponses, page.locator(compareDialogConfirm).click()])
}

export const removeUserFromGroups = async (args: {
  page: Page
  userId: string
  groups: string[]
}): Promise<void> => {
  const { page, userId, groups } = args
  const groupIds = []
  for (const group of groups) {
    groupIds.push(getGroupId(group))
    await page.getByTitle(group).click()
  }

  const checkResponses = []
  for (const groupId of groupIds) {
    checkResponses.push(
      page.waitForResponse(
        (resp) =>
          resp
            .url()
            .endsWith(
              `groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}/$ref`
            ) &&
          resp.status() === 204 &&
          resp.request().method() === 'DELETE'
      )
    )
  }

  await Promise.all([...checkResponses, page.locator(compareDialogConfirm).click()])
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
      await page.locator(util.format(userIdSelector, uuid)).click()
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

export const deleteUserUsingContextMenu = async (args: {
  page: Page
  uuid: string
}): Promise<void> => {
  const { page, uuid } = args
  await page.locator(util.format(userIdSelector, uuid)).click()
  await page.locator(`.context-menu`).locator(deleteActionBtn).click()

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

export const deleteUserUsingBatchAction = async (args: {
  page: Page
  userIds: string[]
}): Promise<void> => {
  const { page, userIds } = args
  await page.locator(deleteActionBtn).click()

  const checkResponses = []
  for (const id of userIds) {
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

export const waitForEditPanelToBeVisible = async (args: { page: Page }): Promise<void> => {
  const { page } = args
  await page.locator(editPanel).waitFor()
}

const getGroupId = (group: string): string => {
  const usersEnvironment = new UsersEnvironment()
  return usersEnvironment.getCreatedGroup({ key: group }).uuid
}
