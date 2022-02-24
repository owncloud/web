import { Actor } from '../types'

export class RuntimePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigateToApp({ name }: { name: string }): Promise<void> {
    const { page } = this.actor
    await page.locator('#_appSwitcherButton').click()
    await page
      .locator(
        `//ul[contains(@class, "applications-list")]//a[@href="#/${name}" or @href="/${name}"]`
      )
      .click()
  }

  async logout(): Promise<void> {
    const { page } = this.actor

    await page.locator('#_userMenuButton').click()
    await page.locator('#oc-topbar-account-logout').click()
  }
}
