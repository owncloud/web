import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import {
  ActorsEnvironment,
  FilesEnvironment,
  SpacesEnvironment
} from '../../../e2e/support/environment'
import {
  createResourceTypes,
  displayedResourceType,
  searchFilter
} from '../../../e2e/support/objects/app-files/resource/actions'

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

export async function resourceExists({
  actorsEnvironment,
  listType,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  listType: 'search list' | 'files list' | 'Shares' | 'trashbin'
  stepUser: string
  resource: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  const actualList = await resourceObject.getDisplayedResources({
    keyword: listType as displayedResourceType
  })
  return actualList.includes(resource)
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
