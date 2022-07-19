import { Download, Page } from 'playwright'
import util from 'util'
import { resourceExists, waitForResources } from './utils'
import path from 'path'
import { File } from '../../../types'
import { sidebar } from '../utils'

const downloadButtonSideBar = '#oc-files-actions-sidebar .oc-files-actions-download-file-trigger'
const downloadButtonBatchActionSingleFile = '.oc-files-actions-download-file-trigger'
const downloadButtonBatchActionMultiple = '.oc-files-actions-download-archive-trigger'
const checkBox = `//*[@data-test-resource-name="%s"]//ancestor::tr//input`
const checkBoxForTrashbin = `//*[@data-test-resource-path="%s"]//ancestor::tr//input`
const fileRow = '//ancestor::tr'
const resourceNameSelector = `[data-test-resource-name="%s"]`
const addNewResourceButton = `#new-file-menu-btn`
const createNewFolderButton = '#new-folder-btn'
const folderNameInput = '.oc-modal input'
const resourceUploadButton = '#upload-menu-btn'
const fileUploadInput = '#files-file-upload-input'
const uploadInfoCloseButton = '#close-upload-info-btn'
const filesAction = `.oc-files-actions-%s-trigger`
const locationConfirmButton = '#location-picker-btn-confirm'
const breadcrumbRoot = '//nav[contains(@class, "oc-breadcrumb")]/ol/li[1]/a'
const fileRenameInput = '.oc-text-input'
const deleteButton = 'button.oc-files-actions-delete-trigger'
const actionConfirmationButton = '.oc-modal-body-actions-confirm'
const versionRevertButton = '//*[@data-testid="file-versions-revert-button"]'
const emptyTrashBinButton = '.oc-files-actions-empty-trash-bin-trigger'
const notificationMessageDialog = '.oc-notification-message-title'
const permanentDeleteButton = '.oc-files-actions-delete-permanent-trigger'
const restoreResourceButton = '.oc-files-actions-restore-trigger'

export const clickResource = async ({
  page,
  path
}: {
  page: Page
  path: string
}): Promise<void> => {
  const paths = path.split('/')
  for (const name of paths) {
    const resource = await page.locator(util.format(resourceNameSelector, name))
    const itemId = await resource.locator(fileRow).getAttribute('data-item-id')

    await Promise.all([
      resource.click(),
      page.waitForResponse(
        (resp) => resp.url().endsWith(encodeURIComponent(name)) || resp.url().endsWith(itemId)
      )
    ])

    // toDo: remove me
    // @jannik: please have a look here what we can wait for to be sure that it's there
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

/**/

export interface createResourceArgs {
  page: Page
  name: string
  type: 'folder'
}

export const createResource = async (args: createResourceArgs): Promise<void> => {
  const { page, name } = args
  const paths = name.split('/')

  for (const resource of paths) {
    const folderExists = await resourceExists({
      page: page,
      name: resource
    })

    if (!folderExists) {
      await page.locator(addNewResourceButton).click()
      await page.locator(createNewFolderButton).click()
      await page.locator(folderNameInput).fill(resource)
      await Promise.all([
        page.waitForResponse(
          (resp) => resp.status() === 207 && resp.request().method() === 'PROPFIND'
        ),
        page.locator(actionConfirmationButton).click()
      ])
    }

    await clickResource({ page, path: resource })
  }
}

/**/

export interface uploadResourceArgs {
  page: Page
  resources: File[]
  to?: string
  createVersion?: boolean
}

export const uploadResource = async (args: uploadResourceArgs): Promise<void> => {
  const { page, resources, to, createVersion } = args
  if (to) {
    await clickResource({ page: page, path: to })
  }

  await page.locator(resourceUploadButton).click()
  await page.locator(fileUploadInput).setInputFiles(resources.map((file) => file.path))

  if (createVersion) {
    await page.locator(actionConfirmationButton).click()
    // @TODO check if upload was successful
  }

  await page.locator(uploadInfoCloseButton).click()

  await waitForResources({
    page: page,
    names: resources.map((file) => path.basename(file.name))
  })
}

/**/

export interface downloadResourcesArgs {
  page: Page
  names: string[]
  folder?: string
  via: 'SIDEBAR_PANEL' | 'BATCH_ACTION'
}

export const downloadResources = async (args: downloadResourcesArgs): Promise<Download[]> => {
  const { page, names, folder, via } = args
  const downloads = []

  switch (via) {
    case 'SIDEBAR_PANEL': {
      if (folder) {
        await clickResource({ page, path: folder })
      }
      for (const name of names) {
        await sidebar.open({ page: page, resource: name })
        await sidebar.openPanel({ page: page, name: 'actions' })

        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.locator(downloadButtonSideBar).click()
        ])

        await sidebar.close({ page: page })

        downloads.push(download)
      }
      break
    }

    case 'BATCH_ACTION': {
      await selectOrDeselectResources({ page: page, names: names, folder: folder, select: true })
      let downloadSelector = downloadButtonBatchActionMultiple
      if (names.length === 1) {
        downloadSelector = downloadButtonBatchActionSingleFile
      }
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator(downloadSelector).click()
      ])
      downloads.push(download)
      break
    }
  }

  return downloads
}

export type selectResourcesArgs = {
  page: Page
  names: string[]
  folder?: string
  select: boolean
}

export const selectOrDeselectResources = async (args: selectResourcesArgs): Promise<void> => {
  const { page, folder, names, select } = args
  if (folder) {
    await clickResource({ page: page, path: folder })
  }

  for (const resource of names) {
    const exists = await resourceExists({
      page: page,
      name: resource
    })
    if (exists) {
      const resourceCheckbox = page.locator(util.format(checkBox, resource))

      if (!(await resourceCheckbox.isChecked()) && select) {
        await resourceCheckbox.check()
      } else if (await resourceCheckbox.isChecked()) {
        await resourceCheckbox.uncheck()
      }
    } else {
      throw new Error(`The resource ${resource} you are trying to select does not exist`)
    }
  }
}

/**/

export interface moveOrCopyResourceArgs {
  page: Page
  resource: string
  newLocation: string
  action: 'copy' | 'move'
}

export const moveOrCopyResource = async (args: moveOrCopyResourceArgs): Promise<void> => {
  const { page, resource, newLocation, action } = args
  const { dir: resourceDir, base: resourceBase } = path.parse(resource)

  if (resourceDir) {
    await clickResource({ page: page, path: resourceDir })
  }

  await page.locator(util.format(resourceNameSelector, resourceBase)).click({ button: 'right' })
  await page.locator(util.format(filesAction, action)).first().click()
  await page.locator(breadcrumbRoot).click()

  if (newLocation !== 'Personal') {
    await clickResource({ page: page, path: newLocation })
  }

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(resourceBase) &&
        resp.status() === 201 &&
        resp.request().method() === action.toUpperCase()
    ),
    page.locator(locationConfirmButton).click()
  ])

  await waitForResources({
    page,
    names: [resourceBase]
  })
}

/**/

export interface renameResourceArgs {
  page: Page
  resource: string
  newName: string
}

export const renameResource = async (args: renameResourceArgs): Promise<void> => {
  const { page, resource, newName } = args
  const { dir: resourceDir, base: resourceBase } = path.parse(resource)

  if (resourceDir) {
    await clickResource({ page, path: resourceDir })
  }

  await page.locator(util.format(resourceNameSelector, resourceBase)).click({ button: 'right' })
  await page.locator(util.format(filesAction, 'rename')).click()
  await page.locator(fileRenameInput).fill(newName)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(resourceBase) &&
        resp.status() === 201 &&
        resp.request().method() === 'MOVE'
    ),
    page.locator(actionConfirmationButton).click()
  ])

  await waitForResources({
    page,
    names: [newName]
  })
}

/**/

export interface restoreResourceVersionArgs {
  page: Page
  files: File[]
  folder?: string
}

export const restoreResourceVersion = async (args: restoreResourceVersionArgs) => {
  const { page, files, folder } = args
  const fileName = files.map((file) => path.basename(file.name))
  await clickResource({ page, path: folder })
  await sidebar.open({ page, resource: fileName[0] })
  await sidebar.openPanel({ page, name: 'versions' })

  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes('/v/') && resp.status() === 204 && resp.request().method() === 'COPY'
    ),
    await page.locator(versionRevertButton).click()
  ])
}

/**/

export interface deleteResourceArgs {
  page: Page
  resource: string
}

export const deleteResource = async (args: deleteResourceArgs): Promise<void> => {
  const { page, resource } = args
  const folderPaths = resource.split('/')
  const resourceName = folderPaths.pop()

  if (folderPaths.length) {
    await clickResource({ page, path: folderPaths.join('/') })
  }

  const resourceCheckbox = page.locator(util.format(checkBox, resourceName))

  if (!(await resourceCheckbox.isChecked())) {
    await resourceCheckbox.check()
  }
  await page.locator(deleteButton).first().click()
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes(encodeURIComponent(resourceName)) &&
        resp.status() === 204 &&
        resp.request().method() === 'DELETE'
    ),
    page.locator(actionConfirmationButton).click()
  ])
}

export interface downloadResourceVersionArgs {
  page: Page
  files: File[]
  folder?: string
}

export const downloadResourceVersion = async (
  args: downloadResourceVersionArgs
): Promise<Download[]> => {
  const { page, files, folder } = args
  const fileName = files.map((file) => path.basename(file.name))
  const downloads = []
  await clickResource({ page, path: folder })
  await sidebar.open({ page, resource: fileName[0] })
  await sidebar.openPanel({ page, name: 'versions' })
  const [download] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes('/v/') && resp.status() === 200 && resp.request().method() === 'HEAD'
    ),
    page.waitForEvent('download'),
    await page.locator('//*[@data-testid="file-versions-download-button"]').first().click()
  ])
  await sidebar.close({ page: page })
  downloads.push(download)
  return downloads
}

export const emptyTrashBinResources = async (page): Promise<string> => {
  await page.locator(emptyTrashBinButton).click()
  const statuses = [204, 403]
  await Promise.all([
    page.waitForResponse(
      (resp) => statuses.includes(resp.status()) && resp.request().method() === 'DELETE'
    ),
    page.locator(actionConfirmationButton).click()
  ])
  const message = await page.locator(notificationMessageDialog).textContent()
  return message.trim().toLowerCase()
}

export interface deleteResourceTrashbinArgs {
  resource: string
  page: Page
}

export const deleteResourceTrashbin = async (args: deleteResourceTrashbinArgs): Promise<string> => {
  const { page, resource } = args
  const resourceCheckbox = page.locator(util.format(checkBoxForTrashbin, resource))
  if (!(await resourceCheckbox.isChecked())) {
    await resourceCheckbox.check()
  }
  const statuses = [204, 403]
  await page.locator(permanentDeleteButton).first().click()
  await Promise.all([
    page.waitForResponse(
      (resp) => statuses.includes(resp.status()) && resp.request().method() === 'DELETE'
    ),
    page.locator(actionConfirmationButton).click()
  ])
  const message = await page.locator(notificationMessageDialog).textContent()
  return message.trim().toLowerCase()
}

export interface restoreResourceTrashbinArgs {
  resource: string
  actionType: string
  page: Page
}

export const restoreResourceTrashbin = async (
  args: restoreResourceTrashbinArgs
): Promise<string> => {
  const { page, resource } = args
  const resourceCheckbox = page.locator(util.format(checkBoxForTrashbin, resource))
  if (!(await resourceCheckbox.isChecked())) {
    await resourceCheckbox.check()
  }
  const statuses = [201, 403]
  await Promise.all([
    page.waitForResponse(
      (resp) => statuses.includes(resp.status()) && resp.request().method() === 'MOVE'
    ),
    await page.locator(restoreResourceButton).click()
  ])

  const message = await page.locator(notificationMessageDialog).textContent()
  return message.trim().toLowerCase()
}
