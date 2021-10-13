import { Actor } from '../../types'

export class SharedWithMePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor
    await (await page.waitForSelector('a[href="#/files/list/shared-with-me"]')).click()
  }

  async acceptShares({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
      )
      .click()
  }

  async declineShares({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-decline")]`
      )
      .click()
  }
}
