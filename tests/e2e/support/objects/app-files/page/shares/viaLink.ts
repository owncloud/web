import { Page } from '@playwright/test'

const sharesNavSelector = '//a[@data-nav-name="files-shares"]'

export class ViaLink {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(sharesNavSelector).click()
    await this.#page.getByText('Shared via link').click()
  }
}
