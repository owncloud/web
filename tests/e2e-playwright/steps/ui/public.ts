import { objects } from '../../../e2e/support'
import { editor } from '../../../e2e/support/objects/app-files/utils'
import { substitute } from '../../../e2e/support/utils'
import { expect } from '@playwright/test'
import { World } from '../../support/world'

export async function userOpensPublicLink({
  world,
  stepUser,
  name
}: {
  world: World
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await world.actorsEnvironment.createActor({
    key: stepUser,
    namespace: world.actorsEnvironment.generateNamespace(stepUser, stepUser)
  })

  const { url } = world.linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}

export async function userCreatesPublicLink({
  world,
  stepUser,
  resource,
  password,
  role,
  name = 'Unnamed link'
}: {
  world: World
  stepUser: string
  resource: string
  password: string
  role?: string
  name?: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const publicObject = new objects.applicationFiles.Link({ page })
  await publicObject.create({ resource, password: substitute(password), role, name })
}

export async function anonymousUserOpensPublicLink({
  world,
  stepUser,
  name
}: {
  world: World
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = await world.actorsEnvironment.createActor({
    key: stepUser,
    namespace: world.actorsEnvironment.generateNamespace(
      `${stepUser} user language change`,
      'Anonymous'
    )
  })

  const { url } = world.linksEnvironment.getLink({ name })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.open({ url })
}

export async function userUnlocksPublicLink({
  world,
  stepUser,
  password
}: {
  world: World
  password: string
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.authenticate({ password: substitute(password) })
}

export async function userUploadsResourcesInPublicLink({
  world,
  stepUser,
  resources
}: {
  world: World
  stepUser: string
  resources: { name: string; to?: string; option?: string; type?: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.upload({
      to: resource.to,
      resources: [world.filesEnvironment.getFile({ name: resource.name })],
      option: resource.option,
      type: resource.type
    })
  }
}

export async function userDeletesResourcesFromPublicLink({
  world,
  stepUser,
  actionType = 'SIDEBAR_PANEL',
  resources
}: {
  world: World
  stepUser: string
  actionType: 'BATCH_ACTION' | 'SIDEBAR_PANEL'
  resources: { resource: string; parentFolder?: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
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
  world,
  stepUser,
  fileViewerType
}: {
  world: World
  stepUser: string
  fileViewerType: 'text-editor' | 'pdf-viewer' | 'media-viewer'
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const fileViewerLocator = editor.fileViewerLocator({ page, fileViewerType })
  await expect(fileViewerLocator).toBeVisible()
}

export async function userTriesToUnlockPasswordProtectedFolderWithPassword({
  world,
  stepUser,
  password
}: {
  world: World
  stepUser: string
  password: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
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
  world,
  stepUser,
  password
}: {
  world: World
  stepUser: string
  password: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  password = substitute(password)
  await pageObject.authenticate({
    password,
    passwordProtectedFolder: true
  })
}

export async function userDropUploadsResources({
  world,
  stepUser,
  resources
}: {
  world: World
  stepUser: string
  resources: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.dropUpload({
      resources: [world.filesEnvironment.getFile({ name: resource })]
    })
  }
}

export async function userRefreshesTheOldLink({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  await pageObject.reload()
}

export async function userShouldNotBeAbleToOpenTheOldLink({
  world,
  stepUser,
  linkName
}: {
  world: World
  stepUser: string
  linkName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  const { url } = world.linksEnvironment.getLink({ name: linkName })
  await pageObject.expectThatLinkIsDeleted({ url })
}

export async function userRenamesPublicLinkResources({
  world,
  stepUser,
  resources
}: {
  world: World
  stepUser: string
  resources: { resource: string; newName: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  for (const resource of resources) {
    await pageObject.rename({ resource: resource.resource, newName: resource.newName })
  }
}
