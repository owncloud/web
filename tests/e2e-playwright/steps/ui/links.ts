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

export async function userCopiesTheLinkOfPasswordProtectedFolder({
  actorsEnvironment,
  stepUser,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.copyLinkToClipboard({
    resource: resource,
    resourceType: 'passwordProtectedFolder'
  })
}

export async function userClosesThePasswordProtectedFolderModal({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.closeFolderModal()
}

export async function userChangesRoleOfThePublicLinkOfResource({
  actorsEnvironment,
  stepUser,
  resource,
  linkName,
  newRole
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  linkName: string
  newRole: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const roleText = await linkObject.changeRole({ linkName, resource, role: newRole })
  expect(roleText.toLowerCase()).toBe(newRole.toLowerCase())
}

export async function userSetsExpirationDateOfThePublicLinkOfResource({
  actorsEnvironment,
  stepUser,
  resource,
  linkName,
  expireDate
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  linkName: string
  expireDate: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addExpiration({ resource, linkName, expireDate })
}

export async function userRemovesThePublicLinkOfResource({
  actorsEnvironment,
  stepUser,
  resource,
  linkName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  resource: string
  linkName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.delete({ resourceName: resource, name: linkName })
}
