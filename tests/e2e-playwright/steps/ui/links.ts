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
