import { objects } from '../../support'
import { editor } from '../../support/objects/app-files/utils'
import { substitute } from '../../support/utils'
import { expect } from '@playwright/test'
import { World } from '../../environment/world'
import { fileAction, application } from '../../environment/constants'

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
  password,
  stepUser
}: {
  world: World
  password: string
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.applicationFiles.page.Public({ page })
  if (password === '%copied_password%') {
    // Use world-specific stored password instead of clipboard (parallel safety)
    password = world.linksEnvironment.copiedPassword
  } else {
    password = substitute(password)
  }
  await pageObject.authenticate({ password })
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
  actionType = fileAction.sideBarPanel,
  resources
}: {
  world: World
  stepUser: string
  actionType: typeof fileAction.sideBarPanel | typeof fileAction.batchAction
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

export async function userShouldBeInFileViewer({
  world,
  stepUser,
  fileViewerType
}: {
  world: World
  stepUser: string
  fileViewerType:
    | typeof application.mediaViewer
    | typeof application.pdfViewer
    | typeof application.textEditor
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
