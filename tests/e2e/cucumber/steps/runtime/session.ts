import { Given, When } from '@cucumber/cucumber'
import { World } from '../../environment'
import { config } from '../../../config'
import { DateTime } from 'luxon'
import { kebabCase } from 'lodash'
import { objects } from '../../../support'

async function LogInUser(this: World, stepUser: string): Promise<void> {
  const user = this.usersEnvironment.getUser({ id: stepUser })
  const { page } = await this.actorsEnvironment.createActor({
    id: stepUser,
    namespace: kebabCase(
      [this.feature.name, stepUser, DateTime.now().toFormat('yyyy-M-d-hh-mm-ss')].join('-')
    )
  })
  const sessionObject = new objects.runtime.Session({ page })

  await page.goto(config.frontendUrl)
  await sessionObject.login({ user })
}

Given('{string} has logged in', LogInUser)

When('{string} logs in', LogInUser)

async function LogOutUser(this: World, stepUser: string): Promise<void> {
  const actor = await this.actorsEnvironment.getActor({ id: stepUser })
  const canLogout = !!(await actor.page.locator('#_userMenuButton').count())

  const sessionObject = new objects.runtime.Session({ page: actor.page })
  canLogout && (await sessionObject.logout())
  await actor.close()
}

Given('{string} has logged out', LogOutUser)

When('{string} logs out', LogOutUser)
