import { objects } from '../../../e2e/support'
import { ActorsEnvironment } from '../../../e2e/support/environment'

export async function userChangesLanguage({
  actorsEnvironment,
  stepUser,
  language
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  language: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  const isAnonymousUser = stepUser === 'Anonymous'
  await accountObject.changeLanguage(language, isAnonymousUser)
}

export async function getAccountPageTitle({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<string> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  return await accountObject.getTitle()
}

export async function userRequestsGdprExport({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.requestGdprExport()
}

export async function userDownloadsGdprExport({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment
  stepUser
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.downloadGdprExport()
}

export async function userMarksNotificationsAsRead({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const application = new objects.runtime.Application({ page })
  await application.markNotificationsAsRead()
}

export async function userOpensAccountPage({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.openAccountPage()
}

export async function userDisablesNotificationEvents({
  actorsEnvironment,
  stepUser,
  events
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  events: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  for (const event of events) {
    await accountObject.disableNotificationEvent(event)
  }
}
