import { Actor } from '../types'

export class RuntimePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigateToApp({ name }: { name: string }): Promise<void> {
    const { page } = this.actor
    await page.click('#_appSwitcherButton')
    await page.click(`a[href="#/${name}"]`)
  }

  async logout(): Promise<void> {
    const { page } = this.actor

    await page.click('#_userMenuButton')
    await page.click('#oc-topbar-account-logout')
  }
}
