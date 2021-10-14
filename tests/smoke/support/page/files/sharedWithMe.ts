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
<<<<<<< HEAD
    await page
      .locator(
        `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class, "file-row-share-status-accept")]`
      )
      .click()
=======
    const startUrl = page.url()

    this.navigate()
    const objectExists = await cta.files.resourceExists({
      page: page,
      name: name
    })

    if (!objectExists) {
      await (
        await page.waitForSelector(
          `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class,"oc-button-success")]`
        )
      ).click()
    }
    await page.goto(startUrl)
    await page.reload()
  }

  async declineShares({ name }: { name: string }): Promise<void> {
    const { page } = this.actor
    const startUrl = page.url()

    this.navigate()
    const objectExists = await cta.files.resourceExists({
      page: page,
      name: name
    })

    if (!objectExists) {
      await (
        await page.waitForSelector(
          `//*[@data-test-resource-name="${name}"]/ancestor::tr//button[contains(@class,"oc-button-passive-outline")]`
        )
      ).click()
    }
    await page.goto(startUrl)
    await page.reload()
>>>>>>> 1dd54fe5 (add checking version)
  }
}
