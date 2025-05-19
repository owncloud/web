import { Page } from '@playwright/test'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironmentFactory } from '../../environment'

export class Session {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  signIn(username: string, password: string): Promise<void> {
    if (config.keycloak) {
      return this.keycloakSignIn(username, password)
    }
    return this.idpSignIn(username, password)
  }

  async idpSignIn(username: string, password: string): Promise<void> {
    await this.#page.locator('//input[@type="text" or @placeholder="Username"]').fill(username)
    await this.#page.locator('//input[@type="password" or @placeholder="Password"]').fill(password)
    await this.#page.locator('button[type="submit"]').click()
  }

  async keycloakSignIn(username: string, password: string): Promise<void> {
    await this.#page.locator('#username').fill(username)
    await this.#page.locator('#password').fill(password)
    await this.#page.locator('#kc-login').click()
  }

  async login(user: User): Promise<void> {
    const { id, password } = user

    const [response] = await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().endsWith('/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      this.signIn(id, password)
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

  async logout(): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    await this.#page.locator('#oc-topbar-account-logout').click()
  }
}
