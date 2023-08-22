import { Page } from 'playwright'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironment } from '../../environment'
import { createdTokenStore } from '../../store/token'

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
    await this.#page.locator('#oc-login-username').fill(username)
    await this.#page.locator('#oc-login-password').fill(password)
    await this.#page.locator('button[type="submit"]').click()
  }

  async keycloakSignIn(username: string, password: string): Promise<void> {
    await this.#page.locator('#username').fill(username)
    await this.#page.locator('#password').fill(password)
    await this.#page.locator('#kc-login').click()
  }

  async login({ user }: { user: User }): Promise<void> {
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

    if (config.apiToken) {
      const body = await response.json()

      if (!createdTokenStore.has(user.id)) {
        const tokenEnvironment = new TokenEnvironment()
        tokenEnvironment.createToken({
          user: { ...user },
          token: {
            userId: user.id,
            accessToken: body.access_token,
            refreshToken: body.refresh_token
          }
        })
      }
    }
  }

  async logout(): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    await this.#page.locator('#oc-topbar-account-logout').click()
  }
}
