import { objects } from '../../../e2e/support'
import { expect } from '@playwright/test'
import { ActorsEnvironment } from '../../../e2e/support/environment'

export async function userRenamesMostRecentlyCreatedPublicLinkOfResource({
  actorsEnvironment,
  stepUser,
  resource,
  newName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  newName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const linkName = await linkObject.changeName({ resource, newName })
  expect(linkName).toBe(newName)
}
export async function userSetsExperationDateOfPublicLink({
  actorsEnvironment,
  stepUser,
  linkName,
  resource,
  expireDate
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  linkName: string
  resource: string
  expireDate: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addExpiration({ resource, linkName, expireDate })
}

export async function userChangesThePasswordOfPublicLink({
  actorsEnvironment,
  stepUser,
  linkName,
  resource,
  newPassword
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  linkName: string
  resource: string
  newPassword: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addPassword({ resource, linkName, newPassword })
}
