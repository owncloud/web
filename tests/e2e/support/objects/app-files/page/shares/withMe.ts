import { Page } from '@playwright/test'
import type { Actor } from '../../../../../support/types'
import { objects } from '../../../..'

const sharesNavSelector = '//a[@data-nav-name="files-shares"]'
const openShareWithMeButton = `//a/span[text()='Open "Shared with me"']`
const shareWithMeNavSelector = '//a/span[text()="Shared with me"]'

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
