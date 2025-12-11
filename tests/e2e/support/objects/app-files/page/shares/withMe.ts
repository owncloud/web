import { Page } from '@playwright/test'
import { Actor } from '../../../../../support/types'
import { objects } from '../../../..'
import { World } from '../../../../../cucumber/environment'

const sharesNavSelector = '//a[@data-nav-name="files-shares"]'
const openShareWithMeButton = `//a/span[text()='Open "Shared with me"']`
const shareWithMeNavSelector = '//a/span[text()="Shared with me"]'

export class WithMe {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(world: World): Promise<void> {
    await this.#page.locator(sharesNavSelector).click()
    await objects.a11y.Accessibility.assertNoSevereA11yViolations(
      this.#page,
      ['files'],
      'files page',
      world
    )
  }

  async openShareWithMeFromInternalLink(actor: Actor): Promise<void> {
    const [newTab] = await Promise.all([
      this.#page.waitForEvent('popup'),
      this.#page.locator(openShareWithMeButton).click()
    ])
    await newTab.locator(shareWithMeNavSelector).waitFor()
    actor.savePage(newTab)
  }
}
