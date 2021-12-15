import { Actor, User } from '../../types'
/* eslint-disable-next-line */
import type {LoginAdapter} from './index'

// Touch some files in the smoke tests to demonstrate 6153
export class Oc10LoginAdapter implements LoginAdapter {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async login({ user }: { user: User }): Promise<void> {
    const { page } = this.actor
    const { id, password } = user

    await page.fill('input[name="user"]', id)
    await page.fill('input[name="password"]', password)
    await page.click('#submit')

    try {
      // if current client is not trusted we need to allow it,
      // else just catch the playwright TimeoutError and continue
      await page.locator('#body-login button[type="submit"]').first().click({ timeout: 500 })
    } catch (e) {}
  }
}
