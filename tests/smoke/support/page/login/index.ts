import { config } from '../../config'
import { Oc10LoginAdapter } from './oc10'
import { OcisLoginAdapter } from './ocis'
import { Actor, User } from '../../types'
import { LoginAdapter } from './login'

export class LoginPage {
  private readonly actor: Actor
  private readonly adapter: LoginAdapter

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
    this.adapter = config.ocis ? new OcisLoginAdapter({ actor }) : new Oc10LoginAdapter({ actor })
  }

  async login({ user }: { user: User }): Promise<void> {
    const { page } = this.actor

    await this.adapter.login({ user })
    await page.waitForSelector('#web')
  }
}
