import { Given, When, Then } from '@cucumber/cucumber'
import { World } from '../../environment'
import { config } from '../../../config'
import { DateTime } from 'luxon'
import { kebabCase } from 'lodash'
import { objects } from '../../../support'

async function createNewSession(world: World, stepUser: string) {
  const { page } = await world.actorsEnvironment.createActor({
    key: stepUser,
    namespace: kebabCase(
      [world.feature.name, stepUser, DateTime.now().toFormat('yyyy-M-d-hh-mm-ss')].join('-')
    )
  })
  return new objects.runtime.Session({ page })
}

async function LogInUser(this: World, stepUser: string): Promise<void> {
  const sessionObject = await createNewSession(this, stepUser)
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })

  const user =
    stepUser === 'Admin'
      ? this.usersEnvironment.getUser({ key: stepUser })
      : this.usersEnvironment.getCreatedUser({ key: stepUser })

  await page.goto(config.frontendUrl)
  await sessionObject.login({ user })
  await page.waitForSelector('#web')
}

Given('{string} has logged in', LogInUser)

When('{string} logs in', LogInUser)

async function LogOutUser(this: World, stepUser: string): Promise<void> {
  const actor = await this.actorsEnvironment.getActor({ key: stepUser })
  const canLogout = !!(await actor.page.locator('#_userMenuButton').count())

  const sessionObject = new objects.runtime.Session({ page: actor.page })
  canLogout && (await sessionObject.logout())
  await actor.close()
}

Given('{string} has logged out', LogOutUser)

When('{string} logs out', LogOutUser)

Then('{string} fails to log in', async function (this: World, stepUser: string): Promise<void> {
  const sessionObject = await createNewSession(this, stepUser)
  const { page } = this.actorsEnvironment.getActor({ key: stepUser })
  const user = this.usersEnvironment.getUser({ key: stepUser })
  await page.goto(config.frontendUrl)
  await sessionObject.login({ user })
  await page.waitForSelector('#oc-login-error-message')
})

When(
  '{string} logs in from the internal link',
  async function (this: World, stepUser: string): Promise<void> {
    const sessionObject = await createNewSession(this, stepUser)
    const { page } = this.actorsEnvironment.getActor({ key: stepUser })
    const user = this.usersEnvironment.getUser({ key: stepUser })
    await sessionObject.login({ user })
    await page.waitForSelector('#web')
  }
)
