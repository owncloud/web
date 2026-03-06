import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { objects } from '../../../e2e/support'
import { substitute } from '../../../e2e/support/utils'
import { expect } from '@playwright/test'

export async function userGeneratesInvitationTokenForTheFederationShare({
  actorsEnvironment,
  usersEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  usersEnvironment: UsersEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.scienceMesh.Federation({ page })
  const user = usersEnvironment.getUser({ key: stepUser })
  await pageObject.generateInvitation(user.id)
}

export async function userAcceptsFederatedShareInvitationByLocalUser({
  actorsEnvironment,
  stepUser,
  sharer
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  sharer: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.scienceMesh.Federation({ page })
  await pageObject.acceptInvitation(sharer)
}

export async function userShouldSeeTheFederatedConnections({
  actorsEnvironment,
  stepUser,
  federation
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  federation: { user: string; email: string }[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const pageObject = new objects.scienceMesh.Federation({ page })
  for (const fed of federation) {
    fed.user = substitute(fed.user)
    fed.email = substitute(fed.email)
    const isConnectionExist = await pageObject.connectionExists(fed)
    expect(isConnectionExist).toBe(true)
  }
}
