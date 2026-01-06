import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import {
  ActorsEnvironment,
  FilesEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import {
  ActionViaType,
  createResourceTypes,
  displayedResourceType,
  searchFilter,
  shortcutType
} from '../../../e2e/support/objects/app-files/resource/actions'
import { editor } from '../../../e2e/support/objects/app-files/utils'
import path from 'path'
import { Public } from '../../../e2e/support/objects/app-files/page'
import { Resource } from '../../../e2e/support/objects/app-files/resource'
import { config } from '../../../e2e/config'
import * as runtimeFs from '../../../e2e/support/utils/runtimeFs'

export async function uploadResource({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resources: { name: string; to?: string; type?: string; option?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  for (const resource of resources) {
    await resourceObject.upload({
      to: resource.to,
      resources: [filesEnvironment.getFile({ name: resource.name })],
      option: resource.option,
      type: resource.type
    })
  }
}

export async function isAbleToEditFileOrFolder({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const userCanEdit = await resourceObject.canManageResource({ resource })
  return userCanEdit
}

export async function userCreatesResources({
  actorsEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resources: { name: string; type: createResourceTypes; content?: string; password?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  for (const resource of resources) {
    await resourceObject.create({
      name: resource.name,
      type: resource.type,
      content: resource.content,
      password: resource.password
    })
  }
}

export async function searchGloballyWithFilter({
  actorsEnvironment,
  stepUser,
  keyword,
  filter,
  command
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  keyword: string
  filter: string
  command?: string
}): Promise<void> {
  keyword = keyword ?? ''
  const pressEnter = !!command && command.endsWith('presses enter')
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  // let search indexing to complete
  await page.waitForTimeout(1000)
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.searchResource({
    keyword,
    filter: filter as searchFilter,
    pressEnter
  })
}

export async function switchToTilesViewMode({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.switchToTilesViewMode()
}

export async function shouldSeeResourcesAsTiles({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.expectThatResourcesAreTiles()
}

export async function userOpensResources({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.openFolder(resource)
}

export async function openResourceInViewer({
  actorsEnvironment,
  stepUser,
  resource,
  application
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  application: 'mediaviewer' | 'pdfviewer' | 'texteditor' | 'Collabora' | 'OnlyOffice'
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.openFileInViewer({
    name: resource,
    actionType: application
  })
}

export async function userShouldSeeTheResources({
  actorsEnvironment,
  listType,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  listType: displayedResourceType
  stepUser: string
  resources: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const actualList = await resourceObject.getDisplayedResources({
    keyword: listType
  })
  for (const resource of resources) {
    expect(actualList).toContain(resource)
  }
}

export async function userShouldNotSeeTheResources({
  actorsEnvironment,
  listType,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  listType: displayedResourceType
  stepUser: string
  resources: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const actualList = await resourceObject.getDisplayedResources({
    keyword: listType
  })
  for (const resource of resources) {
    expect(actualList).not.toContain(resource)
  }
}

export async function navigateToPageNumber({
  actorsEnvironment,
  stepUser,
  pageNumber
}: {
  actorsEnvironment: ActorsEnvironment
  pageNumber: string
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.changePage({ pageNumber })
}

export async function expectFooterTextToBe({
  actorsEnvironment,
  stepUser,
  expectedText
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedText: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const actualText = await resourceObject.getFileListFooterText()
  expect(actualText).toBe(expectedText)
}

export async function assertToHaveNoOfFiles({
  actorsEnvironment,
  stepUser,
  expectedNumberOfResources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedNumberOfResources: number
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const actualNumberOfResources = await resourceObject.countNumberOfResourcesInThePage()
  expect(actualNumberOfResources).toBe(expectedNumberOfResources)
}

export async function showHiddenFiles({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.showHiddenFiles()
}

export async function getCurrentPageNumber({
  actorsEnvironment,
  stepUser,
  pageNumber
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  pageNumber: string
}): Promise<string> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  return await resourceObject.getCurrentPageNumber({ pageNumber })
}

export async function changeItemsPerPage({
  actorsEnvironment,
  stepUser,
  itemsPerPage
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  itemsPerPage: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.changeItemsPerPage({ itemsPerPage })
}

export async function expectPageNumberNotToBeVisible({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.expectPageNumberNotToBeVisible()
}

export async function toggleFlatList({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.toggleFlatList()
}

export async function getFilesList({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<string[]> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  return await resourceObject.getAllFiles()
}

export async function userCreatesSpaceFromFolderUsingContexMenu({
  actorsEnvironment,
  spacesEnvironment,
  stepUser,
  spaceName,
  folderName
}: {
  actorsEnvironment: ActorsEnvironment
  spacesEnvironment: SpacesEnvironment
  stepUser: string
  spaceName: string
  folderName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const space = await resourceObject.createSpaceFromFolder({
    folderName: folderName,
    spaceName: spaceName
  })
  spacesEnvironment.createSpace({
    key: space.name,
    space: { name: space.name, id: space.id }
  })
}

export async function userCreatesSpaceFromResourcesUsingContexMenu({
  actorsEnvironment,
  spacesEnvironment,
  stepUser,
  spaceName,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  spacesEnvironment: SpacesEnvironment
  stepUser: string
  spaceName: string
  resources: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const space = await resourceObject.createSpaceFromSelection({ resources, spaceName })
  spacesEnvironment.createSpace({
    key: space.name,
    space: { name: space.name, id: space.id }
  })
}

export async function userAddsContentInTextEditor({
  actorsEnvironment,
  stepUser,
  text,
  editor
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  text: string
  editor: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.fillDocumentContent({
    page,
    text,
    editor
  })
}

export async function userSavesTextEditor({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  await editor.save(page)
}

export async function userClosesFileViewer({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  await editor.close(page)
}

// When "Brian" deletes the following resources using the sidebar panel
//   | resource      | from               |
//   | lorem-big.txt | folder_to_shared_2 |
export async function userDeletesResources({
  actorsEnvironment,
  stepUser,
  actionType = 'SIDEBAR_PANEL',
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: 'BATCH_ACTION' | 'SIDEBAR_PANEL'
  resources: { name: string; from?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.Resource({ page })
  for (const resource of resources) {
    await pageObject.delete({
      folder: resource.from === '' ? null : resource.from,
      resourcesWithInfo: [{ name: resource.name }],
      via: actionType
    })
  }
}

export async function deleteResourceFromTrashbin({
  actorsEnvironment,
  stepUser,
  resource,
  actionType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  actionType: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  if (actionType === 'should') {
    const message = await resourceObject.deleteTrashBin({ resource: resource })
    const paths = resource.split('/')
    expect(message).toBe(`"${paths[paths.length - 1]}" was deleted successfully`)
  } else {
    await resourceObject.expectThatDeleteTrashBinButtonIsNotVisible({ resource: resource })
  }
}

export async function restoreDeletedResourceFromTrashbin({
  actorsEnvironment,
  stepUser,
  resource,
  actionType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  actionType: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  if (actionType === 'should') {
    const message = await resourceObject.restoreTrashBin({
      resource: resource
    })
    const paths = resource.split('/')
    expect(message).toBe(`${paths[paths.length - 1]} was restored successfully`)
  } else {
    await resourceObject.expectThatRestoreTrashBinButtonIsNotVisible({
      resource: resource
    })
  }
}
export async function userCreatesShortcutForResources({
  actorsEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resources: { resource: string; name: string; type: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  for (const resource of resources) {
    await resourceObject.createShotcut({
      resource: resource.resource,
      name: resource.name,
      type: resource.type as shortcutType
    })
  }
}

type resourceToDownload = {
  resource: string
  type: string
  from?: string
}

export async function userDownloadsResource({
  actorsEnvironment,
  stepUser,
  resourceToDownload,
  actionType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resourceToDownload: resourceToDownload[]
  actionType: ActionViaType
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await processDownload(resourceObject, actionType, resourceToDownload)
}

export const processDownload = async (
  pageObject: Public | Resource,
  actionType: ActionViaType,
  resourceToDownload: resourceToDownload[]
) => {
  let downloads, files, parentFolder
  const downloadedResources: string[] = []

  const downloadInfo = resourceToDownload.reduce<Record<string, { name: string; type: string }[]>>(
    (acc, stepRow) => {
      const { resource, from, type } = stepRow
      const resourceInfo = {
        name: resource,
        type: type
      }
      if (!acc[from]) {
        acc[from] = []
      }
      acc[from].push(resourceInfo)
      return acc
    },
    {}
  )

  for (const folder of Object.keys(downloadInfo)) {
    files = downloadInfo[folder]
    parentFolder = folder !== 'undefined' ? folder : null

    downloads = await pageObject.download({
      folder: parentFolder,
      resources: files,
      via: actionType
    })

    downloads.forEach((download) => {
      const { name } = path.parse(download.suggestedFilename())
      downloadedResources.push(name)
    })

    if (actionType === 'SIDEBAR_PANEL' || actionType === 'PREVIEW_TOPBAR') {
      expect(downloads.length).toBe(files.length)
      for (const resource of files) {
        const fileOrFolderName = path.parse(resource.name).name
        if (resource.type === 'file') {
          expect(downloadedResources).toContain(fileOrFolderName)
        } else {
          expect(downloadedResources).toContain('download')
        }
      }
    }
  }

  if (actionType === 'BATCH_ACTION') {
    expect(downloads.length).toBe(1)
    downloads.forEach((download) => {
      const { name } = path.parse(download.suggestedFilename())
      expect(name).toBe('download')
    })
  }
}

export async function userOpensShortcut({
  actorsEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.openShotcut({ name })
}
export async function userCanOpenShortcutWithExternalUrl({
  actorsEnvironment,
  stepUser,
  name,
  url
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  name: string
  url: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.openShotcut({ name, url })
}

export async function userShouldSeeContentInEditor({
  actorsEnvironment,
  stepUser,
  expectedContent,
  editor
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  expectedContent: string
  editor: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  const actualFileContent = await pageObject.getDocumentContent({
    page,
    editor
  })
  expect(actualFileContent.trim()).toBe(expectedContent)
}

export async function resourceShouldBeLocked({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const lockLocator = await resourceObject.getLockLocator({ resource })
  expect(lockLocator).toBeVisible()
}

export async function resourceShouldNotBeLocked({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const lockLocator = await resourceObject.getLockLocator({ resource })

  // can take more than 5 seconds for lock to be released in case of OnlyOffice
  expect(lockLocator).not.toBeVisible({ timeout: config.timeout * 1000 })
}

export async function userNavigatesToFolderViaBreadcrumb({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.openFolderViaBreadcrumb(resource)
}

export async function userEditsFile({
  actorsEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resources: { name: string; content: string; type?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  for (const resource of resources) {
    await resourceObject.editResource({
      name: resource.name,
      type: resource.type,
      content: resource.content
    })
  }
}

export async function userShouldSeeThumbnailAndPreview({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await expect(resourceObject.getFileThumbnailLocator(resource)).toBeVisible()
  await resourceObject.shouldSeeFilePreview({ resource })
}

export async function userOpensMediaUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.previewMediaFromSidebarPanel(resource)
}

export async function userNavigatesMediaResource({
  actorsEnvironment,
  stepUser,
  navigationType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  navigationType: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.navigateMediaFile(navigationType)
}

export async function userRenamesResource({
  actorsEnvironment,
  stepUser,
  resource,
  newResourceName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  newResourceName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.rename({ resource, newName: newResourceName })
}

export async function shouldNotSeeVersionPanelForFiles({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  file,
  to
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  file: string
  to: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const fileInfo = filesEnvironment.getFile({ name: file })
  await resourceObject.checkThatFileVersionPanelIsNotAvailable({
    folder: to,
    files: [fileInfo]
  })
}

export async function userUploadsMultipleFilesInPersonalSpace({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  numberOfFiles
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  numberOfFiles: number
}): Promise<void> {
  const files = []
  for (let i = 0; i < numberOfFiles; i++) {
    const file = `file${i}.txt`
    runtimeFs.createFile(file, 'test content')

    files.push(
      filesEnvironment.getFile({
        name: path.join(runtimeFs.getTempUploadPath().replace(config.assets, ''), file)
      })
    )
  }

  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.uploadLargeNumberOfResources({ resources: files })
}

export async function userTriesToUploadResource({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource,
  error,
  to
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resource: string
  error: string
  to: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.tryToUpload({
    to: to,
    resources: [filesEnvironment.getFile({ name: resource })],
    error: error
  })
}

export async function userUploadsResourceViaDragNDrop({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const resources = [filesEnvironment.getFile({ name: resource })]
  await resourceObject.dropUpload({ resources })
}

export async function userRestoresResourceVersion({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  file,
  to,
  version,
  openDetailsPanel
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  file: string
  to: string
  version: number
  openDetailsPanel: boolean
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  const fileInfo: Record<string, any> = {}
  if (!fileInfo[to]) {
    fileInfo[to] = []
  }

  fileInfo[to].push(filesEnvironment.getFile({ name: file }))

  if (version !== 1) {
    throw new Error('restoring is only supported for the most recent version')
  }
  fileInfo[to]['openDetailsPanel'] = openDetailsPanel

  for (const folder of Object.keys(fileInfo)) {
    await resourceObject.restoreVersion({
      folder,
      files: fileInfo[folder],
      openDetailsPanel: fileInfo[folder]['openDetailsPanel']
    })
  }
}

export async function userStartsUploadingFileFromTheTempUploadDir({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  file,
  to,
  option
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  file: string
  to?: string
  option?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.startUpload({
    to: to,
    resources: [
      filesEnvironment.getFile({
        name: path.join(runtimeFs.getTempUploadPath().replace(config.assets, ''), file)
      })
    ],
    option: option
  })
}

export async function userPausesUpload({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.pauseUpload()
}

export async function userCancelsUpload({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.cancelUpload()
}

export async function userResumesUpload({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.resumeUpload()
}

export async function userDuplicatesResources({
  actorsEnvironment,
  stepUser,
  method,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  method: 'sidebar-panel' | 'dropdown-menu' | 'batch-action'
  resources: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  for (const resource of resources) {
    await resourceObject.duplicate(resource, method)
  }
}

async function performResourceAction({
  actorsEnvironment,
  stepUser,
  actionType,
  method,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: 'copy' | 'move'
  method:
    | 'keyboard'
    | 'drag-drop'
    | 'drag-drop-breadcrumb'
    | 'sidebar-panel'
    | 'dropdown-menu'
    | 'batch-action'
  resources: { resource: string; to: string; option?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  // drag-n-drop always does MOVE
  if (method.includes('drag-drop')) {
    expect(actionType).toBe('move')
  }

  for (const { resource, to, option } of resources) {
    await resourceObject[actionType]({
      resource,
      newLocation: to,
      method,
      option: option ?? undefined
    })
  }
}

export const userCopiesResources = (args) => performResourceAction({ ...args, actionType: 'copy' })

export const userMovesResources = (args) => performResourceAction({ ...args, actionType: 'move' })

export async function userCopiesOrMovesMultipleResources({
  actorsEnvironment,
  stepUser,
  actionType,
  newLocation,
  method,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: string
  newLocation: string
  method: string
  resources: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  // drag-n-drop always does MOVE
  if (method.includes('drag-drop')) {
    expect(actionType).toBe('moves')
  }

  const normalizedResources = [].concat(...resources)
  await resourceObject[actionType === 'copies' ? 'copyMultipleResources' : 'moveMultipleResources'](
    {
      newLocation,
      method,
      resources: normalizedResources
    }
  )
}
