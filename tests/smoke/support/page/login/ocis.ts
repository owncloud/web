import {Actor, User} from '../../types'
/* eslint-disable-next-line */
import type { LoginAdapter } from './index'

export class OcisLoginAdapter implements LoginAdapter{
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async login({ user }: { user: User }): Promise<void> {
    const { page } = this.actor
    const { id, password } = user

    await page.fill('#oc-login-username', id)
    await page.fill('#oc-login-password', password)
    await page.click('button[type="submit"]')
  }
}
