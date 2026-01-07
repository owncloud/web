import { Page, expect } from '@playwright/test'
import { objects } from '../../..'

export class General {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="admin-settings-general"]').click()
    await this.#page.locator('#app-loading-spinner').waitFor({ state: 'detached' })
    // run accessibility scan for the general management page body
    const a11yObject = new objects.a11y.Accessibility({ page: this.#page })
    const violations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().body
    )
    expect(
      violations,
      `Found ${violations.length} severe accessibility violations on General Management page`
    ).toHaveLength(0)
  }
}
