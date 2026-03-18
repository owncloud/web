import { expect } from '@playwright/test'
import { objects } from '../../../e2e/support'
import { World } from '../../support/world'

export async function userChangesLanguage({
  world,
  stepUser,
  language
}: {
  world: World
  stepUser: string
  language: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  const isAnonymousUser = stepUser === 'Anonymous'
  await accountObject.changeLanguage(language, isAnonymousUser)
}

export async function userShouldSeeAccountPageTitle({
  world,
  stepUser,
  expectedTitle
}: {
  world: World
  stepUser: string
  expectedTitle: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  const actualTitle = await accountObject.getTitle()
  expect(actualTitle).toEqual(expectedTitle)
}

export async function userRequestsGdprExport({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.requestGdprExport()
}

export async function userDownloadsGdprExport({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.downloadGdprExport()
}

export async function userMarksAllNotificationsAsRead({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })
  await application.markNotificationsAsRead()
}

export async function userOpensAccountPage({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.openAccountPage()
}

export async function userDisablesNotificationEvents({
  world,
  stepUser,
  events
}: {
  world: World
  stepUser: string
  events: string[]
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  for (const event of events) {
    await accountObject.disableNotificationEvent(event)
  }
}
