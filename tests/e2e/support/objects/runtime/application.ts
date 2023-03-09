import { Page } from 'playwright'
import util from 'util'

const appSwitcherButton = '#_appSwitcherButton'
const appSelector = `//ul[contains(@class, "applications-list")]//a[@href="#/%s" or @href="/%s"]`
export class Application {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async reloadPage(): Promise<void> {
    await this.#page.reload()
  }

  async open({ name }: { name: string }): Promise<void> {
    await this.#page.locator(appSwitcherButton).click()
    await this.#page.locator(util.format(appSelector, name, name)).click()
  }
}
