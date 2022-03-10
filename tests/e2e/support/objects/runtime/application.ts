import { Page } from 'playwright'

export class Application {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async open({ name }: { name: string }): Promise<void> {
    await this.#page.locator('#_appSwitcherButton').click()
    await this.#page
      .locator(
        `//ul[contains(@class, "applications-list")]//a[@href="#/${name}" or @href="/${name}"]`
      )
      .click()
  }
}
