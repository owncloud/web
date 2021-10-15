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

    const acceptButton = `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
    const acceptButtonExists = await page.$(acceptButton)

    if (objectExists && acceptButtonExists) {
      await page.click(acceptButton)
    }
    await page.goto(startUrl)
  }
}
