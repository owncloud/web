import { ActorsEnvironment } from '../../../e2e/support/environment/index.js'
import { objects } from '../../../e2e/support'
import { config } from '../../../e2e/config'

export async function userOpensApplication({
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

export async function userOpensClipboardUrl({
  actorsEnvironment,
  stepUser,
  url
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  url: string
}): Promise<void> {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(stepUser, stepUser)
  })

  const applicationObject = new objects.runtime.Application({ page })
  // This is required as reading from clipboard is only possible when the browser is opened.
  await applicationObject.openUrl(config.baseUrl)
  url = url === '%clipboard%' ? await page.evaluate('navigator.clipboard.readText()') : url
  await applicationObject.openUrl(url)
}
