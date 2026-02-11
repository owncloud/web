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

export async function uploadResource({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource,
  to,
  type,
  option
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resource: string
  to: string
  type?: string
  option?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.upload({
    to: to,
    resources: [filesEnvironment.getFile({ name: resource })],
    option: option,
    type: type
  })
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

export async function createResource({
  actorsEnvironment,
  stepUser,
  resource,
  type,
  content,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  type: string
  content?: string
  password?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.create({
    name: resource,
    type: type as createResourceTypes,
    content: content,
    password: password
  })
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

export async function openResource({
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

export async function userClosesTextEditor({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  await editor.close(page)
}

export async function deleteResource({
  actorsEnvironment,
  stepUser,
  file,
  actionType,
  parentFolder = ''
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  file: string
  actionType: string
  parentFolder?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.Resource({ page })
  await pageObject.delete({
    folder: parentFolder === '' ? null : parentFolder,
    resourcesWithInfo: [{ name: file }],
    via: actionType === 'batch action' ? 'BATCH_ACTION' : 'SIDEBAR_PANEL'
  })
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
export async function userCreatesShortcutForResource({
  actorsEnvironment,
  stepUser,
  resource,
  name,
  type
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  name: string
  type: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  await resourceObject.createShotcut({
    resource: resource,
    name: name,
    type: type as shortcutType
  })
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
  expect(await lockLocator.isVisible()).toBe(true)
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
  expect(await lockLocator.isVisible()).toBe(false)
}

export async function userAddsFollowingTags({
  actorsEnvironment,
  stepUser,
  resource,
  tags
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  tags: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.addTags({
    resource,
    tags
  })
}

export async function resourceShouldContainTagsInFileList({
  actorsEnvironment,
  stepUser,
  resource,
  tags
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  tags: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const isVisible = await resourceObject.areTagsVisibleForResourceInFilesTable({
    resource,
    tags
  })
  expect(isVisible).toBe(true)
}
export async function resourceShouldContainTagsInDetailList({
  actorsEnvironment,
  stepUser,
  resource,
  tags
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  tags: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const isVisible = await resourceObject.areTagsVisibleForResourceInDetailsPanel({
    resource,
    tags
  })
  expect(isVisible).toBe(true)
}
export async function userRemovesTagsFromResourcesUsingSideBar({
  actorsEnvironment,
  stepUser,
  resource,
  tags
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  tags: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  await resourceObject.removeTags({
    resource,
    tags
  })
}
export async function userTriesToAddTagUsingSidebarPanel({
  actorsEnvironment,
  stepUser,
  resource,
  tags
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  tags: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })

  await resourceObject.tryToAddTags({
    resource,
    tags
  })
}

export async function userShouldSeeFollowingTagValidationMessages({
  actorsEnvironment,
  stepUser,
  message
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  message: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const actualMessage = await resourceObject.getTagValidationMessage()
  expect(actualMessage).toBe(message)
}
export async function userClicksTag({
  actorsEnvironment,
  stepUser,
  resource,
  tag
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  tag: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.clickTag({ resource, tag })
}
