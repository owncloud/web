import { objects } from '../../../e2e/support'
import { expect } from '@playwright/test'
import { ActorsEnvironment } from '../../../e2e/support/environment'

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
export async function userEditsMostRecentlyCreatedPublicLinkSpace({
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