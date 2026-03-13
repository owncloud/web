import { objects } from '../../../e2e/support'
import { expect } from '@playwright/test'
import { ActorsEnvironment } from '../../../e2e/support/environment'
import { substitute } from '../../../e2e/support/utils'

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

export async function userCreatesPublicLinkOfSpaceWithPassword({
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

export async function userRenamesTheMostRecentlyCreatedPublicLinkOfSpace({
  actorsEnvironment,
  stepUser,
  newName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  newName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const linkName = await linkObject.changeName({ newName, space: true })
  expect(linkName).toBe(newName)
}

export async function userEditsThePublicLinkOfSpaceChangingRole({
  actorsEnvironment,
  stepUser,
  linkName,
  role
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  linkName: string
  role: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const newPermission = await linkObject.changeRole({ linkName, role, space: true })
  expect(newPermission.toLowerCase()).toBe(role.toLowerCase())
}
