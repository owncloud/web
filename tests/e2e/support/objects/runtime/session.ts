import { Page } from 'playwright'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironment } from '../../environment'
import { createdKeycloakAccessTokenStore, createdTokenStore } from '../../store/token'
import { createdKeycloakRefreshTokenStore } from '../../store/token'

export class Session {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async login({ user }: { user: User }): Promise<void> {
    const { id, password } = user

    await this.#page.locator('#oc-login-username').fill(id)
    await this.#page.locator('#oc-login-password').fill(password)
    const [response] = await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().endsWith('/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      this.#page.locator('button[type="submit"]').click()
    ])

    if (config.apiToken) {
      const body = await response.json()

      if (!createdTokenStore.has(user.id)) {
        const tokenEnvironment = new TokenEnvironment()
        tokenEnvironment.createToken({
          user: { ...user },
          token: { userId: user.id, tokenValue: body.access_token }
        })
      }
    }
  }

  async logout(): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    await this.#page.locator('#oc-topbar-account-logout').click()
  }

  async loginInAdminConsole(): Promise<void> {
    await this.#page.locator('#username').fill('admin')
    await this.#page
      .locator('#password')
      .fill(process.env.KEYCLOAK_ADMIN_CONSOLE_PASSWORD || 'admin')

    const [response] = await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().includes('token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      this.#page.locator('#kc-login').click()
    ])
    const body = await response.json()

    createdKeycloakAccessTokenStore.set('keycloakAdmin', body.access_token)
    createdKeycloakRefreshTokenStore.set('keycloakAdmin', body.refresh_token)
  }
}
