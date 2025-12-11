import { Page, expect } from '@playwright/test'
import util from 'util'

import { sidebar, editor } from '../utils'
import Collaborator, { ICollaborator } from '../share/collaborator'
import { createLink } from '../link/actions'
import { File } from '../../../types'
import { World } from '../../../../cucumber/environment'
import { objects } from '../../..'

const newSpaceMenuButton = '#new-space-menu-btn'
const spaceNameInputField = '.oc-modal input'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const spaceIdSelector = `[data-item-id="%s"] .oc-resource-basename`
const spacesRenameOptionSelector = '.oc-files-actions-rename-trigger:visible'
const editSpacesSubtitleOptionSelector = '.oc-files-actions-edit-description-trigger:visible'
const editQuotaOptionSelector = '.oc-files-actions-edit-quota-trigger:visible'
const editImageOptionSelector = '.oc-files-actions-upload-space-image-trigger:visible'
const downloadSpaceSelector = '.oc-files-actions-download-archive-trigger:visible'
const spacesQuotaSearchField = '.oc-modal .vs__search'
const selectedQuotaValueField = '.vs--open'
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const editSpacesDescription = '.oc-files-actions-edit-readme-content-trigger:visible'
const spacesDescriptionInputArea = '.cm-content'
const spacesDescriptionSaveTextFileInEditorButton = '#app-save-action:visible'
const spaceHeaderSelector = '.space-header'
const activitySidebarPanel = 'sidebar-panel-activities'
const activitySidebarPanelBodyContent = '#sidebar-panel-activities .sidebar-panel__body-content'

export const openActionsPanel = async (page: Page, world: World): Promise<void> => {
  await sidebar.open({ page, world })
  await sidebar.openPanel({ page, name: 'space-actions' })
}

export const openSharingPanel = async (page: Page, world: World): Promise<void> => {
  await sidebar.open({ page, world })
  await sidebar.openPanel({ page, name: 'space-share' })
}

export const openActivitiesPanel = async (page: Page, world: World): Promise<void> => {
  await sidebar.open({ page, world })
  await sidebar.openPanel({ page, name: 'activities' })
}

/**/

export interface createSpaceArgs {
  name: string
  page: Page
}

export const createSpace = async (args: createSpaceArgs, world: World): Promise<string> => {
  const { page, name } = args

  await page.locator(newSpaceMenuButton).click()
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['ocModal'],
    'spaces page',
    world
  )
  await page.locator(spaceNameInputField).fill(name)

  const [responses] = await Promise.all([
    page.waitForResponse(
      (postResp) =>
        postResp.status() === 201 &&
        postResp.request().method() === 'POST' &&
        postResp.url().endsWith('drives?template=default')
    ),
    page.locator(actionConfirmButton).click()
  ])

  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['filesView'],
    'spaces page',
    world
  )

  const { id } = await responses.json()
  return id
}

/**/

export interface openSpaceArgs {
  id: string
  page: Page
  world?: World
}

export const openSpace = async (args: openSpaceArgs): Promise<void> => {
  const { page, id, world } = args
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['filesView'],
    'spaces page',
    world
  )
  await page.locator(util.format(spaceIdSelector, id)).click()
  await page.locator(spaceHeaderSelector).waitFor()
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['filesView'],
    'spaces page',
    world
  )
}
/**/

export const changeSpaceName = async (args: {
  page: Page
  id: string
  value: string
  world: World
}): Promise<void> => {
  const { page, value, id, world } = args
  await openActionsPanel(page, world)

  await page.locator(spacesRenameOptionSelector).click()
  await page.locator(spaceNameInputField).fill(value)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(actionConfirmButton).click()
  ])

  await sidebar.close({ page: page, world })
}

/**/

export const changeSpaceSubtitle = async (args: {
  page: Page
  id: string
  value: string
  world: World
}): Promise<void> => {
  const { page, value, id, world } = args
  await openActionsPanel(page, world)

  await page.locator(editSpacesSubtitleOptionSelector).click()
  await page.locator(spaceNameInputField).fill(value)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(actionConfirmButton).click()
  ])

  await sidebar.close({ page: page, world })
}

/**/

export const changeSpaceDescription = async (args: {
  page: Page
  value: string
  world: World
}): Promise<void> => {
  const { page, value, world } = args
  await openActionsPanel(page, world)
  const waitForUpdate = () =>
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('readme.md') &&
        resp.status() === 200 &&
        resp.request().method() === 'GET'
    )
  await Promise.all([waitForUpdate(), page.locator(editSpacesDescription).click()])

  await page.locator(spacesDescriptionInputArea).fill(value)
  await Promise.all([
    page.waitForResponse((resp) => resp.status() === 204 && resp.request().method() === 'PUT'),
    page.waitForResponse((resp) => resp.status() === 207 && resp.request().method() === 'PROPFIND'),
    page.locator(spacesDescriptionSaveTextFileInEditorButton).click()
  ])
  await editor.close(page, world)
}

/**/

export const changeQuota = async (args: {
  id: string
  page: Page
  value: string
  world: World
}): Promise<void> => {
  const { id, page, value, world } = args
  await openActionsPanel(page, world)

  await page.locator(editQuotaOptionSelector).click()
  const searchLocator = page.locator(spacesQuotaSearchField)
  await searchLocator.pressSequentially(value)
  await page.locator(selectedQuotaValueField).waitFor()
  await page.locator(util.format(quotaValueDropDown, `${value} GB`)).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(actionConfirmButton).click()
  ])

  await sidebar.close({ page: page, world })
}

export interface SpaceMembersArgs {
  page: Page
  users: ICollaborator[]
  world?: World
}

export const addSpaceMembers = async (args: SpaceMembersArgs): Promise<void> => {
  const { page, users, world } = args
  await openSharingPanel(page, world)

  await Collaborator.inviteCollaborators({ page, collaborators: users, world })
  await sidebar.close({ page: page, world })
}

export const changeSpaceImage = async (args: {
  id: string
  page: Page
  resource: File
  world: World
}): Promise<void> => {
  const { id, page, resource, world } = args
  await openActionsPanel(page, world)

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator(editImageOptionSelector).click()
  ])

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.waitForResponse(
      (resp) =>
        resp.url().includes(resource.name) &&
        resp.status() === 200 &&
        resp.request().method() === 'GET'
    ),
    fileChooser.setFiles(resource.path)
  ])

  await sidebar.close({ page: page, world })
}

export interface removeAccessMembersArgs extends Omit<SpaceMembersArgs, 'users'> {
  users: Omit<ICollaborator, 'role'>[]
  removeOwnSpaceAccess?: boolean
}

export const removeAccessSpaceMembers = async (args: removeAccessMembersArgs): Promise<void> => {
  const { page, users, removeOwnSpaceAccess, world } = args
  await openSharingPanel(page, world)

  for (const collaborator of users) {
    await Collaborator.removeCollaborator({ page, collaborator, removeOwnSpaceAccess, world })
  }
}

export const changeSpaceRole = async (args: SpaceMembersArgs): Promise<void> => {
  const { page, users, world } = args
  await openSharingPanel(page, world)

  for (const collaborator of users) {
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('permissions') &&
          resp.status() === 200 &&
          resp.request().method() === 'PATCH'
      ),
      Collaborator.changeCollaboratorRole({ page, collaborator, world })
    ])
  }
}

export const createPublicLinkForSpace = async (args: {
  page: Page
  password: string
  world: World
}): Promise<string> => {
  const { page, password, world } = args
  await openSharingPanel(page, world)
  return createLink({ page: page, space: true, password: password })
}

export const addExpirationDateToMember = async (args: {
  page: Page
  member: Omit<ICollaborator, 'role'>
  expirationDate: string
  world: World
}): Promise<void> => {
  const { page, member: collaborator, expirationDate, world } = args
  await openSharingPanel(page, world)
  await Collaborator.setExpirationDateForCollaborator(
    { page, collaborator, expirationDate, world },
    world
  )
}

export const removeExpirationDateFromMember = async (args: {
  page: Page
  member: Omit<ICollaborator, 'role'>
  world: World
}): Promise<void> => {
  const { page, member: collaborator, world } = args
  await openSharingPanel(page, world)
  await Collaborator.removeExpirationDateFromCollaborator({ page, collaborator, world }, world)
}

export const downloadSpace = async (page: Page, world: World): Promise<string> => {
  await openActionsPanel(page, world)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(downloadSpaceSelector).click()
  ])
  await sidebar.close({ page, world })

  return download.suggestedFilename()
}

export const checkSpaceActivity = async ({
  page,
  activity,
  world
}: {
  page: Page
  world: World
  activity: string
}): Promise<void> => {
  await openActivitiesPanel(page, world)
  await expect(page.getByTestId(activitySidebarPanel)).toBeVisible()
  await expect(page.locator(activitySidebarPanelBodyContent)).toContainText(activity)
}
