import { objects } from '../../../e2e/support'
import { ActorsEnvironment, FilesEnvironment } from '../../../e2e/support/environment'
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

export async function openFolder({
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

export async function renameResource({
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

export async function deleteResource({
  actorsEnvironment,
  stepUser,
  resource,
  from,
  actionType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  from: string
  actionType: 'SIDEBAR_PANEL' | 'BATCH_ACTION'
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  await resourceObject.delete({
    folder: from,
    resourcesWithInfo: [{ name: resource }],
    via: actionType
  })
}

export async function shouldNotSeeVersionPanelForFiles({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resources,
  to
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resources: string[]
  to: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const resourceObject = new objects.applicationFiles.Resource({ page })
  for (const resource of resources) {
    const fileInfo = filesEnvironment.getFile({ name: resource })
    const isVersionPanelVisible = await resourceObject.checkThatFileVersionPanelIsNotAvailable({
      folder: to,
      files: [fileInfo]
    })
  }
}
