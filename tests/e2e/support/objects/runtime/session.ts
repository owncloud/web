import { Page } from 'playwright'
import { User } from '../../types'
import { config } from '../../../config'
import { TokenEnvironment } from '../../environment'
import { createdTokenStore } from '../../store/token'

interface LoginAdapter {
  login({ user }: { user: User }): Promise<void>
}

class Ocis implements LoginAdapter {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async login({ user }: { user: User }): Promise<void> {
    const { id, password } = user

    await this.#page.locator('#oc-login-username').fill(id)
    await this.#page.locator('#oc-login-password').fill(password)
    await this.#page.locator('button[type="submit"]').click()
  }
}

class Classic implements LoginAdapter {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async login({ user }: { user: User }): Promise<void> {
    const { id, password } = user

    await this.#page.locator('input[name="user"]').fill(id)
    await this.#page.locator('input[name="password"]').fill(password)
    await this.#page.locator('#submit').click()

    try {
      // if current client is not trusted we need to allow it,
      // else just catch the playwright TimeoutError and continue
      await this.#page.locator('#body-login button[type="submit"]').first().click({ timeout: 500 })
    } catch (e) {}
  }
}

export class Session {
  #page: Page
  #adapter: LoginAdapter

  constructor({ page }: { page: Page }) {
    this.#page = page
    this.#adapter = config.ocis ? new Ocis({ page }) : new Classic({ page })
  }

  async login({ user }: { user: User }): Promise<void> {
    const [response] = await Promise.all([
      this.#page.waitForResponse(
        (resp) =>
          resp.url().includes('v1/token') &&
          resp.status() === 200 &&
          resp.request().method() === 'POST'
      ),
      this.#adapter.login({ user })
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
