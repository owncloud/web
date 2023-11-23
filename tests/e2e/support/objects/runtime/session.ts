import { Page } from '@playwright/test'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironment } from '../../environment'
import { createdTokenStore } from '../../store/token'

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
          resp.url().includes('v1/token') &&
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
}
