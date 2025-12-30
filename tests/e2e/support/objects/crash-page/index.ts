import { expect, Page } from '@playwright/test'
import { objects } from '../..'

const selectors = {
  page: '#page-crash'
}

export class CrashPage {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  getIsVisible() {
    return expect(this.#page.locator(selectors.page).first()).toBeVisible()
  }

  getAccessibilityViolations() {
    const a11yObject = new objects.a11y.Accessibility({ page: this.#page })
    return a11yObject.getSevereAccessibilityViolations(selectors.page)
  }
}
