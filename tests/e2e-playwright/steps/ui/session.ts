import { config } from '../../config.js'
import { api, objects } from '../../support'
import { User } from '../../support/types'
import { listenSSE } from '../../support/environment/sse.js'
import { test, expect } from '@playwright/test'
import { waitForSSEEvent } from '../../support/utils/locator.js'
import { World } from '../../environment/world'
import { Jimp } from 'jimp'
import { getOtpFromImage } from '../../support/utils/mfa.js'

async function createNewSession(world: World, stepUser: string) {
  const { page } = await world.actorsEnvironment.createActor({
    key: stepUser,
    namespace: world.actorsEnvironment.generateNamespace(stepUser, stepUser)
  })
  return new objects.runtime.Session({ page })
}

async function initUserStates(userKey: string, user: User, world: World) {
  const userInfo = await api.graph.getMeInfo(user)
  world.usersEnvironment.storeCreatedUser(userKey, {
    ...user,
    uuid: userInfo.id,
    email: userInfo.mail
  })
  world.usersEnvironment.saveUserState(userKey, {
    language: userInfo.preferredLanguage,
    autoAcceptShare: await api.settings.getAutoAcceptSharesValue(user)
  })
}

export async function userLogsIn({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const sessionObject = await createNewSession(world, stepUser)
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })

  let user = null
  if (stepUser === 'Admin' || config.predefinedUsers) {
    user = world.usersEnvironment.getUser({ key: stepUser })
  } else {
    user = world.usersEnvironment.getCreatedUser({ key: stepUser })
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
    await initUserStates(stepUser, user, world)
    // test should run with English language
    await api.settings.changeLanguage({ user, language: 'en' })
    await page.reload({ waitUntil: 'load' })
  }
}

export async function logInWithOTP({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const sessionObject = await createNewSession(world, stepUser)
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })

  const image = await Jimp.read('./qr.png')
  const { data, width, height } = image.bitmap
  const errorLocator = page.locator('#input-error-otp')
  for (let attempt = 0; attempt < 2; attempt++) {
    const otp = await getOtpFromImage(data, width, height)
    await sessionObject.keycloakOTPSignIn(String(otp))
    await page.waitForTimeout(1000)
    if (!(await errorLocator.isVisible())) {
      break
    } else {
      await page.waitForTimeout(config.tokenTimeout * 1000)
    }
  }
}

export async function userLogsOut({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const actor = world.actorsEnvironment.getActor({ key: stepUser })
  const canLogout = !!(await actor.page.locator('#_userMenuButton').count())

  const sessionObject = new objects.runtime.Session({ page: actor.page })
  canLogout && (await sessionObject.logout())
  await actor.close()
}

export async function userShouldGetSSEEvent({
  world,
  stepUser,
  event
}: {
  world: World
  stepUser: string
  event: string
}): Promise<void> {
  const user = world.usersEnvironment.getCreatedUser({ key: stepUser })
  await waitForSSEEvent(user, event)
}

export async function userClosesTheCurrentTab({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const actor = world.actorsEnvironment.getActor({ key: stepUser })
  await actor.closeCurrentTab()
}

export async function userNavigatesToNewTab({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const actor = world.actorsEnvironment.getActor({ key: stepUser })
  await actor.newTab()
}

export async function userWaitsForTokenToExpire({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  // wait for the token to expire
  await page.waitForTimeout(config.tokenTimeout * 1000)
}

export async function useServer({ server }: { server: 'LOCAL' | 'FEDERATED' }): Promise<void> {
  config.federatedServer = server === 'FEDERATED'
}

export async function userFailsToLogin({
  world,
  stepUser
}: {
  world: World
  stepUser: string
}): Promise<void> {
  const sessionObject = await createNewSession(world, stepUser)
  const { page } = world.actorsEnvironment.getActor({ key: stepUser })
  const user = world.usersEnvironment.getUser({ key: stepUser })

  await page.goto(config.baseUrl)
  await sessionObject.signIn(user.id, user.password)
  expect(page.locator('#oc-login-error-message')).toBeVisible({ timeout: config.timeout })
  await objects.a11y.Accessibility.assertNoSevereA11yViolations(
    page,
    ['loginErrorMessageLocator'],
    'login error message'
  )
}
