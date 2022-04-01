import { Page } from 'playwright'
import { sidebar } from '../utils'

/**/

export interface createSpaceArgs {
  name: string
  page: Page
}

export const createSpace = async (args: createSpaceArgs): Promise<string> => {
  const { page, name } = args

  await page.locator('#new-space-menu-btn').click()
  await page.locator('.oc-modal input').fill(name)
  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.status() === 201 && resp.request().method() === 'POST' && resp.url().endsWith('drives')
    ),
    page.locator('.oc-modal-body-actions-confirm').click()
  ])

  const { id } = await response.json()

  await page.waitForSelector(`[data-space-id="${id}"]`)

  return id
}

/**/

export interface openSpaceArgs {
  id: string
  page: Page
}

export const openSpace = async (args: openSpaceArgs): Promise<void> => {
  const { page, id } = args
  await page.locator(`[data-space-id="${id}"]`).click()
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

  await page.locator('.oc-files-actions-rename-trigger').click()
  await page.locator('.oc-text-input').fill(value)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(id) && resp.status() === 200 && resp.request().method() === 'PATCH'
    ),
    page.locator('.oc-modal-body-actions-confirm').click()
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

  await page.locator('.oc-files-actions-edit-description-trigger').click()
  await page.locator('.oc-text-input').fill(value)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(id) && resp.status() === 200 && resp.request().method() === 'PATCH'
    ),
    page.locator('.oc-modal-body-actions-confirm').click()
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

  await page.locator('.oc-files-actions-edit-readme-content-trigger').click()
  await waitForUpdate()
  await page.locator('#description-input-area').fill(value)
  await Promise.all([waitForUpdate(), page.locator('.oc-modal-body-actions-confirm').click()])
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

  await page.locator('.oc-files-actions-edit-quota-trigger').click()
  const searchLocator = await page.locator('.oc-modal .vs__search')
  await searchLocator.fill(value)
  await page.waitForSelector('.vs--open')
  await page.locator(`.vs__dropdown-option :text-is("${value}")`).click()

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(id) && resp.status() === 200 && resp.request().method() === 'PATCH'
    ),
    page.locator('.oc-modal-body-actions-confirm').click()
  ])

  await sidebar.close({ page: page })
}
