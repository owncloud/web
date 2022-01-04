import { Actor, User } from '../../types'
import { LoginAdapter } from './login'

export class OcisLoginAdapter implements LoginAdapter {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async login({ user }: { user: User }): Promise<void> {
    const { page } = this.actor
    const { id, password } = user
    console.log('==========================================')
    console.log(id, password)
    console.log('==========================================')

    await page.locator('#oc-login-username').fill(id)
    await page.locator('#oc-login-password').fill(password)
    await page.locator('button[type="submit"]').click()
  }
}
