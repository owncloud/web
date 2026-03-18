import { objects } from '../../../e2e/support'
import { expect } from '@playwright/test'
import { World } from '../../support/world'

export async function userRenamesMostRecentlyCreatedPublicLinkOfResource({
  world,
  stepUser,
  resource,
  newName
}: {
  world: World
  stepUser: string
  resource: string
  newName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const linkName = await linkObject.changeName({ resource, newName })
  expect(linkName).toBe(newName)
}

export async function userCopiesTheLinkOfPasswordProtectedFolder({
  world,
  stepUser,
  resource
}: {
  world: World
  stepUser: string
  resource: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.copyLinkToClipboard({
    resource: resource,
    resourceType: 'passwordProtectedFolder'
  })
}

export async function userClosesThePasswordProtectedFolderModal({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.closeFolderModal()
}

export async function userChangesRoleOfThePublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName,
  newRole
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
  newRole: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const roleText = await linkObject.changeRole({ linkName, resource, role: newRole })
  expect(roleText.toLowerCase()).toBe(newRole.toLowerCase())
}

export async function userSetsExpirationDateOfThePublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName,
  expireDate
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
  expireDate: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.addExpiration({ resource, linkName, expireDate })
}

export async function userRemovesThePublicLinkOfResource({
  world,
  stepUser,
  resource,
  linkName
}: {
  world: World
  stepUser: string
  resource: string
  linkName: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  await linkObject.delete({ resourceName: resource, name: linkName })
}
