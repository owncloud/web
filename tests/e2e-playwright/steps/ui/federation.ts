import { expect } from '@playwright/test'
import { objects } from '../../support'
import { substitute } from '../../support/utils'
import { World } from '../../environment/world'

export async function userGeneratesInvitationTokenForTheFederationShare({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.scienceMesh.Federation({ page })
  const user = world.usersEnvironment.getUser({ key: stepUser })
  await pageObject.generateInvitation(user.id)
}

export async function userAcceptsFederatedShareInvitationByLocalUser({
  world,
  stepUser,
  sharer
}: {
  world: World
  stepUser: string
  sharer: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.scienceMesh.Federation({ page })
  await pageObject.acceptInvitation(sharer)
}

export async function userShouldSeeTheFederatedConnections({
  world,
  stepUser,
  federation
}: {
  world: World
  stepUser: string
  federation: { user: string; email: string }[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.scienceMesh.Federation({ page })
  for (const fed of federation) {
    fed.user = substitute(fed.user)
    fed.email = substitute(fed.email)
    const isConnectionExist = await pageObject.connectionExists(fed)
    expect(isConnectionExist).toBe(true)
  }
}
