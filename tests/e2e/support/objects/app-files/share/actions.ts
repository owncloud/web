import { Page } from 'playwright'
import util from 'util'
import Collaborator, { ICollaborator } from './collaborator'
import { sidebar } from '../utils'
import { clickResource } from '../resource/actions'

const filesSharedWithMeAccepted =
  '#files-shared-with-me-accepted-section [data-test-resource-name="%s"]'
const shareAcceptDeclineButton =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "file-row-share-%s")]'
const quickShareButton =
  '//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]'
const noPermissionToShareLabel =
  '//*[@data-testid="files-collaborators-no-reshare-permissions-message"]'

export interface ShareArgs {
  page: Page
  resource: string
  recipients: ICollaborator[]
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
}

/**/

export interface createShareArgs extends ShareArgs {
  via?: 'SIDEBAR_PANEL' | 'QUICK_ACTION'
}

export const createShare = async (args: createShareArgs): Promise<void> => {
  const { page, resource, recipients, via } = args

  await openSharingPanel(page, resource, via)
  await Collaborator.inviteCollaborators({ page, collaborators: recipients })

  await sidebar.close({ page })
}

/**/

export type ShareStatusArgs = Omit<ShareArgs, 'recipients'>

export const acceptShare = async (args: ShareStatusArgs): Promise<void> => {
  const { resource, page } = args
  await Promise.all([
    page.locator(util.format(shareAcceptDeclineButton, resource, 'status-accept')).click(),
    page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200),
    page.locator(util.format(filesSharedWithMeAccepted, resource)).waitFor()
  ])
}

export const declineShare = async (args: ShareStatusArgs): Promise<void> => {
  const { page, resource } = args
  await page.locator(util.format(shareAcceptDeclineButton, resource, 'decline')).click()
  await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
}

export const changeShareeRole = async (args: ShareArgs): Promise<void> => {
  const { page, resource, recipients } = args
  await openSharingPanel(page, resource)

  for (const collaborator of recipients) {
    await Promise.all([
      Collaborator.changeCollaboratorRole({ page, collaborator }),
      page.waitForResponse(
        (resp) =>
          resp.url().includes('shares') &&
          resp.status() === 200 &&
          resp.request().method() === 'PUT'
      )
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
