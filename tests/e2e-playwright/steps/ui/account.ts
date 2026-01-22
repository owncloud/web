import { objects } from '../../../e2e/support'
import { ActorsEnvironment } from '../../../e2e/support/environment'

export async function openAccountPage({
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

export async function changeLanguage({
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

export async function requestGdprExport({
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

export async function downloadGdprExport({
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

export async function disableNotificationEvent({
  actorsEnvironment,
  stepUser,
  event
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  event: string
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  await accountObject.disableNotificationEvent(event)
}

export async function userHasQuota({
  actorsEnvironment,
  stepUser,
  quota
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  quota: string
}): Promise<boolean> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const accountObject = new objects.account.Account({ page })
  const actualQuota = await accountObject.getQuotaValue()
  return actualQuota === quota
}

export async function changeQuotaForUsersUsingBatchAction({
  actorsEnvironment,
  stepUser,
  value,
  users
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
  value: string
  users: string[]
}): Promise<void> {
  const { page } = actorsEnvironment.getActor({ key: stepUser })
  const usersObject = new objects.applicationAdminSettings.Users({ page })

  for (const user of users) {
    await usersObject.selectUser({ key: user })
  }

  await usersObject.changeQuotaUsingBatchAction({ value, users })
}
