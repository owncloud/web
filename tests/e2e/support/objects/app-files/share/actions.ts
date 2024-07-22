import { Page, expect, Locator } from '@playwright/test'
import util from 'util'
import Collaborator, { ICollaborator, IAccessDetails } from './collaborator'
import { sidebar } from '../utils'
import { clickResource } from '../resource/actions'
import { clearCurrentPopup, createLinkArgs } from '../link/actions'
import { config } from '../../../../config.js'
import { createdLinkStore } from '../../../store'
import { User } from '../../../types'
import { locatorUtils } from '../../../utils'

const invitePanel = '//*[@id="oc-files-sharing-sidebar"]'
const quickShareButton =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "files-quick-action-show-shares")]'
const noPermissionToShareLabel =
  '//*[@data-testid="files-collaborators-no-share-permissions-message"]'
const actionMenuDropdownButton =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "resource-table-btn-action-dropdown")]'
const actionsTriggerButton =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "oc-files-actions-%s-trigger")]'

const publicLinkInputField =
  '//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]' +
  '/following-sibling::div//p[contains(@class,"oc-files-file-link-url")]'
const selecAllCheckbox = '#resource-table-select-all'
const acceptButton = '.oc-files-actions-enable-sync-trigger'
const pendingShareItem =
  '//div[@id="files-shared-with-me-pending-section"]//tr[contains(@class,"oc-tbody-tr")]'
const passwordInput = '.oc-modal-body input.oc-text-input'
const createLinkButton = '.oc-modal-body-actions-confirm'
const showMoreOptionsButton = '#show-more-share-options-btn'
const calendarDatePickerId = 'recipient-datepicker-btn'
const informMessage = '//div[contains(@class,"oc-notification-message-title")]'
const showMoreBtn = '.toggle-shares-list-btn:has-text("Show more")'

export interface ShareArgs {
  page: Page
  resource: string
  recipients: ICollaborator[]
  expirationDate?: string
}

export const openSharingPanel = async function (
  page: Page,
  resource: string,
  via = 'SIDEBAR_PANEL'
): Promise<void> {
  const folderPaths = resource.split('/')
  const item = folderPaths.pop()

  if (folderPaths.length) {
    await clickResource({ page, path: folderPaths.join('/') })
  }

  switch (via) {
    case 'QUICK_ACTION':
      await page.locator(util.format(quickShareButton, item)).click()
      break

    case 'SIDEBAR_PANEL':
      await sidebar.open({ page, resource: item })
      await sidebar.openPanel({ page, name: 'sharing' })
      break
  }

  // always click on the “Show more” button if it exists
  const showMore = page.locator(showMoreBtn)
  if (await showMore.count() > 0) {
    await showMore.click()
  }
}

export type ActionViaType = 'SIDEBAR_PANEL' | 'QUICK_ACTION' | 'URL_NAVIGATION'

export interface createShareArgs extends ShareArgs {
  via: ActionViaType
}

export const createShare = async (args: createShareArgs): Promise<void> => {
  const { page, resource, recipients, via } = args
  if (via !== 'URL_NAVIGATION') {
    await openSharingPanel(page, resource, via)
  }
  const expirationDate = recipients[0].expirationDate

  if (expirationDate) {
    await page.locator(showMoreOptionsButton).click()
    await Promise.all([
      locatorUtils.waitForEvent(page.locator(invitePanel), 'transitionend'),
      page.getByTestId(calendarDatePickerId).click()
    ])
    await Collaborator.setExpirationDate(page, expirationDate)
  }
  await Collaborator.inviteCollaborators({ page, collaborators: recipients })
  await sidebar.close({ page })
}

/**/

export interface ShareStatusArgs extends Omit<ShareArgs, 'recipients'> {
  via?: 'STATUS' | 'CONTEXT_MENU'
}

export const enableSync = async (args: ShareStatusArgs): Promise<void> => {
  const { resource, page } = args
  await clickActionInContextMenu({ page, resource }, 'enable-sync')
}

export const syncAllShares = async ({ page }: { page: Page }): Promise<void> => {
  await page.locator(selecAllCheckbox).click()
  const numberOfPendingShares = await page.locator(pendingShareItem).count()
  const checkResponses = []
  for (let i = 0; i < numberOfPendingShares; i++) {
    checkResponses.push(
      page.waitForResponse(
        (resp) =>
          resp.url().includes('root/children') &&
          resp.status() === 201 &&
          resp.request().method() === 'POST'
      )
    )
  }
  await Promise.all([...checkResponses, page.locator(acceptButton).click()])
}

export const disableSync = async (args: ShareStatusArgs): Promise<void> => {
  const { page, resource } = args
  await clickActionInContextMenu({ page, resource }, 'disable-sync')
}

export const clickActionInContextMenu = async (
  args: ShareStatusArgs,
  action: string
): Promise<void> => {
  const { page, resource } = args
  await page.locator(util.format(actionMenuDropdownButton, resource)).click()

  switch (action) {
    case 'enable-sync':
      await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('root/children') &&
            resp.status() === 201 &&
            resp.request().method() === 'POST'
        ),
        page.locator(util.format(actionsTriggerButton, resource, action)).click()
      ])
      break
    case 'copy-quicklink':
      await page.locator(util.format(actionsTriggerButton, resource, action)).click()
      break
    case 'disable-sync':
      await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes('drives') &&
            resp.status() === 204 &&
            resp.request().method() === 'DELETE'
        ),
        page.locator(util.format(actionsTriggerButton, resource, action)).click()
      ])
      break
  }
}

export const changeShareeRole = async (args: ShareArgs): Promise<void> => {
  const { page, resource, recipients } = args
  await openSharingPanel(page, resource)

  for (const collaborator of recipients) {
    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('permissions') &&
          resp.status() === 200 &&
          resp.request().method() === 'PATCH'
      ),
      Collaborator.changeCollaboratorRole({ page, collaborator })
    ])
  }
}

/**/

export interface removeShareeArgs extends ShareArgs {
  removeOwnSpaceAccess?: boolean
}

export const removeSharee = async (args: removeShareeArgs): Promise<void> => {
  const { page, resource, recipients, removeOwnSpaceAccess } = args
  await openSharingPanel(page, resource)

  for (const collaborator of recipients) {
    await Collaborator.removeCollaborator({ page, collaborator, removeOwnSpaceAccess })
  }
}

/**/

export const checkSharee = async (args: ShareArgs): Promise<void> => {
  const { resource, page, recipients } = args
  await openSharingPanel(page, resource)

  for (const collaborator of recipients) {
    await Collaborator.checkCollaborator({ page, collaborator })
  }
}

export const hasPermissionToShare = async (
  args: Omit<ShareArgs, 'recipients'>
): Promise<boolean> => {
  const { page, resource } = args
  // reload page to make sure the changes are reflected
  await page.reload()
  await openSharingPanel(page, resource)
  await Collaborator.waitForInvitePanel(page)
  return !(await page.isVisible(noPermissionToShareLabel))
}

export const createQuickLink = async (args: createLinkArgs): Promise<string> => {
  const { page, resource, password } = args
  let url = ''
  const linkName = 'Link'

  await clickActionInContextMenu({ page, resource }, 'copy-quicklink')
  await page.locator(passwordInput).fill(password)

  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('createLink') &&
        res.request().method() === 'POST' &&
        res.status() === 200
    ),
    page.locator(createLinkButton).click()
  ])
  if (config.backendUrl.startsWith('https')) {
    // here is flaky https://github.com/owncloud/web/issues/9941
    // sometimes test doesn't have time to pick up the correct buffer
    await page.waitForTimeout(500)
    url = await page.evaluate(() => navigator.clipboard.readText())

    expect(url).toContain(config.baseUrlOcis)
  } else {
    const quickLinkUrlLocator = util.format(publicLinkInputField, linkName)
    if (!(await page.locator(quickLinkUrlLocator).isVisible())) {
      await openSharingPanel(page, resource)
    }
    url = await page.locator(quickLinkUrlLocator).textContent()
  }

  await clearCurrentPopup(page)

  if (url && !createdLinkStore.has(linkName)) {
    createdLinkStore.set(linkName, { name: linkName, url })
  }
  return url
}

export interface setDenyShareArgs {
  page: Page
  resource: string
  deny: boolean
  collaborator: ICollaborator
}

export const setDenyShare = async (args: setDenyShareArgs): Promise<void> => {
  const { page, resource, deny, collaborator } = args
  await openSharingPanel(page, resource)
  await Collaborator.setDenyShareForCollaborator({ page, deny, collaborator })
}

export const addExpirationDate = async (args: {
  page: Page
  resource: string
  collaborator: Omit<ICollaborator, 'role'>
  expirationDate: string
}): Promise<void> => {
  const { page, resource, collaborator, expirationDate } = args
  await openSharingPanel(page, resource)

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes('drives') &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    Collaborator.setExpirationDateForCollaborator({ page, collaborator, expirationDate })
  ])
}

export const getAccessDetails = async (args: {
  page: Page
  resource: string
  collaborator: Omit<ICollaborator, 'role'>
}): Promise<IAccessDetails> => {
  const { page, resource, collaborator } = args
  await openSharingPanel(page, resource)

  return Collaborator.getAccessDetails(page, collaborator)
}

export const getMessage = ({ page }: { page: Page }): Promise<string> => {
  return page.locator(informMessage).textContent()
}

export const changeRoleLocator = (args: { page: Page; recipient: User }): Locator => {
  const { page, recipient } = args
  const recipientRow = Collaborator.getCollaboratorUserOrGroupSelector(recipient, 'user')
  return page.locator(util.format(Collaborator.collaboratorRoleDropdownButton, recipientRow))
}

export const changeShareLocator = (args: { page: Page; recipient: User }): Locator => {
  const { page, recipient } = args
  const recipientRow = Collaborator.getCollaboratorUserOrGroupSelector(recipient, 'user')
  return page.locator(util.format(Collaborator.collaboratorEditDropdownButton, recipientRow))
}
