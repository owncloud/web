import { Actor } from '../../types'
import { cta } from '../../cta'

export class SharedWithMePage {
  private readonly actor: Actor

  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
  }

  async navigate(): Promise<void> {
    const { page } = this.actor
    await page.click('a[href="#/files/list/shared-with-me"]')
  }

  async acceptShares({ name }: { name: string }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()

    this.navigate()
    const objectExists = await cta.files.resourceExists({
      page: page,
      name: name
    })

    const statusResource = await page.textContent(
      `//*[@data-test-resource-name="${name}"]/ancestor::tr//span[contains(@class, "file-row-share-status-text")]`
    )

    if (!objectExists && statusResource !== 'Accepted') {
      await page.click(`//*[@data-test-resource-name="${name}"]/ancestor::tr//button[1]`)
    }
    await page.goto(startUrl)
  }
}
