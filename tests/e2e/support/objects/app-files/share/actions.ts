import { Page } from 'playwright'
import { User } from '../../../types'
import { sidebar } from '../utils'
import { clickResource } from '../resource/actions'

export type createShareArgs = {
  page: Page
  folder: string
  users: User[]
  role: string
  via: 'SIDEBAR_PANEL' | 'QUICK_ACTION'
}

export const createShare = async (args: createShareArgs): Promise<void> => {
  const { page, folder, users, role, via } = args
  const folderPaths = folder.split('/')
  const folderName = folderPaths.pop()

  if (folderPaths.length) {
    await clickResource({ page: page, path: folderPaths.join('/') })
  }

  switch (via) {
    case 'QUICK_ACTION':
      await page
        .locator(
          `//*[@data-test-resource-name="${folderName}"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]`
        )
        .click()
      break

    case 'SIDEBAR_PANEL':
      await sidebar.open({ page: page, resource: folderName })
      await sidebar.openPanel({ page: page, name: 'sharing' })
      break
  }

  for (const user of users) {
    const shareInputLocator = page.locator('#files-share-invite-input')
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('sharees') && resp.status() === 200),
      shareInputLocator.fill(user.id)
    ])
    await shareInputLocator.focus()
    await page.waitForSelector('.vs--open')
    await page.locator('#files-share-invite-input').press('Enter')

    await page.locator('//*[@id="files-collaborators-role-button-new"]').click()
    await page.locator(`//*[@id="files-role-${role}"]`).click()
  }

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith('shares') && resp.status() === 200 && resp.request().method() === 'POST'
    ),
    page.locator('#new-collaborators-form-create-button').click()
  ])

  await sidebar.close({ page: page })
}

/**/

export type acceptShareArgs = {
  name: string
  page: Page
}

export const acceptShare = async (args: acceptShareArgs): Promise<void> => {
  const { name, page } = args
  await Promise.all([
    page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
      )
      .click(),
    page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200),
    page
      .locator(`#files-shared-with-me-shares-table [data-test-resource-name="${args.name}"]`)
      .waitFor()
  ])
}

/**/

export type declineShareArgs = {
  page: Page
  name: string
}

export const declineShare = async (args: declineShareArgs): Promise<void> => {
  const { page, name } = args
  await page
    .locator(
      `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-decline")]`
    )
    .click()
  await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
}

/**/

export type changeShareeRoleArgs = {
  page: Page
  folder: string
  users: User[]
  role: string
}

export const changeShareeRole = async (args: changeShareeRoleArgs): Promise<void> => {
  const { page, folder, users, role } = args
  const folderPaths = folder.split('/')
  const folderName = folderPaths.pop()

  if (folderPaths.length) {
    await clickResource({ page, path: folderPaths.join('/') })
  }

  await sidebar.open({ page, resource: folderName })
  await sidebar.openPanel({ page, name: 'sharing' })

  for (const user of users) {
    const userColumn = `//*[@data-testid="collaborator-user-item-${user.id}"]`

    await Promise.all([
      page.click(`${userColumn}//button[contains(@class,"files-recipient-role-select-btn")]`),
      page.click(
        `${userColumn}//ul[contains(@class,"files-recipient-role-drop-list")]//button[@id="files-recipient-role-drop-btn-${role}"]`
      ),
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

export type removeShareeArgs = {
  page: Page
  folder: string
  users: User[]
}

export const removeSharee = async (args: removeShareeArgs): Promise<void> => {
  const { page, folder, users } = args
  const folderPaths = folder.split('/')
  const folderName = folderPaths.pop()

  if (folderPaths.length) {
    await clickResource({ page, path: folderPaths.join('/') })
  }

  await sidebar.open({ page: page, resource: folderName })
  await sidebar.openPanel({ page: page, name: 'sharing' })

  for (const user of users) {
    const userColumn = `//*[@data-testid="collaborator-user-item-${user.id}"]`

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('shares') &&
          resp.status() === 200 &&
          resp.request().method() === 'DELETE'
      ),
      page
        .locator(`${userColumn}//button[contains(@class,"collaborator-edit-dropdown-options-btn")]`)
        .first()
        .click(),
      page
        .locator(
          `${userColumn}//ul[contains(@class,"collaborator-edit-dropdown-options-list")]//button[contains(@class,"remove-share")]`
        )
        .click()
    ])
  }
}
