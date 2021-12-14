import { Actor } from '../../types'

export class SharedWithMePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor
    await page.click('a[href="#/files/list/shared-with-me"]')
  }

  async acceptShare({ name }: { name: string }): Promise<void> {
    const { page } = this.actor
    const acceptShareButton = page.locator(
      `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
    )

    await acceptShareButton.click()
    await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
  }

  async declineShare({ name }: { name: string }): Promise<void> {
    const { page } = this.actor
    const declineShareButton = page.locator(
      `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-decline")]`
    )

    await declineShareButton.click()
    await page.waitForResponse((resp) => resp.url().includes('shares') && resp.status() === 200)
  }
}
