import { Page, expect } from '@playwright/test'
import { objects } from '../../../..'

export class Projects {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator('//a[@data-nav-name="files-spaces-projects"]').click()
    await this.#page.locator('#app-loading-spinner').waitFor({ state: 'detached' })
    const a11yObject = new objects.a11y.Accessibility({ page: this.#page })
    const a11yViolations = await a11yObject.getSevereAccessibilityViolations(
      a11yObject.getSelectors().filesView
    )
    expect(
      a11yViolations,
      `Found ${a11yViolations.length} severe accessibility violations in spaces page`
    ).toHaveLength(0)
  }
}
