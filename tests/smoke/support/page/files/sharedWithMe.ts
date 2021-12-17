import { Actor } from '../../types'

export class SharedWithMePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor
    await page.locator('a[href="#/files/list/shared-with-me"]').click()
  }

  async acceptShare({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
      )
      .click()
    await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
  }

  async declineShare({ name }: { name: string }): Promise<void> {
    const { page } = this.actor

    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-decline")]`
      )
      .click()
    await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
  }
}
