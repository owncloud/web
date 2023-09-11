import { Page } from 'playwright'
import { expect } from '@playwright/test'
import util from 'util'
import { sidebar } from '../utils'
import { getActualExpiryDate } from '../../../utils/datePicker'
import { clickResource } from '../resource/actions'
import { shareRoles } from '../share/collaborator'

export interface createLinkArgs {
  page: Page
  resource?: string
  name?: string
  space?: boolean
}

export interface copyLinkArgs {
  page: Page
  resource: string
  name?: string
  via?: string
}

export type changeNameArgs = {
  page: Page
  resource?: string
  newName: string
  space?: boolean
}

export type addExpirationArgs = {
  page: Page
  resource: string
  linkName: string
  expireDate: string
}

export type addPasswordArgs = {
  page: Page
  resource: string
  linkName: string
  newPassword: string
}

export type changeRoleArgs = {
  page: Page
  resource?: string
  linkName: string
  role: string
  space?: boolean
}

export type deleteLinkArgs = {
  page: Page
  resourceName: string
  name: string
}

export type publicLinkAndItsEditButtonVisibilityArgs = {
  page: Page
  linkName: string
  resource?: string
  space?: boolean
}
const publicLinkSetRoleButton = `#files-role-%s`
const linkExpiryDatepicker = '.link-expiry-picker:not(.vc-container)'
const publicLinkEditRoleButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "link-details")]/` +
  `div/button[contains(@class, "edit-public-link-role-dropdown-toggle")]`
const addPublicLinkButton = '#files-file-link-add'
const publicLinkNameList =
  '//div[@id="oc-files-file-link"]//ul//h4[contains(@class,"oc-files-file-link-name")]'
const publicLinkUrlList =
  '//div[@id="oc-files-file-link"]//ul//p[contains(@class,"oc-files-file-link-url")]'
const publicLink = `//ul//h4[text()='%s']/following-sibling::div//p`
const publicLinkCurrentRole =
  '//button[contains(@class,"edit-public-link-role-dropdown-toggle")]//span[contains(@class,"link-current-role")]'
const linkUpdateDialog = '//div[contains(@class,"oc-notification-message-title")]'
const editPublicLinkButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]` +
  `//ancestor::li//div[contains(@class, "details-buttons")]//button[contains(@class, "edit-drop-trigger")]`
const editPublicLinkRenameButton =
  '//div[contains(@id,"edit-public-link-dropdown")]//button/span[text()="Rename"]'
const editPublicLinkSetExpirationButton =
  '//div[contains(@id,"edit-public-link-dropdown")]//button/span[text()="Add expiration date"]'
const editPublicLinkAddPasswordButton =
  '//div[contains(@id,"edit-public-link-dropdown")]//button/span[text()="Add password"]'
const editPublicLinkInput = '.oc-modal-body input.oc-text-input'
const editPublicLinkRenameConfirm = '.oc-modal-body-actions-confirm'
const deleteLinkButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]` +
  `//ancestor::li//div[contains(@class, "details-buttons")]//button/span[text()="Delete link"]`
const confirmDeleteButton = `//button[contains(@class,"oc-modal-body-actions-confirm") and text()="Delete"]`
const notificationContainer = 'div.oc-notification'

const getRecentLinkUrl = async (page: Page): Promise<string> => {
  return page.locator(publicLinkUrlList).first().textContent()
}

const getRecentLinkName = async (page: Page): Promise<string> => {
  return page.locator(publicLinkNameList).first().textContent()
}

export const createLink = async (args: createLinkArgs): Promise<string> => {
  const { space, page, resource } = args
  if (!space) {
    const resourcePaths = resource.split('/')
    const resourceName = resourcePaths.pop()
    if (resourcePaths.length) {
      await clickResource({ page: page, path: resourcePaths.join('/') })
    }
    await sidebar.open({ page: page, resource: resourceName })
    await sidebar.openPanel({ page: page, name: 'sharing' })
  }
  await page.locator(addPublicLinkButton).click()
  await clearCurrentPopup(page)
  return await getRecentLinkUrl(page)
}

export const changeRole = async (args: changeRoleArgs): Promise<string> => {
  const { page, resource, linkName, role, space } = args

  // clear all popups
  await clearAllPopups(page)

  let resourceName = null
  let shareType = 'space-share'
  if (!space) {
    const resourcePaths = resource.split('/')
    resourceName = resourcePaths.pop()
    shareType = 'sharing'
    if (resourcePaths.length) {
      await clickResource({ page: page, path: resourcePaths.join('/') })
    }
  }
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: shareType })
  await page.locator(util.format(publicLinkEditRoleButton, linkName)).click()

  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('api/v1/shares/') &&
        res.request().method() === 'PUT' &&
        res.status() === 200
    ),
    page.locator(util.format(publicLinkSetRoleButton, shareRoles[role])).click()
  ])

  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was updated successfully')
  return await page.locator(publicLinkCurrentRole).textContent()
}

export const changeName = async (args: changeNameArgs): Promise<string> => {
  const { page, resource, space, newName } = args

  // clear all popups
  await clearAllPopups(page)

  if (!space) {
    const resourcePaths = resource.split('/')
    const resourceName = resourcePaths.pop()
    if (resourcePaths.length) {
      await clickResource({ page: page, path: resourcePaths.join('/') })
    }
    await sidebar.open({ page: page, resource: resourceName })
    await sidebar.openPanel({ page: page, name: 'sharing' })
  }
  await page.locator(util.format(editPublicLinkButton, 'Link')).click()
  await page.locator(editPublicLinkRenameButton).click()
  await page.locator(editPublicLinkInput).fill(newName)
  await page.locator(editPublicLinkRenameConfirm).click()
  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was updated successfully')
  return await getRecentLinkName(page)
}

export const addPassword = async (args: addPasswordArgs): Promise<void> => {
  const { page, resource, linkName, newPassword } = args

  // clear all popups
  await clearAllPopups(page)

  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(util.format(editPublicLinkButton, linkName)).click()
  await page.locator(editPublicLinkAddPasswordButton).click()
  await page.locator(editPublicLinkInput).fill(newPassword)
  await page.locator(editPublicLinkRenameConfirm).click()
  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was updated successfully')
}

export const addExpiration = async (args: addExpirationArgs): Promise<void> => {
  const { page, resource, linkName, expireDate } = args
  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(util.format(editPublicLinkButton, linkName)).click()
  await page.locator(editPublicLinkSetExpirationButton).click()

  const newExpiryDate = getActualExpiryDate(
    expireDate.toLowerCase().match(/[dayrmonthwek]+/)[0] as any,
    expireDate
  )

  await page.locator(linkExpiryDatepicker).evaluate(
    (datePicker: any, { newExpiryDate }): any => {
      datePicker?.__vueParentComponent?.refs?.calendar.move(newExpiryDate)
    },
    { newExpiryDate }
  )
}

export const deleteLink = async (args: deleteLinkArgs): Promise<void> => {
  const { page, resourceName, name } = args

  // clear all popups
  await clearAllPopups(page)

  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(util.format(editPublicLinkButton, name)).click()
  await page.locator(util.format(deleteLinkButton, name)).click()
  await page.locator(confirmDeleteButton).click()
  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was deleted successfully')
}

export const getPublicLinkVisibility = async (
  args: publicLinkAndItsEditButtonVisibilityArgs
): Promise<string> => {
  const { page, linkName, resource, space } = args
  let shareType = 'space-share'
  let resourceName = null
  if (!space) {
    shareType = 'sharing'
    const resourcePaths = resource.split('/')
    resourceName = resourcePaths.pop()
    if (resourcePaths.length) {
      await clickResource({ page: page, path: resourcePaths.join('/') })
    }
  }
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: shareType })
  return await page.locator(util.format(publicLink, linkName)).textContent()
}

export const getLinkEditButtonVisibility = async (
  args: publicLinkAndItsEditButtonVisibilityArgs
): Promise<boolean> => {
  const { page, linkName } = args
  return await page.locator(util.format(editPublicLinkButton, linkName)).isVisible()
}

export const clearAllPopups = async (page: Page): Promise<void> => {
  const count = await page.locator(notificationContainer).evaluate((container) => {
    Object.values(container.children).forEach((child) => {
      container.removeChild(child)
    })
    return container.children.length
  })
  if (count) {
    throw new Error(`Failed to clear ${count} notifications`)
  }
  await expect(page.locator(linkUpdateDialog)).not.toBeVisible()
}

export const clearCurrentPopup = async (page: Page): Promise<void> => {
  await expect(page.locator(linkUpdateDialog)).toBeVisible()
  await clearAllPopups(page)
}
