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
  role: string
  dateOfExpiration: string
  password: string
  via: 'SIDEBAR_PANEL' | 'QUICK_ACTION'
}

export type changeRoleArgs = {
  page: Page
  resource: string
  name: string
  role: string
}

const publicLinkSetNameInputField = '#oc-files-file-link-name'
const publicLinkSelectRolesButton = '#files-file-link-role-button'
const publicLinkSetRoleButton = `#files-role-%s`
const publicLinkExpiryDate = '#oc-files-file-link-expire-date'
const publicLinkSetPasswordInputField = '#oc-files-file-link-password'
const publicLinkEditRoleButton =
  `//h4[contains(@class, "oc-files-file-link-name") and text()="%s"]//ancestor::li//div[contains(@class, "link-details")]/` +
  `div/button[contains(@class, "edit-public-link-role-dropdown-toggl")]`
const publicLinkQuickActionButton = `//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]`
const addPublicLinkButton = '#files-file-link-add'
const savePublicLinkButton = '#oc-files-file-link-create'
const publicLink = `//ul/li/div/h4[contains(text(),'%s')]/following-sibling::div//p`
const publicLinkCurrentRole =
  '//button[contains(@class,"edit-public-link-role-dropdown-toggl")]//span[contains(@class,"oc-invisible-sr")]'
const linkUpdateSuccessfulDialog = '//div[contains(@class,"oc-notification-message-title")]'

const fillPublicLink = async (page, name, role, dateOfExpiration, password): Promise<void> => {
  if (name) {
    await page.locator(publicLinkSetNameInputField).fill(name)
  }

  if (role) {
    await page.locator(publicLinkSelectRolesButton).click()
    await page.locator(util.format(publicLinkSetRoleButton, role)).click()
  }

  if (dateOfExpiration) {
    const newExpiryDate = getActualExpiryDate(
      dateOfExpiration.toLowerCase().match(/[dayrmonthwek]+/)[0] as any,
      dateOfExpiration
    )

    await page.locator(publicLinkExpiryDate).evaluate(
      (datePicker: any, { newExpiryDate }): any => {
        datePicker.__vue__.updateValue(newExpiryDate)
      },
      { newExpiryDate }
    )
  }

  if (password) {
    await page.locator(publicLinkSetPasswordInputField).fill(password)
  }
}

export const createLink = async (args: createLinkArgs): Promise<string> => {
  const { page, resource, name, role, dateOfExpiration, password, via } = args
  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }

  switch (via) {
    case 'QUICK_ACTION':
      await page.locator(util.format(publicLinkQuickActionButton, resourceName)).click()
      break

    case 'SIDEBAR_PANEL':
      await sidebar.open({ page: page, resource: resourceName })
      await sidebar.openPanel({ page: page, name: 'sharing' })
      break
  }
  await page.locator(addPublicLinkButton).click()
  await fillPublicLink(page, name, role, dateOfExpiration, password)
  await page.locator(savePublicLinkButton).click()
  return await page.locator(util.format(publicLink, name)).textContent()
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
  const message = await page.locator(linkUpdateSuccessfulDialog).textContent()
  expect(message.trim()).toBe('Link was updated successfully')
  return await page.locator(publicLinkCurrentRole).textContent()
}
