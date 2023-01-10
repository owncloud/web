import { Page } from 'playwright'
import { Actor } from '../../../../../support/types'

const sharesNavSelector = '//a[@data-nav-name="files-shares"]'
const shareWithMeNavButton = `//a/span[text()='Open "Shared with me"']`

export class WithMe {
  #page: Page

  constructor({ page }: { page: Page }) {
    this.#page = page
  }

  async navigate(): Promise<void> {
    await this.#page.locator(sharesNavSelector).click()
  }

  async openShareWithMeFromInternalLink(actor: Actor): Promise<void> {
    const [newTab] = await Promise.all([
      this.#page.waitForEvent('popup'),
      this.#page.locator(shareWithMeNavButton).click()
    ])
    await newTab.waitForSelector('#shares-navigation')
    await actor.updatePage(newTab)
  }
}
