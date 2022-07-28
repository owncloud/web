import { Page } from 'playwright'
import { expect } from '@playwright/test'
import util from 'util'
import { sidebar } from '../utils'
import { getActualExpiryDate } from '../../../utils/datePicker'
import { clickResource } from '../resource/actions'

export interface createLinkArgs {
  page: Page
  resource: string
  name: string
}

export type changeNameArgs = {
  page: Page
  resource: string
  newName: string
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
  resource: string
  name: string
  role: string
}

export type deleteLinkArgs = {
  page: Page
  resourceName: string
  name: string
}

const publicLinkSetRoleButton = `#files-role-%s`
const linkExpiryDatepicker = '.link-expiry-picker'
const publicLinkEditRoleButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "link-details")]/` +
  `div/button[contains(@class, "edit-public-link-role-dropdown-toggle")]`
const addPublicLinkButton = '#files-file-link-add'
const getMostRecentLink = '//div[@id="oc-files-file-link"]//ul/li[1]'
const publicLink = `//ul/li/div/h4[contains(text(),'%s')]/following-sibling::div//p`
const publicLinkCurrentRole =
  '//button[contains(@class,"edit-public-link-role-dropdown-toggle")]//span[contains(@class,"edit-public-link-role-dropdown-toggle-current-role")]'
const linkUpdateDialog = '//div[contains(@class,"oc-notification-message-title")]'
const editPublicLinkButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]` +
  `//ancestor::li//div[contains(@class, "details-buttons")]//button[contains(@class, "edit-drop-trigger")]`
const editPublicLinkRenameButton = '//button[text()="Rename"]'
const editPublicLinkSetExpirationButton = '//button[text()="Add expiration date"]'
const editPublicLinkAddPasswordButton = '//button[text()="Add password"]'
const editPublicLinkInput = '.oc-modal-body input.oc-text-input'
const editPublicLinkRenameConfirm = '.oc-modal-body-actions-confirm'
const deleteLinkButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]` +
  `//ancestor::li//div[contains(@class, "details-buttons")]//button[text()="Delete link"]`
const confirmDeleteButton = `//button[contains(@class,"oc-modal-body-actions-confirm") and text()="Delete"]`

export const createLink = async (args: createLinkArgs): Promise<string> => {
  const { page, resource } = args
  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }

  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(addPublicLinkButton).click()
  // const message = await page.locator(linkUpdateDialog).textContent()
  // expect(message.trim()).toBe('Link was created successfully')
  // const linkId = await page.getAttribute(getMostRecentLink, 'data-testid')
  // return linkId.replace('files-link-id-', '')
  return await page.locator(util.format(publicLink, 'Link')).textContent()
}

export const changeRole = async (args: changeRoleArgs): Promise<string> => {
  const { page, resource, name, role } = args
  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(util.format(publicLinkEditRoleButton, name)).click()
  await page.locator(util.format(publicLinkSetRoleButton, role.toLowerCase())).click()
  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was updated successfully')
  return await page.locator(publicLinkCurrentRole).textContent()
}

export const changeName = async (args: changeNameArgs): Promise<string> => {
  const { page, resource, newName } = args
  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(util.format(editPublicLinkButton, 'Link')).click()
  await page.locator(editPublicLinkRenameButton).click()
  await page.locator(editPublicLinkInput).fill(newName)
  await page.locator(editPublicLinkRenameConfirm).click()
  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was updated successfully')
  return await page.locator(getMostRecentLink + '//h4').textContent()
}

export const addPassword = async (args: addPasswordArgs): Promise<void> => {
  const { page, resource, linkName, newPassword } = args
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
      datePicker.__vue__.updateValue(newExpiryDate)
    },
    { newExpiryDate }
  )
}

export const deleteLink = async (args: deleteLinkArgs): Promise<void> => {
  const { page, resourceName, name } = args
  await sidebar.open({ page: page, resource: resourceName })
  await sidebar.openPanel({ page: page, name: 'sharing' })
  await page.locator(util.format(editPublicLinkButton, name)).click()
  await page.locator(util.format(deleteLinkButton, name)).click()
  await page.locator(confirmDeleteButton).click()
  const message = await page.locator(linkUpdateDialog).textContent()
  expect(message.trim()).toBe('Link was deleted successfully')
}
