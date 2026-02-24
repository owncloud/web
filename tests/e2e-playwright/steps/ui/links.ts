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

export async function userRenamesMostRecentlyCreatedPublicLinkSpace({
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
export async function userEditsPublicLinkOfSpace({
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

export async function userEditsPublicLinkOfResource({
  actorsEnvironment,
  stepUser,
  linkName,
  role,
  resource
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  linkName: string
  role: string
  resource: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const roleText = await linkObject.changeRole({ linkName, resource, role })
  expect(roleText.toLowerCase()).toBe(role.toLowerCase())
}

export async function userShouldNotBeAbleToEditPublicLink({
  actorsEnvironment,
  stepUser,
  linkName
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  linkName: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const linkObject = new objects.applicationFiles.Link({ page })
  const isVisible = await linkObject.islinkEditButtonVisibile(linkName)
  expect(isVisible).toBe(false)
}
