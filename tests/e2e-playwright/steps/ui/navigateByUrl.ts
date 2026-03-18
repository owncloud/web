import { objects } from '../../../e2e/support'
import { World } from '../../support/world'

export async function userNavigatesToNonExistingPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.navigateToNonExistingPage()
}

export async function userShouldSeeNotFoundPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.waitForNotFoundPageToBeVisible()
}

export async function userOpensResourceViaUrl({
  world,
  stepUser,
  resource,
  space,
  editorName,
  client
}: {
  world: World
  stepUser: string
  resource: string
  space: string
  editorName: 'Collabora' | 'OnlyOffice'
  client: 'mobile' | 'desktop'
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const user = world.usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openResourceViaUrl({ resource, user, space, editorName, client })
}

export async function userOpensSpaceResourceViaUrl({
  world,
  stepUser,
  resource,
  space
}: {
  world: World
  stepUser: string
  resource: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const user = world.usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openResourceViaUrl({ resource, user, space })
}

export async function userOpensResourceDetailsPanelViaUrl({
  world,
  stepUser,
  resource,
  detailsPanel,
  space
}: {
  world: World
  stepUser: string
  resource: string
  detailsPanel: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const user = world.usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.navigateToDetailsPanelOfResource({ resource, detailsPanel, user, space })
}

export async function userOpensSpaceViaUrl({
  world,
  stepUser,
  space
}: {
  world: World
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const user = world.usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openSpaceViaUrl({ user, space })
}
