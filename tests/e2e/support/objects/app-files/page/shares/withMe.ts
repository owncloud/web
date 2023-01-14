import { Page } from 'playwright'

const sharesNavSelector = '//a[@data-nav-name="files-shares"]'

export class WithMe {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(sharesNavSelector).click()
  }
}
