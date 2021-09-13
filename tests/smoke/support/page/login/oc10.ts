import {Actor, User} from '../../types'
/* eslint-disable-next-line */
import type { LoginAdapter } from './index'

export class Oc10LoginAdapter implements LoginAdapter{
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
    await page.click('button[type="submit"]')
  }
}
