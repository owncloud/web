import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { objects } from '../../../e2e/support'

export async function openApplication({
  actorsEnvironment,
  stepUser,
  name
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.open({ name })
}

export async function getNotificationMessages({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<string[]> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })
  return await application.getNotificationMessages()
}

export async function waitsForTokenRenewal({
  actorsEnvironment,
  stepUser,
  renewalType
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  renewalType: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })

  if (renewalType === 'iframe') {
    return await application.waitForTokenRenewalViaIframe()
  }
  return await application.waitForTokenRenewalViaRefreshToken()
}
