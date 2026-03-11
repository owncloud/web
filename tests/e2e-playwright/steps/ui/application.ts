import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { config } from '../../../e2e/config'
import { World } from '../../support/world'
import { substitute } from '../../../e2e/support/utils'

export async function userOpensApplication({
  world,
  stepUser,
  name
}: {
  world: World
  stepUser: string
  name: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const applicationObject = new objects.runtime.Application({ page })
  await applicationObject.open({ name })
}

export async function userShouldSeeNotifications({
  world,
  stepUser,
  expectedMessages
}: {
  world: World
  stepUser: string
  expectedMessages: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })
  const messages = await application.getNotificationMessages()
  for (const message of expectedMessages) {
    expect(messages).toContain(substitute(message))
  }
}

export async function userShouldSeeNoNotifications({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })
  const messages = await application.getNotificationMessages()
  expect(messages).toHaveLength(0)
}

export async function userWaitsForTokenRenewal({
  world,
  stepUser,
  renewalType
}: {
  world: World
  stepUser: string
  renewalType: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })

  if (renewalType === 'iframe') {
    return await application.waitForTokenRenewalViaIframe()
  }
  return await application.waitForTokenRenewalViaRefreshToken()
}

export async function userOpensClipboardUrl({
  world,
  stepUser,
  url
}: {
  world: World
  stepUser: string
  url: string
}): Promise<void> {
  const { page } = await world.actorsEnvironment.createActor({
    key: stepUser,
    namespace: world.actorsEnvironment.generateNamespace(stepUser, stepUser)
  })

  const applicationObject = new objects.runtime.Application({ page })
  // This is required as reading from clipboard is only possible when the browser is opened.
  await applicationObject.openUrl(config.baseUrl)
  url = url === '%clipboard%' ? await page.evaluate('navigator.clipboard.readText()') : url
  await applicationObject.openUrl(url)
}
