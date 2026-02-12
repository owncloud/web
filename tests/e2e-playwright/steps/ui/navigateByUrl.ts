import { objects } from '../../../e2e/support'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'

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

export async function userOpensResourceViaUrl({
  actorsEnvironment,
  usersEnvironment,
  stepUser,
  resource,
  space,
  editorName,
  client
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
  resource: string
  space: string
  editorName: 'Collabora' | 'OnlyOffice'
  client: 'mobile' | 'desktop'
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const user = usersEnvironment.getUser({ key: stepUser })
  const urlNavObject = new objects.urlNavigation.URLNavigation({ page })
  await urlNavObject.openResourceViaUrl({ resource, user, space, editorName, client })
}
