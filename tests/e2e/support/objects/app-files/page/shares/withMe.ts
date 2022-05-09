import { Page } from 'playwright'

const sharesOptionSelector = '//a[@data-nav-name="files-shares-with-me"]'

export class WithMe {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(sharesOptionSelector).click()
  }
}
