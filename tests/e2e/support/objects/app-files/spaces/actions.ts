import { Page } from 'playwright'
import { sidebar } from '../utils'
import util from 'util'

const newSpaceMenuButton = '#new-space-menu-btn'
const spaceNameInputField = '.oc-modal input'
const actionConfirmButton = '.oc-modal-body-actions-confirm'
const spaceIdSelector = `[data-space-id="%s"]`
const spacesRenameOptionSelector = '.oc-files-actions-rename-trigger'
const editSpacesSubtitleOptionSelector = '.oc-files-actions-edit-description-trigger'
const editQuotaOptionSelector = '.oc-files-actions-edit-quota-trigger'
const spacesQuotaSearchField = '.oc-modal .vs__search'
const selectedQuotaValueField = '.vs--open'
const quotaValueDropDown = `.vs__dropdown-option :text-is("%s")`
const editSpacesDescription = '.oc-files-actions-edit-readme-content-trigger'
const spacesDescriptionInputArea = '#description-input-area'
/**/

export interface createSpaceArgs {
  name: string
  page: Page
}

export const createSpace = async (args: createSpaceArgs): Promise<string> => {
  const { page, name } = args

  await page.locator(newSpaceMenuButton).click()
  await page.locator(spaceNameInputField).fill(name)
  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.status() === 201 && resp.request().method() === 'POST' && resp.url().endsWith('drives')
    ),
    page.locator(actionConfirmButton).click()
  ])

  const { id } = await response.json()

  await page.waitForSelector(util.format(spaceIdSelector, id))

  return id
}

/**/

export interface openSpaceArgs {
  id: string
  page: Page
}

export const openSpace = async (args: openSpaceArgs): Promise<void> => {
  const { page, id } = args
  await page.locator(util.format(spaceIdSelector, id)).click()
}

/**/

export const changeSpaceName = async (args: {
  page: Page
  id: string
  value: string
}): Promise<void> => {
  const { page, value, id } = args
  await sidebar.open({ page: page })
  await sidebar.openPanel({ page: page, name: 'space-actions' })

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

  await sidebar.close({ page: page })
}

/**/

export const changeSpaceSubtitle = async (args: {
  page: Page
  id: string
  value: string
}): Promise<void> => {
  const { page, value, id } = args
  await sidebar.open({ page: page })
  await sidebar.openPanel({ page: page, name: 'space-actions' })

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

  await sidebar.close({ page: page })
}

/**/

export const changeSpaceDescription = async (args: {
  page: Page
  value: string
}): Promise<void> => {
  const { page, value } = args
  await sidebar.open({ page: page })
  await sidebar.openPanel({ page: page, name: 'space-actions' })
  const waitForUpdate = async () =>
    await page.waitForResponse(
      (resp) =>
        resp.url().endsWith('readme.md') &&
        resp.status() === 200 &&
        resp.request().method() === 'GET'
    )

  await page.locator(editSpacesDescription).click()
  await waitForUpdate()
  await page.locator(spacesDescriptionInputArea).fill(value)
  await Promise.all([waitForUpdate(), page.locator(actionConfirmButton).click()])
  await sidebar.close({ page: page })
}

/**/

export const changeQuota = async (args: {
  id: string
  page: Page
  value: string
}): Promise<void> => {
  const { id, page, value } = args
  await sidebar.open({ page: page })
  await sidebar.openPanel({ page: page, name: 'space-actions' })

  await page.locator(editQuotaOptionSelector).click()
  const searchLocator = await page.locator(spacesQuotaSearchField)
  await searchLocator.fill(value)
  await page.waitForSelector(selectedQuotaValueField)
  await page.locator(util.format(quotaValueDropDown, value)).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(encodeURIComponent(id)) &&
        resp.status() === 200 &&
        resp.request().method() === 'PATCH'
    ),
    page.locator(actionConfirmButton).click()
  ])

  await sidebar.close({ page: page })
}
