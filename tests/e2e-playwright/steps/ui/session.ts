import { config } from '../../../e2e/config.js'
import { api, objects } from '../../../e2e/support'
import { ActorsEnvironment, UsersEnvironment } from '../../../e2e/support/environment'
import { User } from '../../../e2e/support/types'
import { listenSSE } from '../../../e2e/support/environment/sse.js'
import { test } from '@playwright/test'

async function createNewSession(actorsEnvironment: ActorsEnvironment, stepUser: string) {
  const { page } = await actorsEnvironment.createActor({
    key: stepUser,
    namespace: actorsEnvironment.generateNamespace(stepUser, stepUser)
  })
  return new objects.runtime.Session({ page })
}

async function initUserStates(userKey: string, user: User, usersEnvironment: UsersEnvironment) {
  const userInfo = await api.graph.getMeInfo(user)
  usersEnvironment.storeCreatedUser(userKey, {
    ...user,
    uuid: userInfo.id,
    email: userInfo.mail
  })
  usersEnvironment.saveUserState(userKey, {
    language: userInfo.preferredLanguage,
    autoAcceptShare: await api.settings.getAutoAcceptSharesValue(user)
  })
}

export async function logInUser({
  usersEnvironment,
  actorsEnvironment,
  stepUser
}: {
  usersEnvironment: UsersEnvironment
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const sessionObject = await createNewSession(actorsEnvironment, stepUser)
  const { page } = actorsEnvironment.getActor({ key: stepUser })

  let user = null
  if (stepUser === 'Admin' || config.predefinedUsers) {
    user = usersEnvironment.getUser({ key: stepUser })
  } else {
    user = usersEnvironment.getCreatedUser({ key: stepUser })
  }

  await page.goto(config.baseUrl)
  await sessionObject.login(user)

  if (test.info().tags.length > 0) {
    // listen to SSE events when running scenarios with '@sse' tag
    if (test.info().tags.includes('@sse')) {
      void listenSSE(config.baseUrl, user)
    }
  }

  await page.locator('#web-content').waitFor()

  // initialize user states: uuid, language, auto-sync
  if (config.predefinedUsers) {
    await initUserStates(stepUser, user, usersEnvironment)
    // test should run with English language
    await api.settings.changeLanguage({ user, language: 'en' })
    await page.reload({ waitUntil: 'load' })
  }
}

export async function logOutUser({
  actorsEnvironment,
  stepUser
}: {
  actorsEnvironment: ActorsEnvironment
  stepUser: string
}): Promise<void> {
  const actor = actorsEnvironment.getActor({ key: stepUser })
  const canLogout = !!(await actor.page.locator('#_userMenuButton').count())

  const sessionObject = new objects.runtime.Session({ page: actor.page })
  canLogout && (await sessionObject.logout())
  await actor.close()
}
