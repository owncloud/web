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
