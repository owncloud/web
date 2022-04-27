import { Page } from 'playwright'
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

export const createLink = async (args: createLinkArgs): Promise<string> => {
  const { page, resource, name, role, dateOfExpiration, password, via } = args
  const resourcePaths = resource.split('/')
  const resourceName = resourcePaths.pop()
  if (resourcePaths.length) {
    await clickResource({ page: page, path: resourcePaths.join('/') })
  }

  switch (via) {
    case 'QUICK_ACTION':
      await page
        .locator(
          util.format(
            `//*[@data-test-resource-name="%s"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]`,
            resourceName
          )
        )
        .click()
      break

    case 'SIDEBAR_PANEL':
      await sidebar.open({ page: page, resource: resourceName })
      await sidebar.openPanel({ page: page, name: 'sharing' })
      break
  }
  await page.locator('#files-file-link-add').click()

  if (name) {
    await page.locator('#oc-files-file-link-name').fill(name)
  }

  if (role) {
    await page.locator('#files-file-link-role-button').click()
    await page.locator(util.format(`//span[@id="files-role-%s"]`, role)).click()
  }

  if (dateOfExpiration) {
    const newExpiryDate = getActualExpiryDate(
      dateOfExpiration.toLowerCase().match(/[dayrmonthwek]+/)[0] as any,
      dateOfExpiration
    )

    await page.locator('#oc-files-file-link-expire-date').evaluate(
      (datePicker: any, { newExpiryDate }): any => {
        datePicker.__vue__.updateValue(newExpiryDate)
      },
      { newExpiryDate }
    )
  }

  if (password) {
    await page.locator('#oc-files-file-link-password').fill(password)
  }

  await page.locator('#oc-files-file-link-create').click()
  return await page
    .locator(`//ul/li/div/h4[contains(text(),'${name}')]/following-sibling::div//p`)
    .textContent()
}
