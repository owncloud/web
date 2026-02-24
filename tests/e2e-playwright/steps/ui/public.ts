import { objects } from '../../../e2e/support'
import {
  ActorsEnvironment,
  FilesEnvironment,
  LinksEnvironment
} from '../../../e2e/support/environment'
import { editor } from '../../../e2e/support/objects/app-files/utils'
import { substitute } from '../../../e2e/support/utils'
import { expect } from '@playwright/test'
import { processDownload, ResourceToDownload } from './resources'
import { ActionViaType } from '../../../e2e/support/objects/app-files/resource/actions'

export async function openPublicLink({
  actorsEnvironment,
  linksEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  linksEnvironment: LinksEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(stepUser, stepUser)
  })

  const { url } = linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}

export async function createPublicLink({
  actorsEnvironment,
  stepUser,
  resource,
  password,
  name = 'Unnamed link',
  role
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  password: string
  role?: string
  name?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const publicObject = new objects.applicationFiles.Link({ page })
  await publicObject.create({ resource, password: substitute(password), role, name })
}

export async function createPublicLinkOfSpace({
  actorsEnvironment,
  stepUser,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  password: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const spaceObject = new objects.applicationFiles.Spaces({ page })
  password = substitute(password)
  await spaceObject.createPublicLink({ password })
}

export async function anonymousUserOpensPublicLink({
  actorsEnvironment,
  linksEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  linksEnvironment: LinksEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(`${stepUser} user language change`, 'Anonymous')
  })

  const { url } = linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}

export async function userUnlocksPublicLink({
  actorsEnvironment,
  stepUser,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  password: string
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.authenticate({ password: substitute(password) })
}

export async function uploadResourceInPublicLink({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource,
  to,
  option,
  type
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resource: string
  to?: string
  option?: string
  type?: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.upload({
    to: to,
    resources: [filesEnvironment.getFile({ name: resource })],
    option: option,
    type: type
  })
}

export async function deleteResourceFromPublicLink({
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
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.delete({
    folder: parentFolder === '' ? null : parentFolder,
    resourcesWithInfo: [{ name: file }],
    via: actionType === 'batch action' ? 'BATCH_ACTION' : 'SIDEBAR_PANEL'
  })
}

export async function userIsInFileViewer({
  actorsEnvironment,
  stepUser,
  fileViewerType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  fileViewerType: 'text-editor' | 'pdf-viewer' | 'media-viewer'
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const fileViewerLocator = editor.fileViewerLocator({ page, fileViewerType })
  await expect(fileViewerLocator).toBeVisible()
}

export async function userDownloadsPublicLinkResource({
  actorsEnvironment,
  stepUser,
  resourceToDownload,
  actionType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resourceToDownload: ResourceToDownload[]
  actionType: ActionViaType
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await processDownload(pageObject, actionType, resourceToDownload)
}

export async function userUploadsResourceInPublicLink({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resource,
  to,
  option,
  type
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  to: string
  resource: string
  option: string
  type: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.upload({
    to: to,
    resources: [filesEnvironment.getFile({ name: resource })],
    option: option,
    type: type
  })
}

export async function userRenamesResourceOfPublicLink({
  actorsEnvironment,
  stepUser,
  resource,
  newName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  newName: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.rename({ resource, newName })
}
