import { Actor, User } from '../../types'
import { LoginAdapter } from './login'

export class Oc10LoginAdapter implements LoginAdapter {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async login({ user }: { user: User }): Promise<void> {
    const { page } = this.actor
    const { id, password } = user

    await page.locator('input[name="user"]').fill(id)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('#submit').click()

    try {
      // if current client is not trusted we need to allow it,
      // else just catch the playwright TimeoutError and continue
      await page.locator('#body-login button[type="submit"]').first().click({ timeout: 500 })
    } catch (e) {}
  }
}
