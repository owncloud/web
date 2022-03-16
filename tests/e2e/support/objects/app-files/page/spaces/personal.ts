import { Page } from 'playwright'

export class Personal {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="files-spaces-personal-home"]').click()
  }
}
