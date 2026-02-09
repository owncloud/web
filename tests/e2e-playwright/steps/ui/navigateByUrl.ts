import { objects } from '../../../e2e/support'
import {
  ActorsEnvironment,
  UsersEnvironment,
  FilesEnvironment
} from '../../../e2e/support/environment'

export async function userNavigatesToNonExistingPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.navigateToNonExistingPage()
}

export async function userShouldSeeNotFoundPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.waitForNotFoundPageToBeVisible()
}

export async function userOpensResourceOfSpaceViaUrl({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const user = usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openResourceViaUrl({ resource, user, space })
}

export async function userNavigatesToDetailsPanelOfResourceViaUrl({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  detailsPanel,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  detailsPanel: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const user = usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.navigateToDetailsPanelOfResource({ resource, detailsPanel, user, space })
}

export async function userOpensSpaceViaUrl({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  space
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  space: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const user = usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openSpaceViaUrl({ user, space })
}
