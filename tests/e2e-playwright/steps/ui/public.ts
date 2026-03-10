import { objects } from '../../../e2e/support'
import {
  ActorsEnvironment,
  FilesEnvironment,
  LinksEnvironment
} from '../../../e2e/support/environment'
import { editor } from '../../../e2e/support/objects/app-files/utils'
import { substitute } from '../../../e2e/support/utils'
import { expect } from '@playwright/test'

export async function userOpensPublicLink({
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

export async function userCreatesPublicLink({
  actorsEnvironment,
  stepUser,
  resource,
  password,
  role,
  name = 'Unnamed link'
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

export async function userUploadsResourcesInPublicLink({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resources: { name: string; to?: string; option?: string; type?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.upload({
      to: resource.to,
      resources: [filesEnvironment.getFile({ name: resource.name })],
      option: resource.option,
      type: resource.type
    })
  }
}

export async function userDeletesResourcesFromPublicLink({
  actorsEnvironment,
  stepUser,
  actionType = 'SIDEBAR_PANEL',
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  actionType: 'BATCH_ACTION' | 'SIDEBAR_PANEL'
  resources: { resource: string; parentFolder?: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.delete({
      folder: resource.parentFolder ? resource.parentFolder : null,
      resourcesWithInfo: [{ name: resource.resource }],
      via: actionType
    })
  }
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

export async function userTriesToUnlockPasswordProtectedFolderWithPassword({
  actorsEnvironment,
  stepUser,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  password: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  const linkObject = new objects.applicationFiles.Link({ page })
  password = substitute(password)
  await pageObject.authenticate({
    password,
    passwordProtectedFolder: true,
    expectToSucceed: false
  })
  const actualErrorMessage = await linkObject.checkErrorMessage({ passwordProtectedFolder: true })
  expect(actualErrorMessage).toBe('Incorrect password')
}

export async function userUnlocksPasswordProtectedFolderWithPassword({
  actorsEnvironment,
  stepUser,
  password
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  password: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  password = substitute(password)
  await pageObject.authenticate({
    password,
    passwordProtectedFolder: true
  })
}

export async function userDropUploadsResources({
  actorsEnvironment,
  filesEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  filesEnvironment: FilesEnvironment
  stepUser: string
  resources: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.dropUpload({
      resources: [filesEnvironment.getFile({ name: resource })]
    })
  }
}

export async function userRefreshesTheOldLink({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.reload()
}

export async function userShouldNotBeAbleToOpenTheOldLink({
  actorsEnvironment,
  linksEnvironment,
  stepUser,
  linkName
}: {
  actorsEnvironment: ActorsEnvironment
  linksEnvironment: LinksEnvironment
  stepUser: string
  linkName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  const { url } = linksEnvironment.getLink({ name: linkName })
  await pageObject.expectThatLinkIsDeleted({ url })
}

export async function userRenamesPublicLinkResources({
  actorsEnvironment,
  stepUser,
  resources
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resources: { resource: string; newName: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.rename({ resource: resource.resource, newName: resource.newName })
  }
}
