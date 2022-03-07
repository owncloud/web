import { Download, Page } from 'playwright'
import { resourceExists, waitForResources } from './utils'
import path from 'path'
import { File } from '../../../types'
import { sidebar } from '../utils'

export const clickResource = async ({
  page,
  path
}: {
  page: Page
  path: string
}): Promise<void> => {
  const paths = path.split('/')
  for (const name of paths) {
    const resourceSelector = `[data-test-resource-name="${name}"]`
    await page.waitForSelector(resourceSelector)
    await Promise.all([
      page.locator(resourceSelector).click(),
      page.waitForResponse((resp) => resp.url().endsWith(encodeURIComponent(name)))
    ])
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
      await page.locator('#new-file-menu-btn').click()
      await page.locator('#new-folder-btn').click()
      await page.locator('.oc-modal input').fill(resource)
      await Promise.all([
        page.waitForResponse(
          (resp) => resp.status() === 207 && resp.request().method() === 'PROPFIND'
        ),
        page.locator('.oc-modal-body-actions-confirm').click()
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

  await page.locator('#upload-menu-btn').click()
  await page.locator('#fileUploadInput').setInputFiles(resources.map((file) => file.path))

  if (createVersion) {
    const fileName = resources.map((file) => path.basename(file.name))
    await Promise.all([
      page.waitForResponse((resp) => resp.url().endsWith(fileName[0]) && resp.status() === 204),
      page.locator('.oc-modal-body-actions-confirm').click()
    ])
  }

  await waitForResources({
    page: page,
    names: resources.map((file) => path.basename(file.name))
  })
}

/**/

export interface downloadResourcesArgs {
  page: Page
  names: string[]
  folder: string
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
          page.locator('#oc-files-actions-sidebar .oc-files-actions-download-file-trigger').click()
        ])

        await sidebar.close({ page: page })

        downloads.push(download)
      }
      break
    }

    case 'BATCH_ACTION': {
      await selectMultipleResources({ page: page, names: names, folder: folder })
      if (names.length === 1) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.locator('.oc-files-actions-download-file-trigger').click()
        ])
        downloads.push(download)
      } else {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.locator('.oc-files-actions-download-archive-trigger').click()
        ])
        downloads.push(download)
      }
      break
    }
  }

  return downloads
}

export type selectResourcesArgs = {
  page: Page
  names: string[]
  folder: string
}

export const selectMultipleResources = async (args: selectResourcesArgs): Promise<void> => {
  const { page, folder, names } = args
  if (folder) {
    await clickResource({ page: page, path: folder })
  }

  for (const name of names) {
    const resourceCheckbox = page.locator(
      `//*[@data-test-resource-name="${name}"]//ancestor::tr//input`
    )

    if (!(await resourceCheckbox.isChecked())) {
      await resourceCheckbox.check()
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

  await page.locator(`//*[@data-test-resource-name="${resourceBase}"]`).click({ button: 'right' })
  await page.locator(`.oc-files-actions-${action}-trigger`).first().click()
  await page.locator('//nav[contains(@class, "oc-breadcrumb")]/ol/li[1]/a').click()

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
    page.locator('#location-picker-btn-confirm').click()
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

  await page.locator(`//*[@data-test-resource-name="${resourceBase}"]`).click({ button: 'right' })
  await page.locator('.oc-files-actions-rename-trigger').click()
  await page.locator('.oc-text-input').fill(newName)
  await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().endsWith(resourceBase) &&
        resp.status() === 201 &&
        resp.request().method() === 'MOVE'
    ),
    page.locator('.oc-modal-body-actions-confirm').click()
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
    await page.locator('//*[@data-testid="file-versions-revert-button"]').click()
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

  const resourceCheckbox = page.locator(
    `//*[@data-test-resource-name="${resourceName}"]//ancestor::tr//input`
  )

  if (!(await resourceCheckbox.isChecked())) {
    await resourceCheckbox.check()
  }
  await page.locator('button.oc-files-actions-delete-trigger').first().click()
  await page.locator('.oc-modal-body-actions-confirm').click()
  await page.waitForResponse(
    (resp) => resp.url().includes(encodeURIComponent(resourceName)) && resp.status() === 204
  )
}
