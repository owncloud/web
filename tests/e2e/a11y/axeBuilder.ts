import { test as base } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder
}

// extending base test by providing "makeAxeBuilder"
// for a consistent configuration of all AxeBuilder instance
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use, testInfo) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // decide which tags should be included in the default configuration
        //.exclude('#insert-id-of-commonly-reused-element-with-known-accessiblity-issues')
    await use(makeAxeBuilder)
  }
})
export { expect } from '@playwright/test'
