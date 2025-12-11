import { Page } from '@playwright/test'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironmentFactory } from '../../environment'
import { World } from '../../../cucumber/environment'
import { expect } from '@playwright/test'
import { objects } from '../..'

export class Session {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  signIn(username: string, password: string, world?: World): Promise<void> {
    if (config.keycloak) {
      return this.keycloakSignIn(username, password, world)
    }
    return this.idpSignIn(username, password, world)
  }

  async idpSignIn(username: string, password: string, world?: World): Promise<void> {
    await this.#page.locator('button[type="submit"]').waitFor()
    await objects.a11y.Accessibility.assertNoSevereA11yViolations(
      this.#page,
      ['body'],
      'login page',
      world
    )
    await this.#page.locator('//input[@type="text" or @placeholder="Username"]').fill(username)
    await this.#page.locator('//input[@type="password" or @placeholder="Password"]').fill(password)
    await this.#page.locator('button[type="submit"]').click()
  }

  async keycloakSignIn(username: string, password: string, world?: World): Promise<void> {
    await this.#page.locator('#username').waitFor()
    await objects.a11y.Accessibility.assertNoSevereA11yViolations(
      this.#page,
      ['body'],
      'login page',
      world
    )
    await this.#page.locator('#username').fill(username)
    await this.#page.locator('#password').fill(password)
    await this.#page.locator('#kc-login').click()
  }

  async login(user: User, world?: World): Promise<void> {
    const { id, password } = user

    const [response] = await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().endsWith('/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      this.signIn(id, password, world)
    ])

    if (config.predefinedUsers) {
      const tokenRes = await response.json()
      const tokenEnvironment = TokenEnvironmentFactory()
      tokenEnvironment.setToken({
        user: { ...user },
        token: {
          userId: user.id,
          accessToken: tokenRes.access_token,
          refreshToken: tokenRes.refresh_token
        }
      })
    }
  }

  async logout(world: World): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    if (world !== undefined) {
      const a11yObject = new objects.a11y.Accessibility({ page: this.#page })
      const a11yViolations =
        await a11yObject.getSevereAccessibilityViolations('#account-info-container')
      world.currentStepData = {
        a11yViolations
      }
      expect(a11yViolations).toMatchObject([])
    }
    await this.#page.locator('#oc-topbar-account-logout').click()
  }
}
