import { Page } from 'playwright'
import { User } from '../../types'
import { config } from '../../../config'

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
    await this.#adapter.login({ user })
    await this.#page.waitForSelector('#web')
  }

  async logout(): Promise<void> {
    await this.#page.locator('#_userMenuButton').click()
    await this.#page.locator('#oc-topbar-account-logout').click()
  }
}
