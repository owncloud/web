import { Page } from '@playwright/test'
import { objects } from '../../../..'

const sharesNavSelector = '//a[@data-nav-name="files-shares"]'

export class WithMe {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(sharesNavSelector).click()
    await objects.a11y.Accessibility.assertNoSevereA11yViolations(
      this.#page,
      ['files'],
      'files page'
    )
  }
}
