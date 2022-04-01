import { Page } from 'playwright'

export class Projects {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="files-spaces-projects"]').click()
    await this.#page.waitForSelector('#app-loading-spinner', { state: 'detached' })
  }
}
